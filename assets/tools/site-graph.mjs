// Site graph builder — vertices are HTML files, edges are the jump relations between them.
// The JSON is the data contract (for agents); the graph-viewer tree renders it (for humans); this
// script emits the JSON plus that tree as a self-contained folder. Reporting tool: it exits 0 even
// when it finds problems — check-solvable.mjs / check-links.mjs remain the gatekeepers.
//
// Ceilings (same as check-solvable.mjs, which shares this core): only static href / action /
// data-next are followed — Alpine :href bindings are invisible; a derived credential is recorded
// as rule + components, never as the assembled value; route claims are structural or heuristic,
// and heuristic ones are confirmed by a human against docs/reachability.md.
// Invariant: every page the walk reaches has an inbound edge here — a link form this tool fails to model
// surfaces as a `walk-divergence` problem, never as a silent `unreachable` verdict.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, mkdtempSync, rmSync, cpSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

import CONFIG from './config.mjs';
import { analyze, hash, relOf, visible, nextOf } from './site-model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const VIEWER_DIR = join(HERE, '..', 'viewer');
const TEMPLATE_PATH = join(VIEWER_DIR, 'graph-viewer.html');
const FIXTURE = join(HERE, '..', 'fixtures', 'mini-site');
const SCHEMA = 'novel2arg/site-graph/v1';

const BREADCRUMB_RE = /^\s*(返回|back to|«|←|‹)/i;
const BLOCKED_KINDS = new Set(['gate-next', 'post-unlock']);
const groupBy = (arr, key) => {
  const m = new Map();
  for (const x of arr) { const k = typeof key === 'function' ? key(x) : x[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(x); }
  return m;
};

function titleOf(html) { const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i); return m ? visible(m[1]).trim() : null; }

// M7 progress: body data-page/data-total is authoritative; the footer .progress span is the
// fallback; deep pages may carry anomalous markers (ex/36, ?/36) — recorded, never a defect.
function progressOf(html) {
  const body = (html.match(/<body[^>]*>/i) ?? [''])[0];
  const pageM = body.match(/\bdata-page\s*=\s*["']([^"']+)["']/i);
  const totalM = body.match(/\bdata-total\s*=\s*["']([^"']+)["']/i);
  const footM = html.match(/<span[^>]*class\s*=\s*["'][^"']*\bprogress\b[^"']*["'][^>]*>\s*([^<]+?)\s*</i);
  const footerRaw = footM ? footM[1] : null;
  const num = (s) => (/^\d+$/.test(s ?? '') ? Number(s) : null);
  if (pageM || totalM) {
    const page = pageM ? pageM[1].trim() : null;
    const total = totalM ? totalM[1].trim() : null;
    const raw = `${page ?? '?'}/${total ?? '?'}`;
    return { progress: { page: num(page), total: num(total), raw, anomalous: num(page) === null, source: 'data-attr' },
      footerRaw, mismatch: footerRaw !== null && footerRaw !== raw };
  }
  if (footerRaw) {
    const [p, t] = footerRaw.split('/');
    return { progress: { page: num(p?.trim()), total: num(t?.trim()), raw: footerRaw, anomalous: num(p?.trim()) === null, source: 'footer' },
      footerRaw, mismatch: false };
  }
  return { progress: { page: null, total: null, raw: null, anomalous: false, source: 'none' }, footerRaw: null, mismatch: false };
}

// Where an anchor lives: header / nav / footer ranges, plus the post-gate (unlocked) range —
// the same first-unlock-marker → next </main> rule splitLocked uses.
function rangesOf(html) {
  const rangeOf = (re) => { const out = []; let m; while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]); return out; };
  let unlockedRange = null;
  for (const marker of CONFIG.unlockMarkers) {
    const m = marker.exec(html);
    if (!m) continue;
    const end = html.indexOf(CONFIG.unlockEnd, m.index);
    unlockedRange = [m.index, end === -1 ? html.length : end];
    break;
  }
  return { header: rangeOf(/<header[\s\S]*?<\/header>/gi), footer: rangeOf(/<footer[\s\S]*?<\/footer>/gi),
    nav: rangeOf(/<nav[\s\S]*?<\/nav>/gi), unlocked: unlockedRange ? [unlockedRange] : [] };
}
const inAny = (ranges, i) => ranges.some(([s, e]) => i >= s && i < e);

