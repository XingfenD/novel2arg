// Cold-start solvability walk. Proves, mechanically, that a player who only reads and searches can
// reach every page and solve every gate. Run from the project root: node tools/check-solvable.mjs
//
// Three things must hold at once, or this exits 1:
//   1. Reachable  — from the entry page, via top-bar search / body links / post-gate links, every page is reached.
//   2. Solvable   — for each gate, every field's plaintext already appears in text readable *elsewhere*,
//                   before the gate is reached.
//   3. Search is earned — a keyword only opens the pages it routes to once that keyword has been READ
//                   in some page's body copy ("keywords are copied out of the body" is the game's rule).
//
// No passwords are hardcoded. Each page's readable text is scanned for candidate strings, hashed with the
// same md5+base64 rule as build-keywords.mjs / hash.mjs / the in-page helper, then compared against the
// real data-expect-hash values on gate inputs and against the plaintext keyword tables. A hit proves the
// player has already read that string, and records which page supplied it. Candidates are both compact
// character windows (CJK, IDs, dates) and whitespace-delimited word n-grams (multi-word or long English
// credentials); HTML entities are decoded first, so body copy written as AT&amp;T or O&#39;Brien still
// matches what the player renders.
//
// Gates block traversal, so the walk iterates to a fixpoint. Crucial detail: a gate page's body is NOT
// readable before unlock and IS readable after — a clue parked inside a page's own x-show="unlocked" block
// only counts once that gate has been passed. Deleting a clue, changing a password, moving a clue into a
// post-unlock block, or cutting a listing entry all turn this check red.
//
// Project conventions live in CONFIG below; a project that renames dirs, markers, or the search mount edits
// CONFIG instead of rewriting the walk (--self-test re-checks the matcher after an edit). What no static
// checker can see is listed in references/project-structure.md §10, with the manual method for each.
//
// Known ceilings (ponytail — deliberately not built):
//  - Only static href is followed; Alpine :href bindings are invisible here, so search-result links are
//    modelled through the keyword tables instead of being parsed out of the DOM.
//  - This proves solvability, not that a gate is un-skippable. If the page behind a gate is reachable by
//    another route, the walk still passes. Catching that is a layer-scoping question: keep per-layer
//    keyword tables and let check-links.mjs enforce that the surface index carries no secret url.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

