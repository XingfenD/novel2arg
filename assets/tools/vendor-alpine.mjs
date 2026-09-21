// Vendors the pinned Alpine v3 runtime into assets/js/vendor/alpine.min.js and verifies its sha256
// before writing — the committed file is then never edited and never loaded from a CDN at runtime
// (references/structure/base.md §1). Run once at scaffold time, from the project root:
//   node tools/vendor-alpine.mjs
// To upgrade: change VERSION and SHA256 together (compute the new digest from the official dist file),
// then re-run and commit both this file and the refreshed runtime.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const VERSION = '3.17.3';
const URL = `https://cdn.jsdelivr.net/npm/alpinejs@${VERSION}/dist/cdn.min.js`;
const SHA256 = '4d4b4bab885f9d2d4534099fe2bdc1234a30cf9dc6ee56869fc385f046cebd70';
const OUT = 'assets/js/vendor/alpine.min.js';

const res = await fetch(URL);
if (!res.ok) {
  console.error(`ERROR  download failed: ${URL} → HTTP ${res.status}`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
const got = createHash('sha256').update(buf).digest('hex');
if (got !== SHA256) {
  console.error(`ERROR  sha256 mismatch for alpinejs@${VERSION}\n  expected ${SHA256}\n  got      ${got}\nrefusing to write ${OUT} — the CDN served something unexpected.`);
  process.exit(1);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buf);
console.log(`vendored alpinejs@${VERSION} → ${OUT} (${buf.length} bytes, sha256 verified)`);
