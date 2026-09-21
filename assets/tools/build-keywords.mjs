// Plaintext keyword table(s) -> md5+base64 hash table(s). Anti-spoiler: the deployed site only ever
// ships the hash tables, so "read the source to win" stops working.
// Usage: node tools/build-keywords.mjs
//
// Convention (see references/structure/base.md §1 and components.md §1): one plaintext source per layer,
// each hashed to one table. Both shapes work with zero configuration:
//   data/keywords.src.json           -> data/keywords.json            (single-table projects)
//   data/keywords.surface.src.json   -> data/keywords.surface.json     (per-layer, container A default)
//   data/keywords.secret.src.json    -> data/keywords.secret.json
//
// Keys support "|"-separated synonym aliases; each value is "url|title". The url is relative to pages/.
// Titles are catalog entries the issuing body would print (body + document type + number/date),
// never a summary of the document's content.
//
// Keep the .src.json files out of the deployed directory (e.g. add data/*.src.json to .gitignore).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import CONFIG from './config.mjs';

const DATA = CONFIG.dataDir;
const hash = (w) => createHash('md5').update(String(w).trim().toLowerCase()).digest('base64');

if (!existsSync(DATA)) {
  console.error(`ERROR  ${DATA}/ not found — run from the project root`);
  process.exit(1);
}

const srcFiles = readdirSync(DATA).filter((n) => /^keywords.*\.src\.json$/.test(n)).sort();
if (!srcFiles.length) {
  console.error(`ERROR  no ${DATA}/keywords*.src.json found`);
  process.exit(1);
}

let totalKeys = 0;
let totalResults = 0;
for (const name of srcFiles) {
  const outName = name.replace(/\.src\.json$/, '.json');
  const src = JSON.parse(readFileSync(join(DATA, name), 'utf8'));
  const out = {};
  for (const [keys, results] of Object.entries(src)) {
    for (const k of keys.split('|')) {
      const kk = k.trim();
      if (!kk) continue;
      const hk = hash(kk);
      out[hk] ??= [];
      for (const r of results) {
        const idx = r.indexOf('|');
        const url = idx === -1 ? r : r.slice(0, idx);
        const title = idx === -1 ? r : r.slice(idx + 1);
        // Two aliases can normalize to the same hash; never list the same url twice under it.
        if (!out[hk].some((x) => x.url === url)) out[hk].push({ url, title });
      }
    }
  }
  writeFileSync(join(DATA, outName), JSON.stringify(out, null, 1));
  const nk = Object.keys(out).length;
  const nr = Object.values(out).reduce((a, b) => a + b.length, 0);
  totalKeys += nk;
  totalResults += nr;
  console.log(`built ${DATA}/${outName} — ${nk} hashed keys, ${nr} results`);
}
console.log(`done — ${srcFiles.length} table(s), ${totalKeys} keys, ${totalResults} results`);
console.log('NOTE  keep the .src.json files out of the deployed directory');