/* ── Project conventions. Defaults match references/project-structure.md; edit if your project renamed them. ── */
const CONFIG = {
  entry: 'index.html',                                            // BFS root
  gateHashAttr: 'data-expect-hash',                               // per-input accepted hashes (comma = synonyms)
  unlockMarkers: [/x-show\s*=\s*["']unlocked["']/, /<template\s+x-if\s*=\s*["']unlocked["']/], // start of the post-gate block
  unlockEnd: '</main>',                                           // end boundary of the post-gate block
  searchMount: /x-data\s*=\s*["']search["']/,                     // page(s) mounting the search component
  indexAttr: 'data-index',                                        // optional per-search-page keyword table
  dataDir: 'data',                                                // holds keywords*.src.json / keywords*.json
  pagesDir: 'pages',                                              // keyword-table urls are relative to this
  maxTokenLen: 8,                                                 // character-window cap (CJK / compact tokens)
  maxPhraseWords: 4,                                              // word n-gram width (multi-word credentials)
  maxPhraseLen: 48,                                               // character cap for one candidate
};

const ROOT = process.cwd();
const hash = (w) => createHash('md5').update(String(w).trim().toLowerCase()).digest('base64');
const SKIP = /[\s<>"'`{}[\],.;:!?/\\|()（）「」『』·、。，；：！？—…]/;
const EDGE = /^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const rel = (p) => relative(ROOT, p).split('\\').join('/');

/* ── Page parsing ── */
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
const decodeEntities = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') {
    const hex = e[1] === 'x' || e[1] === 'X';
    const n = parseInt(e.slice(hex ? 2 : 1), hex ? 16 : 10);
    return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : m;
  }
  return NAMED[e.toLowerCase()] ?? m;
});
function splitLocked(t) {
  for (const marker of CONFIG.unlockMarkers) {
    const m = marker.exec(t);
    if (!m) continue;
    const end = t.indexOf(CONFIG.unlockEnd, m.index);
    return { locked: t.slice(0, m.index), unlocked: t.slice(m.index, end === -1 ? t.length : end) };
  }
  return { locked: t, unlocked: '' };
}
function visible(html) {
  return decodeEntities(html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    // strip attributes: placeholder / data-* / title / href text is not body copy the player reads
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
}

// Candidate strings a player could have read on the page: compact character windows plus word n-grams.
function candidates(text) {
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

// Self-check for the matcher: node tools/check-solvable.mjs --self-test
if (process.argv.includes('--self-test')) {
  const text = visible('Margaret&nbsp;Holt worked at AT&amp;T with the lighthouse keeper. 焰溪镇供销社公告 &#39;77');
  const c = candidates(text);
  const need = ['Margaret Holt', 'lighthouse', 'AT&T', "'77", '焰溪镇'];
  const bad = need.filter((s) => !c.has(s));
  if (bad.length) { console.error(`self-test FAILED — not matchable: ${bad.join(' | ')}`); process.exit(1); }
  console.log(`self-test ok — multi-word, long-word, entity and CJK candidates all match (${c.size} generated)`);
  process.exit(0);
}

function linksOf(frag, fromFile) {
  const out = new Set();
  const re = /\shref\s*=\s*(["'])([^"']*)\1/gi;
  let m;
  while ((m = re.exec(frag))) {
    const raw = m[2];
    if (raw.startsWith('#')) continue;
    const u = raw.split('?')[0].split('#')[0];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(u) || !u.endsWith('.html')) continue;
    out.add(rel(join(dirname(fromFile), u)));
  }
  return [...out];
}
function gateFields(t) {
  const out = [];
  const re = new RegExp(`${CONFIG.gateHashAttr}\\s*=\\s*(["'])([^"']+)\\1`, 'g');
  let m;
  while ((m = re.exec(t))) out.push(m[2].split(',').map((s) => s.trim()).filter(Boolean));
  return out;
}
function declaredIndexes(t) {
  const out = new Set();
  const re = new RegExp(`${CONFIG.indexAttr}\\s*=\\s*(["'])([^"']+)\\1`, 'g');
  let m;
  while ((m = re.exec(t))) out.add(m[2].replace(/^\.?\//, ''));
  return [...out];
}

const pages = {};
for (const f of walk(ROOT).filter((x) => x.endsWith('.html'))) {
  const key = rel(f);
  const t = readFileSync(f, 'utf8');
  const { locked, unlocked } = splitLocked(t);
  pages[key] = {
    lockedText: visible(locked),
    allText: visible(t),
    blocked: visible(unlocked) !== '',
    open: linksOf(locked, f),
    gated: linksOf(unlocked, f),
    fields: gateFields(locked),
    isSearch: CONFIG.searchMount.test(t),
    indexes: declaredIndexes(t),
    hitsLocked: new Map(),
    hitsAll: new Map(),
  };
}
const names = Object.keys(pages);
const gatePages = names.filter((n) => pages[n].fields.length);

/* ── Keyword tables: hash -> urls, and hash -> which table it came from ── */
const DATA = join(ROOT, CONFIG.dataDir);
const canon = (n) => n.replace(/\.src\.json$/, '.json');   // a page declares the built table; tokens know the source
const kwHashToUrls = new Map();
const kwHashToTables = new Map();
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
  const add = (h, url, table) => {
    if (!kwHashToUrls.has(h)) kwHashToUrls.set(h, new Set());
    kwHashToUrls.get(h).add(url);
    if (!kwHashToTables.has(h)) kwHashToTables.set(h, new Set());
    kwHashToTables.get(h).add(table);
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
          for (const r of arr) add(h, `${CONFIG.pagesDir}/` + r.split('|')[0], table);
        }
      }
    }
  } else {
    for (const name of hashed) {
      const table = CONFIG.dataDir + '/' + canon(name);
      for (const [h, arr] of Object.entries(JSON.parse(readFileSync(join(DATA, name), 'utf8')))) {
        for (const r of arr) add(h, `${CONFIG.pagesDir}/` + r.url, table);
      }
    }
  }
}
if (!kwHashToUrls.size) { console.log('ERROR  no keyword tables found — run node tools/build-keywords.mjs first'); process.exit(1); }

/* ── Match targets = gate hashes + keyword plaintext hashes ── */
const wanted = new Set(kwHashToUrls.keys());
for (const n of names) for (const fld of pages[n].fields) for (const h of fld) wanted.add(h);

const selfMatch = (k) => candidates(k).has(k);
const unmatchable = kwPlain.filter((k) => !selfMatch(k));
if (unmatchable.length) {
  console.log(`NOTE  ${unmatchable.length}/${kwPlain.length} keywords can never be matched as written (over ${CONFIG.maxPhraseLen} chars, more than ${CONFIG.maxPhraseWords} words, or carrying edge punctuation); their group must be discovered through another alias:\n      ${unmatchable.slice(0, 10).join(' / ')}${unmatchable.length > 10 ? ' …' : ''}\n`);
}

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

/* ── Fixpoint ── */
const visited = new Set([CONFIG.entry]);
const unlocked = new Set();
const provenance = new Map();
let rounds = 0;

if (!pages[CONFIG.entry]) { console.log(`ERROR  entry page ${CONFIG.entry} not found`); process.exit(1); }

// What a page can read right now: a gate page exposes only its locked part until its gate is passed.
const readableHits = (p) => (unlocked.has(p) ? pages[p].hitsAll : pages[p].hitsLocked);

// Search edges come from the page(s) mounting the search component. If such a page declares an index
// (data-index), only that table's keywords apply; otherwise every table applies.
function searchEdges() {
  const out = new Set();
  for (const s of names) {
    if (!pages[s].isSearch || !visited.has(s)) continue;
    const allowed = pages[s].indexes.length
      ? pages[s].indexes.map(canon)
      : tableNames.map((n) => CONFIG.dataDir + '/' + n);
    for (const q of visited) {
      for (const h of readableHits(q).keys()) {
        const tables = kwHashToTables.get(h);
        if (!tables || ![...tables].some((t) => allowed.includes(t))) continue;
        for (const u of kwHashToUrls.get(h) || []) out.add(u);
      }
    }
  }
  return out;
}

while (rounds++ < 40) {
  let changed = false;
  const frontier = new Set();
  for (const p of visited) {
    for (const l of pages[p].open) frontier.add(l);
    if (unlocked.has(p)) for (const l of pages[p].gated) frontier.add(l);
  }
  for (const u of searchEdges()) frontier.add(u);
  for (const p of frontier) if (pages[p] && !visited.has(p)) { visited.add(p); changed = true; }

  for (const g of gatePages) {
    if (!visited.has(g) || unlocked.has(g)) continue;
    const src = pages[g].fields.map((fld) => {
      const all = [];
      for (const h of fld) {
        for (const q of visited) {
          if (q === g) continue;                 // a gate page must never prove its own puzzle
          const hits = readableHits(q);
          if (hits.has(h)) all.push({ plain: hits.get(h), from: q, afterGate: pages[q].blocked });
        }
      }
      return all.length ? all : null;
    });
    if (src.every(Boolean)) { unlocked.add(g); provenance.set(g, src); changed = true; }
  }
  if (!changed) break;
}

/* ── Report ── */
console.log(`fixpoint in ${rounds} round(s) · gates ${unlocked.size}/${gatePages.length} unlocked · pages ${visited.size}/${names.length} reachable\n`);

let fail = 0;
for (const g of gatePages) {
  if (unlocked.has(g)) {
    console.log(`✓ ${g}`);
    provenance.get(g).forEach((alts, i) => {
      const list = alts
        .map((s) => `${JSON.stringify(s.plain)} ← ${s.from}${s.afterGate ? ' (its own gate must be passed first)' : ''}`)
        .join('  ,  ');
      console.log(`    field ${i + 1} (${alts.length} source(s)): ${list}`);
    });
  } else {
    fail++;
    const got = pages[g].fields.map((fld) => {
      const found = fld.some((h) => [...visited].some((q) => q !== g && readableHits(q).has(h)));
      return found ? 'traceable' : 'NO CLUE';
    });
    console.log(`✗ ${g}  STUCK (fields: ${got.join(', ')})${visited.has(g) ? '' : '  — and the gate page itself is unreachable'}`);
  }
}

const missing = names.filter((n) => !visited.has(n));
if (missing.length) { fail++; console.log(`\nunreachable pages (${missing.length}):\n  ` + missing.join('\n  ')); }
else console.log('\nevery page is reachable from the entry page via search / links / gate unlocks.');

process.exit(fail ? 1 : 0);