// Every jump relation this tool can see, with where it sits on the page. Anchors and <form action> both
// count: the walk (site-model linksOf) follows `href` and `action` alike, so a graph built from anchors
// alone would call a form-reached page unreachable while the walk reaches it.
function extractAnchors(root, file, html, rg) {
  const out = [];
  const whereOf = (i) => inAny(rg.footer, i) ? 'footer'
    : inAny(rg.header, i) || inAny(rg.nav, i) ? 'header'
    : inAny(rg.unlocked, i) ? 'unlocked' : 'body';
  const target = (raw) => {
    if (!raw || raw.startsWith('#') || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(raw)) return null;
    const u = raw.split('?')[0].split('#')[0];
    return u.endsWith('.html') ? u : null;
  };
  let m;
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  while ((m = re.exec(html))) {
    const h = m[1].match(/\bhref\s*=\s*["']([^"']*)["']/i);
    if (!h) continue;
    const u = target(h[1]);
    if (!u) continue;
    out.push({ to: relOf(root, join(dirname(file), u)), href: h[1], text: visible(m[2]).trim(), where: whereOf(m.index), form: false });
  }
  const fre = /<form\b([^>]*)>/gi;
  while ((m = fre.exec(html))) {
    const a = m[1].match(/\baction\s*=\s*["']([^"']*)["']/i);
    if (!a) continue;
    const u = target(a[1]);
    if (!u) continue;
    out.push({ to: relOf(root, join(dirname(file), u)), href: a[1], text: '', where: whereOf(m.index), form: true });
  }
  return out;
}

