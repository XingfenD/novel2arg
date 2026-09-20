// Dead-link checker. Walks every <a href>/<img src>/<form action> plus every url in the keyword tables
// and resolves them against the file tree.
// Usage: node tools/check-links.mjs     (run from the project root; expect "0 dead")
//
// Also enforces the layer-scoping rule from references/project-structure.md §3: a table whose name marks
// it as the surface index must never carry a layer-leak url (by default a secret-layer url) — otherwise a
// public search hands the player a direct route into the secret layer, bypassing the gate.
//
// Project conventions live in CONFIG below; a project that renames dirs or layer names edits CONFIG
// instead of rewriting the checker (references/project-structure.md §10 lists what stays manual).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, relative, join } from 'node:path';

const CONFIG = {
  dataDir: 'data',              // holds keywords*.src.json / keywords*.json
  pagesDir: 'pages',            // keyword-table urls are relative to this
  surfaceTable: /surface/i,     // tables matching this name are the public index
  secretUrl: /^secret\//,       // a url in a public index matching this is a layer leak
};
const ROOT = process.cwd();
const DATA = join(ROOT, CONFIG.dataDir);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const html = walk(ROOT).filter((f) => f.endsWith('.html'));
const external = /^(https?:|mailto:|tel:|javascript:|data:|#)/i;
let dead = 0;
let layerLeaks = 0;
const checked = new Set();

function checkLink(fromFile, raw) {
  raw = raw.replace(/&amp;/g, '&');
  if (!raw || external.test(raw)) return;
  const clean = raw.split('#')[0].split('?')[0];
  if (!clean) return;
  let target;
  if (clean.startsWith('/')) target = resolve(ROOT, '.' + clean);
  else target = resolve(dirname(fromFile), clean);
  const key = fromFile + '→' + target;
  if (checked.has(key)) return;
  checked.add(key);
  if (!existsSync(target)) {
    dead++;
    console.log(`DEAD  ${relative(ROOT, fromFile)}  →  ${raw}   (resolved: ${relative(ROOT, target)})`);
  }
}

for (const f of html) {
  const text = readFileSync(f, 'utf8');
  // Static href/src/action only. Alpine bindings (:href / x-bind:href) are skipped on purpose —
  // they are runtime values and cannot be resolved statically. See tools/check-solvable.mjs for how
  // search-result links are modelled instead.
  const re = /\s(?:href|src|action)\s*=\s*(["'])([^"']*)\1/gi;
  let m;
  while ((m = re.exec(text))) checkLink(f, m[2]);
}

// Keyword tables: urls are relative to pages/
if (existsSync(DATA)) {
  const tables = readdirSync(DATA).filter((n) => /^keywords.*\.json$/.test(n) && !/\.src\.json$/.test(n)).sort();
  if (!tables.length) console.log(`WARN  no ${CONFIG.dataDir}/keywords*.json found (run node tools/build-keywords.mjs first)`);
  const base = join(ROOT, CONFIG.pagesDir);
  if (!existsSync(base)) console.log(`WARN  ${CONFIG.pagesDir}/ not found — skipping keyword-table url resolution (edit CONFIG.pagesDir?)`);
  for (const name of tables) {
    const map = JSON.parse(readFileSync(join(DATA, name), 'utf8'));
    const isSurface = CONFIG.surfaceTable.test(name);
    for (const arr of Object.values(map)) {
      for (const rec of arr) {
        const key = `keywords(${name})→` + rec.url;
        if (!checked.has(key)) {
          checked.add(key);
          if (existsSync(base)) {
            const target = resolve(base, rec.url);
            if (!existsSync(target)) { dead++; console.log(`DEAD  ${CONFIG.dataDir}/${name}  →  ${rec.url}   (resolved: ${relative(ROOT, target)})`); }
          }
        }
        if (isSurface && CONFIG.secretUrl.test(rec.url)) {
          layerLeaks++;
          console.log(`LAYER LEAK  ${CONFIG.dataDir}/${name}  →  ${rec.url}   (public index must never carry a layer-leak url)`);
        }
      }
    }
  }
} else {
  console.log(`WARN  ${CONFIG.dataDir}/ not found`);
}

console.log(`\n${html.length} HTML files · ${checked.size} unique links checked · ${dead} dead · ${layerLeaks} layer leaks`);
process.exit(dead || layerLeaks ? 1 : 0);
