// Shared site-parsing and walk core for the novel2arg tools. Extracted verbatim from
// check-solvable.mjs (behavior-preserving); consumed by check-solvable.mjs (reporter) and
// site-graph.mjs (graph builder). Every function takes `root` explicitly — no process.cwd()
// inside. Project conventions come from the shared config.mjs.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

import CONFIG from './config.mjs';   // shared conventions; defaults match references/structure/base.md

export const hash = (w) => createHash('md5').update(String(w).trim().toLowerCase()).digest('base64');
const SKIP = /[\s<>"'`{}[\],.;:!?/\\|()（）「」『』·、。，；：！？—…]/;
const EDGE = /^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu;

// Every *.html under `root`, minus the dev/ops directories (CONFIG.skipDirs): tools/, viewer/ (the graph
// renderer template), docs/ (artifacts) and deploy/ hold no site page, so a walk that descends into them
// invents vertices — and, worse, makes the page count change between two runs once site-graph has written
// docs/site-graph/. One skip list, shared with check-credentials.mjs (config.mjs).
export function walkFiles(root, acc = []) {
  for (const name of readdirSync(root)) {
    if (CONFIG.skipDirs.includes(name) || name.startsWith('.')) continue;
    const p = join(root, name);
    if (statSync(p).isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}
export const relOf = (root, p) => relative(root, p).split('\\').join('/');

/* ── Page parsing ── */
export const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
export function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const hex = e[1] === 'x' || e[1] === 'X';
      const n = parseInt(e.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}
export function splitLocked(t) {
  for (const marker of CONFIG.unlockMarkers) {
    const m = marker.exec(t);
    if (!m) continue;
    const end = t.indexOf(CONFIG.unlockEnd, m.index);
    return { locked: t.slice(0, m.index), unlocked: t.slice(m.index, end === -1 ? t.length : end) };
  }
  return { locked: t, unlocked: '' };
}
export function visible(html) {
  return decodeEntities(html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
}

// Candidate strings a player could have read on the page: compact character windows plus word n-grams.
export function candidates(text) {
  const out = new Set();
  for (let len = 1; len <= CONFIG.maxTokenLen; len++) {
    for (let i = 0; i + len <= text.length; i++) {
      const w = text.slice(i, i + len);
      if (!SKIP.test(w)) out.add(w);
    }
  }
  const words = text.split(/\s+/).map((w) => w.replace(EDGE, '')).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    let phrase = '';
    for (let n = 0; n < CONFIG.maxPhraseWords && i + n < words.length; n++) {
      phrase = n ? `${phrase} ${words[i + n]}` : words[i + n];
      if (phrase.length > CONFIG.maxPhraseLen) break;
      out.add(phrase);
    }
  }
  return out;
}

export function linksOf(root, frag, fromFile) {
  const out = new Set();
  const re = /\s(?:href|action)\s*=\s*(["'])([^"']*)\1/gi;
  let m;
  while ((m = re.exec(frag))) {
    const raw = m[2];
    if (raw.startsWith('#')) continue;
    const u = raw.split('?')[0].split('#')[0];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(u) || !u.endsWith('.html')) continue;
    out.add(relOf(root, join(dirname(fromFile), u)));
  }
  return [...out];
}
export function gateFields(t) {
  const out = [];
  const re = new RegExp(`${CONFIG.gateHashAttr}\\s*=\\s*(["'])([^"']+)\\1`, 'g');
  let m;
  while ((m = re.exec(t))) out.push(m[2].split(',').map((s) => s.trim()).filter(Boolean));
  return out;
}
export function declaredIndexes(t) {
  const out = new Set();
  const re = new RegExp(`${CONFIG.indexAttr}\\s*=\\s*(["'])([^"']+)\\1`, 'g');
  let m;
  while ((m = re.exec(t))) out.add(m[2].replace(/^\.?\//, ''));
  return [...out];
}
export function attrList(t, name) {
  const out = new Set();
  const re = new RegExp(`${name}\\s*=\\s*(["'])([^"']+)\\1`, 'gi');
  let m;
  while ((m = re.exec(t))) for (const v of m[2].split(',')) { const s = v.trim(); if (s) out.add(s); }
  return [...out];
}
export function nextOf(root, frag, fromFile) {
  const out = new Set();
  for (const u of attrList(frag, CONFIG.nextAttr)) {
    const clean = u.split('?')[0].split('#')[0];
    if (!clean.endsWith('.html') || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(clean)) continue;
    out.add(relOf(root, join(dirname(fromFile), clean)));
  }
  return [...out];
}

export function parsePages(root) {
  const pages = {};
  for (const f of walkFiles(root).filter((x) => x.endsWith('.html'))) {
    const key = relOf(root, f);
    const t = readFileSync(f, 'utf8');
    const { locked, unlocked } = splitLocked(t);
    pages[key] = {
      lockedText: visible(locked),
      allText: visible(t),
      blocked: visible(unlocked) !== '',
      open: linksOf(root, locked, f),
      gated: [...linksOf(root, unlocked, f), ...nextOf(root, locked, f)],
      fields: gateFields(locked),
      grants: attrList(locked, CONFIG.grantAttr),
      access: attrList(locked, CONFIG.accessAttr),
      isSearch: CONFIG.searchMount.test(t),
      indexes: declaredIndexes(t),
      hitsLocked: new Map(),
      hitsAll: new Map(),
      html: t,
      rawLocked: locked,
    };
  }
  return { pages, names: Object.keys(pages), gatePages: Object.keys(pages).filter((n) => pages[n].fields.length) };
}

/* ── Keyword tables: hash -> urls, hash -> which table it came from, table -> raw urls ── */
export function loadKeywordTables(root) {
  const DATA = join(root, CONFIG.dataDir);
  const canon = (n) => n.replace(/\.src\.json$/, '.json');
  const kwHashToUrls = new Map();
  const kwHashToTables = new Map();
  const kwPlainByHash = new Map();
  const kwTableUrls = new Map();   // table name (data/keywords.x.json) -> Set of raw urls
  const kwPlain = [];
  let tableNames = [];
  if (existsSync(DATA)) {
    const all = readdirSync(DATA);
    const srcs = all.filter((n) => /^keywords.*\.src\.json$/.test(n)).sort();
    const hashed = all.filter((n) => /^keywords.*\.json$/.test(n) && !/\.src\.json$/.test(n)).sort();
    tableNames = (srcs.length ? srcs : hashed).map(canon);
    if (!srcs.length && hashed.length) {
      console.log('WARN  no keywords*.src.json found; using the hashed tables (cannot model "read it first to search it")');
    }
    const add = (h, url, table, plain) => {
      if (!kwHashToUrls.has(h)) kwHashToUrls.set(h, new Set());
      kwHashToUrls.get(h).add(url);
      if (!kwHashToTables.has(h)) kwHashToTables.set(h, new Set());
      kwHashToTables.get(h).add(table);
      if (plain != null && !kwPlainByHash.has(h)) kwPlainByHash.set(h, plain);
      if (!kwTableUrls.has(table)) kwTableUrls.set(table, new Set());
      kwTableUrls.get(table).add(url);
    };
    if (srcs.length) {
      for (const name of srcs) {
        const table = CONFIG.dataDir + '/' + canon(name);
        for (const [keys, arr] of Object.entries(JSON.parse(readFileSync(join(DATA, name), 'utf8')))) {
          for (const k of keys.split('|')) {
            const kk = k.trim();
            if (!kk) continue;
            kwPlain.push(kk);
            const h = hash(kk);
            for (const r of arr) add(h, `${CONFIG.pagesDir}/` + r.split('|')[0], table, kk);
          }
        }
      }
    } else {
      for (const name of hashed) {
        const table = CONFIG.dataDir + '/' + canon(name);
        for (const [h, arr] of Object.entries(JSON.parse(readFileSync(join(DATA, name), 'utf8')))) {
          for (const r of arr) add(h, `${CONFIG.pagesDir}/` + r.url, table, null);
        }
      }
    }
  }
  return { kwHashToUrls, kwHashToTables, kwPlainByHash, kwTableUrls, kwPlain, tableNames };
}

/* ── The cold-start walk: fixpoint over reachable / solvable / search-is-earned ── */
export function analyze(root) {
  const { pages, names, gatePages } = parsePages(root);
  const { kwHashToUrls, kwHashToTables, kwPlainByHash, kwTableUrls, kwPlain, tableNames } = loadKeywordTables(root);
  if (!kwHashToUrls.size) { console.log('ERROR  no keyword tables found — run node tools/build-keywords.mjs first'); process.exit(1); }

  const wanted = new Set(kwHashToUrls.keys());
  for (const n of names) for (const fld of pages[n].fields) for (const h of fld) wanted.add(h);

  function hitsIn(text) {
    const hits = new Map();
    for (const w of candidates(text)) {
      const h = hash(w);
      if (wanted.has(h) && !hits.has(h)) hits.set(h, w);
    }
    return hits;
  }
  for (const n of names) {
    pages[n].hitsLocked = hitsIn(pages[n].lockedText);
    pages[n].hitsAll = pages[n].blocked ? hitsIn(pages[n].allText) : pages[n].hitsLocked;
  }

  const visited = new Set([CONFIG.entry]);
  const unlocked = new Set();
  const identities = new Set();
  const provenance = new Map();
  let rounds = 0;

  if (!pages[CONFIG.entry]) { console.log(`ERROR  entry page ${CONFIG.entry} not found`); process.exit(1); }

  const accessOk = (p) => {
    const need = pages[p].access;
    return !need.length || (need.includes('*') ? identities.size > 0 : need.some((r) => identities.has(r)));
  };
  const pageOpen = (p) => accessOk(p) && (!pages[p].fields.length || unlocked.has(p));
  const readableHits = (p) => (pageOpen(p) ? pages[p].hitsAll : accessOk(p) ? pages[p].hitsLocked : new Map());

  function searchEdges() {
    const out = new Set();
    for (const s of names) {
      if (!pages[s].isSearch || !visited.has(s) || !accessOk(s)) continue;
      const allowed = pages[s].indexes.length
        ? pages[s].indexes.map((n) => n.replace(/\.src\.json$/, '.json'))
        : tableNames.map((n) => CONFIG.dataDir + '/' + n);
      for (const q of visited) {
        for (const h of readableHits(q).keys()) {
          const tables = kwHashToTables.get(h);
          if (!tables || ![...tables].some((t) => allowed.includes(t))) continue;
          for (const u of kwHashToUrls.get(h) || []) if (pages[u] && accessOk(u)) out.add(u);
        }
      }
    }
    return out;
  }

  while (rounds++ < 40) {
    let changed = false;
    const frontier = new Set();
    for (const p of visited) {
      if (!accessOk(p)) continue;
      for (const l of pages[p].open) if (pages[l] && accessOk(l)) frontier.add(l);
      if (pageOpen(p)) for (const l of pages[p].gated) if (pages[l] && accessOk(l)) frontier.add(l);
    }
    for (const u of searchEdges()) frontier.add(u);
    for (const p of frontier) if (pages[p] && !visited.has(p)) { visited.add(p); changed = true; }

    for (const g of gatePages) {
      if (!visited.has(g) || unlocked.has(g) || !accessOk(g)) continue;
      const src = pages[g].fields.map((fld) => {
        const all = [];
        for (const h of fld) {
          for (const q of visited) {
            if (q === g) continue;
            const hits = readableHits(q);
            if (hits.has(h)) all.push({ plain: hits.get(h), from: q, afterGate: pages[q].blocked });
          }
        }
        return all.length ? all : null;
      });
      if (src.every(Boolean)) {
        unlocked.add(g);
        for (const r of pages[g].grants) identities.add(r);
        provenance.set(g, src);
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Final search edges, with provenance (which visited pages supplied each keyword).
  const finalSearchEdges = () => {
    const out = [];
    for (const s of names) {
      if (!pages[s].isSearch || !visited.has(s) || !accessOk(s)) continue;
      const allowed = pages[s].indexes.length
        ? pages[s].indexes.map((n) => n.replace(/\.src\.json$/, '.json'))
        : tableNames.map((n) => CONFIG.dataDir + '/' + n);
      for (const q of visited) {
        for (const h of readableHits(q).keys()) {
          const tables = kwHashToTables.get(h);
          if (!tables || ![...tables].some((t) => allowed.includes(t))) continue;
          for (const u of kwHashToUrls.get(h) || []) {
            if (!pages[u] || !accessOk(u)) continue;
            out.push({ searchPage: s, target: u, hash: h, keyword: kwPlainByHash.get(h) ?? null,
              readOn: [...visited].filter((v) => readableHits(v).has(h)) });
          }
        }
      }
    }
    return out;
  };

  return { pages, names, gatePages, rounds, visited, unlocked, identities, gateSrc: provenance,
    searchEdges: finalSearchEdges(), readableHits, kwHashToUrls, kwHashToTables, kwPlainByHash,
    kwTableUrls, kwPlain, tableNames };
}