function buildGraph(root) {
  const a = analyze(root);
  const { pages, names, gatePages, visited, gateSrc, searchEdges, readableHits, kwHashToUrls, kwTableUrls } = a;

  /* derived-credential manifest (dev-only; assembled values never enter the graph) */
  const derived = [];
  const manifestPath = join(root, CONFIG.credTable);
  if (existsSync(manifestPath)) {
    for (const [gate, fields] of Object.entries(JSON.parse(readFileSync(manifestPath, 'utf8')))) {
      if (gate.startsWith('_')) continue;
      for (const f of fields) derived.push({ gate, value: f.value, rule: f.rule ?? null, kind: f.kind ?? 'fact', components: f.components ?? [] });
    }
  }

  /* ── edge drafts: structural classification, then body-vs-list grouping ── */
  const restricted = (id) => {
    const rel = id.startsWith(CONFIG.pagesDir + '/') ? id.slice(CONFIG.pagesDir.length + 1) : id;
    return CONFIG.secretUrl.test(rel);
  };
  const drafts = [];
  const seen = new Set();
  const add = (e) => { const k = `${e.from}|${e.to}|${e.kind}`; if (!seen.has(k)) { seen.add(k); drafts.push(e); } };
  const bodyAnchors = [];
  for (const id of names) {
    const rg = rangesOf(pages[id].html);
    for (const anc of extractAnchors(root, join(root, id), pages[id].html, rg)) {
      let kind = null, route = null, chrome = false;
      if (id === CONFIG.entry) { kind = 'start'; route = 0; }
      else if (anc.where === 'footer') { kind = 'footer'; route = 3; chrome = true; }
      else if (anc.where === 'header') { kind = 'nav'; route = 1; chrome = true; }
      else if (anc.where === 'unlocked') { kind = 'post-unlock'; route = 5; }
      // A body form is its own kind: the submission target is a structural jump the issuing page owns
      // (a query form's result page is the listing that page serves — step-4 route 2).
      else if (anc.form) { kind = 'form'; route = 2; }
      else if (BREADCRUMB_RE.test(anc.text)) { kind = 'breadcrumb'; route = 6; }
      if (kind) {
        // a free route into the restricted area is the R7/R8 defect: no legitimate route at all
        if (kind !== 'post-unlock' && restricted(anc.to)) route = null;
        add({ from: id, to: anc.to, kind, chrome, evidence: anc.href, route, routeClaim: route == null ? 'none' : 'structural' });
      }
      else bodyAnchors.push({ from: id, to: anc.to, href: anc.href });
    }
    for (const u of nextOf(root, pages[id].rawLocked, join(root, id))) {
      add({ from: id, to: u, kind: 'gate-next', chrome: false, evidence: 'data-next', route: 5, routeClaim: 'structural' });
    }
  }
  for (const [from, anchors] of groupBy(bodyAnchors, 'from')) {
    for (const [, group] of groupBy(anchors, (x) => dirname(x.to))) {
      const list = group.length >= 3;
      const route = restricted(group[0].to) ? null : list ? 2 : 7;
      for (const m of group) add({ from, to: m.to, kind: list ? 'list' : 'body', chrome: false, evidence: m.href, route, routeClaim: route == null ? 'none' : list ? 'structural' : 'heuristic' });
    }
  }
  for (const s of searchEdges) {
    add({ from: s.searchPage, to: s.target, kind: 'search', chrome: false,
      evidence: `keyword:${s.keyword ?? '#' + s.hash.slice(0, 8)}`, route: 4, routeClaim: 'structural', _search: s });
  }

  /* ── guards: what each edge costs, and where the key comes from ── */
  const grantsOf = (identity) => names.filter((g) => pages[g].fields.length && pages[g].grants.includes(identity));
  const edges = drafts.map((d) => {
    const requires = pages[d.to] ? pages[d.to].access : [];
    const grantedBy = [...new Set(requires.flatMap(grantsOf))];
    let guard = null;
    if (BLOCKED_KINDS.has(d.kind)) {
      // Complete verbatim provenance over the FINAL reachable set (not the at-unlock snapshot the
      // walk records), so the graph shows every page that supplies the credential — the audit view.
      const fields = pages[d.from].fields.map((fld) => {
        const alts = [];
        for (const h of fld) {
          for (const q of visited) {
            if (q === d.from) continue;
            const hits = readableHits(q);
            if (hits.has(h)) alts.push({ plain: hits.get(h), from: q, afterGate: pages[q].blocked });
          }
        }
        if (alts.length) return { via: 'verbatim', plain: alts[0].plain, sources: alts.map((s) => ({ page: s.from, afterGate: s.afterGate })) };
        const dv = derived.find((x) => x.gate === d.from && fld.includes(hash(x.value)));
        if (dv) return { via: 'derived', rule: dv.rule, components: dv.components.map((c) => ({ page: c.page, text: c.text })) };
        return { via: 'unknown', status: 'NO CLUE' };
      });
      guard = { type: 'credential', fields, requires, grantedBy };
    } else if (d.kind === 'search') {
      const s = d._search;
      guard = { type: 'keyword', keyword: s.keyword, hash: s.hash,
        sources: s.readOn.map((q) => ({ page: q, afterGate: pages[q].blocked })), requires, grantedBy };
    } else if (requires.length) {
      guard = { type: 'account', requires, grantedBy };
    }
    return { from: d.from, to: d.to, kind: d.kind, chrome: d.chrome, evidence: d.evidence, guard, route: d.route, routeClaim: d.routeClaim };
  });

  /* ── hops: BFS from the entry over the edges the final walk state activates ── */
  const adj = new Map();
  for (const e of edges) {
    if (BLOCKED_KINDS.has(e.kind) && !gateSrc.has(e.from)) continue;
    if (!visited.has(e.from) || !visited.has(e.to)) continue;
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e.to);
  }
  const hops = new Map([[CONFIG.entry, 0]]);
  for (let frontier = [CONFIG.entry]; frontier.length;) {
    const next = [];
    for (const f of frontier) for (const t of adj.get(f) ?? []) if (!hops.has(t)) { hops.set(t, hops.get(f) + 1); next.push(t); }
    frontier = next;
  }

  /* ── nodes ── */
  const gateHashSet = new Set();
  for (const n of names) for (const fld of pages[n].fields) for (const h of fld) gateHashSet.add(h);
  const nodes = names.map((id) => {
    const p = pages[id];
    const { progress, footerRaw, mismatch } = progressOf(p.html);
    const supplies = [...p.hitsAll.entries()].map(([h, plain]) => ({
      kind: gateHashSet.has(h) ? 'credential' : kwHashToUrls.has(h) ? 'keyword' : null, plain, hash: h, afterGate: p.blocked,
    })).filter((s) => s.kind);
    const node = {
      id, title: titleOf(p.html),
      role: id === CONFIG.entry ? 'entry' : p.fields.length ? 'gate' : p.isSearch ? 'search' : p.access.length ? 'restricted' : 'public',
      isEntry: id === CONFIG.entry, isSearch: p.isSearch, indexes: p.indexes,
      gate: p.fields.length ? { fields: p.fields.map((f) => ({ hashes: f, synonyms: f.length })), grants: p.grants } : null,
      access: p.access, blocked: p.blocked,
      hops: hops.get(id) ?? null, reachable: hops.has(id), progress, supplies,
    };
    if (mismatch) node.progressMismatch = { dataAttr: progress.raw, footer: footerRaw };
    return node;
  });

  /* ── edges: progress delta + back-jump flag ── */
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edgesOut = edges.map((e) => {
    const from = nodeById.get(e.from), to = nodeById.get(e.to);
    const progressDelta = from?.progress.page != null && to?.progress.page != null ? to.progress.page - from.progress.page : null;
    const backJump = progressDelta != null && progressDelta < 0 && !e.chrome && e.kind !== 'breadcrumb';
    return { ...e, progressDelta, backJump };
  });

  /* ── problems ── */
  const problems = [];
  for (const n of nodes) if (!n.reachable) problems.push({ type: 'unreachable', detail: n.id });
  // The design promise is that the graph can never disagree with the walk. Both read the same core, but
  // this tool only draws edges it can classify: a jump form it does not model would leave a page the walk
  // reaches sitting at hops:null here. Report that instead of hiding it behind a plausible-looking graph.
  for (const v of visited) if (!hops.has(v)) problems.push({ type: 'walk-divergence', detail: v });
  for (const g of gatePages) {
    if (gateSrc.has(g)) continue;
    const fields = pages[g].fields.map((fld) => (fld.some((h) => [...visited].some((q) => q !== g && readableHits(q).has(h))) ? 'traceable' : 'NO CLUE'));
    if (fields.includes('NO CLUE')) problems.push({ type: 'stuck-gate', page: g, fields, ...(visited.has(g) ? {} : { note: 'the gate page itself is unreachable' }) });
  }
  for (const e of edgesOut) if (!pages[e.to]) problems.push({ type: 'dead-target', edge: `${e.from} → ${e.to}` });
  for (const e of edgesOut) if (e.route === null) problems.push({ type: 'no-route', edge: `${e.from} → ${e.to}` });
  for (const [table, urls] of kwTableUrls) {
    if (!CONFIG.surfaceTable.test(table)) continue;
    for (const u of urls) if (CONFIG.secretUrl.test(u)) problems.push({ type: 'layer-leak', table, url: u });
  }
  const byPage = new Map();
  for (const n of nodes) if (n.progress.page != null) { if (!byPage.has(n.progress.page)) byPage.set(n.progress.page, []); byPage.get(n.progress.page).push(n.id); }
  for (const [page, ids] of byPage) if (ids.length > 1) problems.push({ type: 'progress-duplicate', page, nodes: ids });
  for (const n of nodes) if (n.progressMismatch) problems.push({ type: 'progress-mismatch', node: n.id, dataAttr: n.progressMismatch.dataAttr, footer: n.progressMismatch.footer });

  const stats = {
    pages: names.length, edges: edgesOut.length,
    chromeEdges: edgesOut.filter((e) => e.chrome).length,
    guardedEdges: edgesOut.filter((e) => e.guard).length,
    searchEdges: edgesOut.filter((e) => e.kind === 'search').length,
    gates: gatePages.length, gatesUnlocked: gateSrc.size,
    reachable: nodes.filter((n) => n.reachable).length,
    unreachable: nodes.filter((n) => !n.reachable).length,
    progressCoverage: `${nodes.filter((n) => n.progress.source !== 'none').length}/${nodes.length}`,
    backJumps: edgesOut.filter((e) => e.backJump).length,
    problems: problems.length,
  };
  return { schema: SCHEMA, generatedBy: 'tools/site-graph.mjs', generatedAt: new Date().toISOString(),
    root, config: { entry: CONFIG.entry, pagesDir: CONFIG.pagesDir, dataDir: CONFIG.dataDir, secretUrl: String(CONFIG.secretUrl) },
    stats, nodes, edges: edgesOut, problems };
}

