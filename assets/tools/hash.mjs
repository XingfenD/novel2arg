// Password-gate hash tool: generates md5+base64 identical to the browser-side helper.
// Usage: node tools/hash.mjs "value1" "value2" ...
//
// Use it to produce the data-expect-hash values for gate inputs (see references/structure/base.md §5).
// Normalization MUST mirror build-keywords.mjs and the in-page hash helper exactly:
//   String(w).trim().toLowerCase()  ->  md5  ->  base64
// If you switch the whole project to async WebCrypto SHA-256, change all three sides together.
import { createHash } from 'node:crypto';

const hash = (w) => createHash('md5').update(String(w).trim().toLowerCase()).digest('base64');
const args = process.argv.slice(2);
if (!args.length) {
  console.log('usage: node tools/hash.mjs "value1" "value2" ...');
  process.exit(0);
}
for (const a of args) console.log(`${JSON.stringify(a)}  =>  ${hash(a)}`);
