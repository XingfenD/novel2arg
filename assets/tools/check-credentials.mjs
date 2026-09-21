// Composite / derived credential provenance checker. Companion to check-solvable.mjs.
//
// check-solvable.mjs proves a gate field's plaintext appears VERBATIM in some readable page. That model
// cannot express a DERIVED credential — an account assembled from parts (pinyin initials + license-year),
// a password equal to an entry year — whose full string is never printed anywhere. Left with only that
// checker, the sole way to turn it green is to print the credential on a public page, which destroys the
// in-world realism and the puzzle at once; on a static site with no server auth the HTML goes to every
// visitor, so client-side masking does not make it private.
//
// This tool replaces "verbatim" with "parts + rule". A dev-only manifest declares, per gate field, the
// value, the human-readable composition rule, the components (each a verbatim span on a public page), and
// a kind. It then proves three things, or exits 1:
//   1. Assemblable — every component appears verbatim in the visible text of the page that declares it.
//   2. Bound to the gate — hash(value) is among the gate page's data-expect-hash values (set membership,
//      not position, so one input may carry several synonym hashes after a single-box login merge).
//   3. Zero plaintext — a value of a private kind never appears whole in any page's visible text, and is
//      not "assembled" from a component that is just itself.
//
// The manifest carries plaintext values, so it is a development artifact: name it data/credentials.src.json
// and exclude it from deploy exactly like data/keywords*.src.json (see references/structure/base.md §3).
// Reachability given these credentials is proved separately by tools/check-reachability.mjs (a rehearsal
// build that injects the values into a throwaway copy and runs check-solvable there).
//
// Run from the project root: node tools/check-credentials.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';

/* ── Project conventions. Defaults match references/structure/base.md; edit if your project renamed them. ── */
const CONFIG = {
  credTable: 'data/credentials.src.json',   // dev-only provenance manifest (plaintext values; not deployed)
  gateHashAttr: 'data-expect-hash',         // per-input accepted hashes (comma = synonyms)
  // A value of a derived kind must be genuinely assembled: no single component may equal the whole value.
  derivedKinds: ['account', 'secret'],
  // Zero-plaintext scan applies to these kinds. Short numeric secrets (a 4-digit year) are left out on
  // purpose — they collide with ordinary dates in body copy; their non-printing is enforced by the
  // derived-kind rule above plus the step-8 leak scan, not by a whole-string search.
  zeroPlaintextKinds: ['account'],
  skipDirs: ['.git', 'node_modules', 'docs', 'tools', 'deploy'],   // dev / ops dirs never hold page text
};

const ROOT = process.cwd();
// Must be byte-identical to hash.mjs / build-keywords.mjs / the in-page helper: trim → lowercase → md5 → base64.
const hash = (s) => createHash('md5').update(String(s).trim().toLowerCase()).digest('base64');
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
const decodeEntities = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') {
    const hex = e[1] === 'x' || e[1] === 'X';
    const n = parseInt(e.slice(hex ? 2 : 1), hex ? 1 : 10);
    return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : m;
  }
  return NAMED[e.toLowerCase()] ?? m;
});
// Visible page text, read the way the player reads it: comments / script / style / tags stripped, entities decoded.
const visible = (html) => decodeEntities(html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' '));

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (CONFIG.skipDirs.includes(name) || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const TABLE = resolve(ROOT, CONFIG.credTable);
if (!existsSync(TABLE)) {
  console.log(`ERROR  ${CONFIG.credTable} not found — declare each gate field's value / rule / components / kind there.`);
  process.exit(1);
}
const table = JSON.parse(readFileSync(TABLE, 'utf8'));

// Cache visible text per page so the zero-plaintext sweep reads each file once.
const pageText = new Map();
for (const f of walk(ROOT)) pageText.set(relative(ROOT, f).split('\\').join('/'), visible(readFileSync(f, 'utf8')));
const reads = (rel) => pageText.get(rel);

let fail = 0;
const privateValues = [];   // {value, kind} subject to the zero-plaintext sweep

for (const [gate, fields] of Object.entries(table)) {
  if (gate.startsWith('_')) continue;                 // _note and other meta keys
  console.log(`\n${gate}`);
  if (!pageText.has(gate)) { console.log(`  ✗ gate page not found among scanned html`); fail++; continue; }

  const gateHtml = readFileSync(resolve(ROOT, gate), 'utf8');
  const expects = [...gateHtml.matchAll(new RegExp(`${CONFIG.gateHashAttr}\\s*=\\s*(["'])([^"']+)\\1`, 'g'))]
    .flatMap((m) => m[2].split(',').map((s) => s.trim())).filter(Boolean);

  if (expects.length !== fields.length) {
    console.log(`  ! gate declares ${expects.length} data-expect-hash value(s) vs ${fields.length} manifest field(s) — reconcile the counts`);
    fail++;
  }

  for (const f of fields) {
    const kind = f.kind || 'fact';
    if (CONFIG.zeroPlaintextKinds.includes(kind)) privateValues.push({ value: f.value, kind });
    const problems = [];

    for (const c of f.components || []) {
      const text = reads(c.page);
      if (text === undefined) { problems.push(`component page not scanned: ${c.page}`); continue; }
      if (!text.includes(c.text)) problems.push(`cannot read component "${c.text}" @ ${c.page}`);
      // A derived credential must not be "assembled" from a component that is just the whole value.
      if (CONFIG.derivedKinds.includes(kind) && c.text.replace(/[\s-]/g, '') === String(f.value).replace(/[\s-]/g, ''))
        problems.push(`component is the credential itself @ ${c.page}`);
    }
    if (!expects.includes(hash(f.value))) problems.push(`hash(value) not among the gate's data-expect-hash: ${hash(f.value)}`);

    if (problems.length) { fail++; console.log(`  ✗ ${f.value}  — ${problems.join('; ')}`); }
    else console.log(`  ✓ ${f.value}  ← ${(f.components || []).map((c) => c.page).join(' + ')}   [${f.rule || kind}]`);
  }
}

if (privateValues.length) {
  console.log('\nzero-plaintext assertion (realism first): a private credential never appears whole in any page text');
  for (const { value } of privateValues) {
    const hits = [...pageText].filter(([, text]) => text.includes(value)).map(([rel]) => rel);
    if (hits.length) { fail++; console.log(`  ✗ ${value} appears in ${hits.join(', ')}`); }
    else console.log(`  ✓ ${value} — 0 occurrences site-wide`);
  }
}

console.log(fail ? `\n${fail} check(s) failed` : '\nall pass: every credential assembles from public-page components, binds to its gate, and stays zero-plaintext.');
process.exit(fail ? 1 : 0);