/* ── Self-test: build the fixture's graph and assert the contract ── */
function selfTest() {
  let fail = 0;
  const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) fail++; };
  const g = buildGraph(FIXTURE);

  ok(g.schema === SCHEMA, 'schema id');
  ok(g.stats.pages === 14, `14 pages (got ${g.stats.pages})`);
  ok(g.stats.reachable === 13, `13 reachable (got ${g.stats.reachable})`);
  ok(g.stats.unreachable === 1, `1 unreachable (got ${g.stats.unreachable})`);
  ok(g.stats.gates === 2 && g.stats.gatesUnlocked === 1, `gates 2, unlocked 1 (got ${g.stats.gates}/${g.stats.gatesUnlocked})`);
  ok(g.stats.progressCoverage === '12/14', `progress coverage 12/14 (got ${g.stats.progressCoverage})`);

  const kinds = new Set(g.edges.map((e) => e.kind));
  for (const k of ['start', 'nav', 'footer', 'breadcrumb', 'list', 'body', 'form', 'gate-next', 'post-unlock', 'search']) ok(kinds.has(k), `kind present: ${k}`);

  // A page reachable only through a <form action> must be a vertex with an inbound edge: the walk follows
  // action= (site-model linksOf), so a graph built from anchors alone would disagree with it.
  const form = g.edges.find((e) => e.kind === 'form');
  ok(form?.from === 'search.html' && form.to === 'results.html', 'form edge search → results');
  ok(form.route === 2 && form.routeClaim === 'structural' && form.chrome === false, 'form edge route 2 structural, not chrome');
  const resultsNode = g.nodes.find((n) => n.id === 'results.html');
  ok(resultsNode?.reachable === true && resultsNode.hops === 3, 'form-reached results page reachable at 3 hops');
  ok(g.nodes.find((n) => n.id === 'pages/news-01.html').reachable === true, 'pages behind the results list stay reachable');

  // CONFIG.skipDirs: viewer/ (renderer template) and docs/ (artifacts) are never site pages. Without the
  // skip, the fixture would report one extra vertex here and another on every re-run after an emit.
  ok(!g.nodes.some((n) => n.id.startsWith('viewer/') || n.id.startsWith('docs/')), 'viewer/ and docs/ never become vertices');
  ok(g.nodes.length === 14, 'no dev-dir file inflated the vertex set');

  const gateNext = g.edges.find((e) => e.kind === 'gate-next');
  ok(gateNext?.from === 'pages/login.html' && gateNext.to === 'pages/internal/s22-diary.html', 'gate-next edge login → s22');
  ok(gateNext.guard?.type === 'credential' && gateNext.guard.fields[0].via === 'verbatim', 'verbatim credential guard');
  ok(gateNext.guard.fields[0].plain === '陈守义', 'verbatim plain recorded');
  ok(gateNext.guard.fields[0].sources.some((s) => s.page === 'pages/staff-chen.html'), 'provenance includes staff-chen');
  ok(gateNext.guard.fields[0].sources.length === 2, 'two verbatim sources (staff list entry + detail page)');
  ok(JSON.stringify(gateNext.guard.requires) === JSON.stringify(['chen']), 'requires chen');
  ok(JSON.stringify(gateNext.guard.grantedBy) === JSON.stringify(['pages/login.html']), 'grantedBy login');
  ok(gateNext.route === 5 && gateNext.routeClaim === 'structural', 'route 5 structural');

  const post = g.edges.find((e) => e.kind === 'post-unlock');
  ok(post?.guard?.fields[0].via === 'derived', 'derived guard on the post-unlock edge');
  ok(post.guard.fields[0].rule === 'surname pinyin + archive number', 'derived rule recorded');
  ok(post.guard.fields[0].components.length === 2, 'two components');
  ok(!JSON.stringify(g).includes('chen0751'), 'assembled derived value never written');

  const search = g.edges.find((e) => e.kind === 'search' && e.to === 'pages/internal/s21-ledger.html');
  ok(search?.from === 'pages/internal/s22-diary.html', 'search edge s22 → s21');
  ok(search.guard?.type === 'keyword' && search.guard.keyword === '丙辰年', 'keyword guard with plaintext');
  ok(JSON.stringify(search.guard.sources) === JSON.stringify([{ page: 'pages/news-01.html', afterGate: false }]), 'keyword read on news-01');

  const listEdges = g.edges.filter((e) => e.kind === 'list');
  ok(listEdges.length === 6 && listEdges.every((e) => e.route === 2), 'six list edges, route 2');
  ok(listEdges.filter((e) => e.from === 'pages/news.html').length === 3, 'news.html lists three entries');
  ok(listEdges.filter((e) => e.from === 'results.html').length === 3, 'results.html lists three entries');
  const bodyEdge = g.edges.find((e) => e.from === 'pages/staff.html' && e.kind === 'body');
  ok(bodyEdge?.route === 7 && bodyEdge.routeClaim === 'heuristic', 'single body link → route 7 heuristic');
  const crumb = g.edges.find((e) => e.kind === 'breadcrumb');
  ok(crumb?.route === 6, 'breadcrumb → route 6');
  ok(g.edges.some((e) => e.kind === 'nav' && e.chrome) && g.edges.some((e) => e.kind === 'footer' && e.chrome), 'nav/footer marked chrome');

  const probs = g.problems.map((p) => p.type);
  ok(probs.includes('unreachable') && probs.includes('stuck-gate') && probs.includes('progress-mismatch'), 'planted defects reported');
  ok(!probs.includes('no-route'), 'every fixture edge claims a legitimate route');
  ok(!probs.includes('walk-divergence'), 'the graph reaches exactly the pages the walk reaches');
  const stuck = g.problems.find((p) => p.type === 'stuck-gate');
  ok(stuck?.page === 'pages/internal/s22-diary.html' && stuck.fields[0] === 'NO CLUE', 's22 stuck, NO CLUE');
  const orphanNode = g.nodes.find((n) => n.id === 'pages/orphan.html');
  ok(orphanNode.reachable === false && orphanNode.hops === null, 'orphan unreachable, hops null');
  const back = g.edges.find((e) => e.from === 'pages/orphan.html' && e.backJump);
  ok(back?.to === 'pages/home.html' && back.progressDelta === -10, 'back-jump flagged on orphan → home');
  const anom = g.nodes.find((n) => n.id === 'pages/internal/s21-ledger.html');
  ok(anom.progress.anomalous === true && anom.progress.page === null, 'anomalous deep-page marker');
  ok(g.nodes.find((n) => n.id === 'search.html').progress.source === 'footer', 'footer-only progress');
  ok(g.nodes.find((n) => n.id === 'index.html').progress.source === 'none', 'entry page unnumbered');
  const supplies = g.nodes.find((n) => n.id === 'pages/staff-chen.html').supplies;
  ok(supplies.some((s) => s.kind === 'credential' && s.plain === '陈守义'), 'supplies: verbatim credential');
  ok(g.nodes.find((n) => n.id === 'pages/internal/s22-diary.html').isSearch === true, 's22 flagged as search surface');

  const tmp = mkdtempSync(join(tmpdir(), 'site-graph-'));
  try {
    const { jsonPath, htmlPath } = emit(g, FIXTURE, join(tmp, 'g'));
    ok(existsSync(jsonPath) && existsSync(htmlPath), 'json + viewer index emitted');
    const back2 = JSON.parse(readFileSync(jsonPath, 'utf8'));
    ok(back2.schema === SCHEMA && back2.nodes.length === 14, 'emitted JSON round-trips');
    const html = readFileSync(htmlPath, 'utf8');
    ok(html.includes('pages/login.html'), 'JSON injected into the viewer');
    // self-contained folder: every relative ref (css/, js/, js/vendor/) resolves inside the artifact
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
    const set = join(tmp, 'g');
    ok(refs.length === 10 && refs.every((r) => !/^([a-z]+:|\/)/.test(r) && existsSync(join(set, r))), `all ${refs.length} tree refs emitted into the viewer folder`);
    for (const r of refs.filter((r) => r.endsWith('.js'))) new Function(readFileSync(join(set, r), 'utf8'));   // parse-only: SyntaxError means a viewer file is broken
    ok(true, 'every emitted js parses');
    ok(readFileSync(join(set, 'css/base.css'), 'utf8').includes('.masthead') && readFileSync(join(set, 'css/canvas.css'), 'utf8').includes('.node'), 'both stylesheets emitted');
    ok(existsSync(join(set, 'js/vendor/alpine.js')), 'vendored runtime copied into the artifact');

    // the pure layout core is behavior-tested in node — no DOM needed
    const core = new Function(['js/lib/dom.js', 'js/lib/legend.js', 'js/lib/layout.js'].map((f) => readFileSync(join(VIEWER_DIR, f), 'utf8')).join('\n')
      + '\nreturn { visibleEdges, layout, edgePath, KIND_STYLE };')();
    const allKinds = Object.fromEntries(Object.keys(core.KIND_STYLE).map((k) => [k, true]));
    const edges = core.visibleEdges(g, { chrome: true, kinds: allKinds, filter: '' });
    const L = core.layout(g.nodes, edges);
    ok(L.pos.get('index.html')?.x === 34 && L.pos.get('index.html')?.y === 34, 'entry sits at the layout origin');
    ok(L.byRank.get(0).length === 1 && L.byRank.get(0)[0].id === 'index.html', 'hop-0 rank holds only the entry');
    const orphanRank = Math.max(...L.byRank.keys());
    ok(L.byRank.get(orphanRank).some((n) => n.id === 'pages/orphan.html'), 'unreachable pages form the trailing orphan rank');
    ok(core.visibleEdges(g, { chrome: false, kinds: allKinds, filter: '' }).length < edges.length, 'chrome-off shrinks the visible edge set');
    // routing: forward drops rank to rank, same-rank arcs the gap above the rank, back edges take the margin bus
    ok(core.edgePath({ x: 34, y: 34 }, { x: 34, y: 180 }) === 'M130,88 C130,132 130,136 130,180', 'forward edge drops rank to rank');
    ok(core.edgePath({ x: 34, y: 180 }, { x: 262, y: 180 }) === 'M130,180 C130,134 358,134 358,180', 'same-rank edge arcs through the gap above the rank');
    ok(core.edgePath({ x: 34, y: 400 }, { x: 34, y: 34 }, 900) === 'M226,427 C900,427 900,61 226,61', 'back edge runs the margin bus into the target side');
    const back = edges.find((e) => e.from === 'pages/orphan.html' && e.to === 'pages/home.html');
    const maxRight = Math.max(...g.nodes.map((n) => (L.pos.get(n.id)?.x ?? 0) + 192));
    const busX = Math.max(...[...L.paths.get(back).matchAll(/[C ](\d+(?:\.\d+)?),/g)].map((m) => Number(m[1])));
    ok(busX > maxRight, 'the orphan back edge runs clear of every card, in the right margin');
  } finally { rmSync(tmp, { recursive: true, force: true }); }

  console.log(fail ? `\nself-test FAILED — ${fail} check(s)` : '\nself-test ok — graph builds, provenance resolves, defects surface');
  process.exit(fail ? 1 : 0);
}

// The viewer is a tree: the template html references its assets by plain relative paths
// (css/base.css, js/lib/dom.js, js/vendor/alpine.js), so emit copies the whole tree into the
// output folder and only injects the JSON. The vendored Alpine runtime (pinned + sha256-verified
// by tools/vendor-alpine.mjs, never a CDN) is copied into the artifact's own js/vendor/ — a
// relative src pointing outside would escape the server root the moment docs/ itself is served,
// which is exactly how the artifact gets opened.
function emit(graph, root, outDir, { json = true, html = true } = {}) {
  mkdirSync(outDir, { recursive: true });
  const jsonPath = `${outDir}.json`;            // the agent-facing contract sits beside the viewer folder
  const htmlPath = join(outDir, 'index.html');
  if (json) writeFileSync(jsonPath, JSON.stringify(graph, null, 1));
  if (html) {
    writeFileSync(htmlPath, readFileSync(TEMPLATE_PATH, 'utf8').replace('__SITE_GRAPH_JSON__', JSON.stringify(graph).replace(/</g, '\\u003c')));
    cpSync(VIEWER_DIR, outDir, { recursive: true, filter: (src) => !src.endsWith('graph-viewer.html') });
    const runtime = join(root, 'assets/js/vendor/alpine.min.js');
    if (existsSync(runtime)) {
      mkdirSync(join(outDir, 'js', 'vendor'), { recursive: true });
      copyFileSync(runtime, join(outDir, 'js', 'vendor', 'alpine.js'));
    } else console.error(`! vendored Alpine not found at ${relOf(root, runtime)} — run node tools/vendor-alpine.mjs; the viewer will show a banner instead of the graph`);
  }
  return { jsonPath, htmlPath };
}

if (process.argv.includes('--self-test')) selfTest();

/* ── CLI ── */
function main() {
  const val = (flag) => { const i = process.argv.indexOf(flag); return i === -1 ? null : process.argv[i + 1]; };
  const root = resolve(val('--root') ?? '.');
  if (!existsSync(join(root, CONFIG.entry))) { console.error(`ERROR  entry page ${CONFIG.entry} not found under ${root}`); process.exit(1); }
  const noJson = process.argv.includes('--no-json');
  const noHtml = process.argv.includes('--no-html');
  if (noJson && noHtml) { console.error('ERROR  --no-json with --no-html writes nothing'); process.exit(1); }
  const graph = buildGraph(root);
  const outDir = resolve(root, val('--out') ?? 'docs/site-graph');
  const { jsonPath, htmlPath } = emit(graph, root, outDir, { json: !noJson, html: !noHtml });
  const s = graph.stats;
  console.log(`site-graph — ${s.pages} pages · ${s.edges} edges · gates ${s.gatesUnlocked}/${s.gates} · unreachable ${s.unreachable} · problems ${s.problems}`);
  for (const p of graph.problems) console.log(`  ! ${p.type}${p.page ? ' — ' + p.page : ''}${p.node ? ' — ' + p.node : ''}${p.detail ? ' — ' + p.detail : ''}`);
  if (!noJson) console.log(`wrote ${relOf(root, jsonPath)}`);
  if (!noHtml) console.log(`wrote ${relOf(root, htmlPath)} — viewer tree under ${relOf(root, outDir)}/`);
  process.exit(0);   // reporting tool: problems are data, not failure
}
main();
