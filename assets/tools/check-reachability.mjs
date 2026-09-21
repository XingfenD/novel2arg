// Rehearsal reachability build. The other half of the composite-credential proof.
//
// check-solvable.mjs cannot derive a composite credential, so on the real (zero-plaintext) tree its gates
// stay locked and every page behind them reports "unreachable" — a false red that tempts you to print the
// credential just to see green. check-credentials.mjs proves each credential is DERIVABLE from public parts;
// this tool proves the complementary half: once every credential is KNOWN, every gate unlocks and every page
// is reachable. It copies the site to a throwaway temp dir, injects the credential values from the dev-only
// manifest into the entry page's pre-gate text, and runs check-solvable there. The shipped tree is never
// touched and stays zero-plaintext; only the temp copy carries the values.
//
// Run from the project root: node tools/check-reachability.mjs
// Exits with check-solvable's status (0 = every gate unlocked, every page reachable).
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

/* ── Project conventions. Defaults match references/structure/base.md; edit if your project renamed them. ── */
const CONFIG = {
  credTable: 'data/credentials.src.json',   // same manifest check-credentials.mjs reads
  entry: 'index.html',                      // page the values are injected into (the BFS root)
  unlockEnd: '</main>',                     // injection point: end of the entry page's pre-gate body
  solver: 'tools/check-solvable.mjs',       // the walk to run inside the rehearsal copy
  skipDirs: ['.git', 'node_modules'],       // not copied into the temp dir
};

const ROOT = process.cwd();
const TABLE = resolve(ROOT, CONFIG.credTable);
if (!existsSync(TABLE)) { console.log(`ERROR  ${CONFIG.credTable} not found`); process.exit(1); }

const table = JSON.parse(readFileSync(TABLE, 'utf8'));
const values = Object.entries(table)
  .filter(([k]) => !k.startsWith('_'))
  .flatMap(([, fields]) => fields.map((f) => f.value));
if (!values.length) { console.log('ERROR  no credential values in the manifest'); process.exit(1); }

const tmp = mkdtempSync(join(tmpdir(), 'rehearsal-'));
const site = join(tmp, 'site');
try {
  cpSync(ROOT, site, { recursive: true, filter: (src) => !CONFIG.skipDirs.some((d) => src.includes(`/${d}`)) });

  const entryPath = join(site, CONFIG.entry);
  let html = readFileSync(entryPath, 'utf8');
  const injected = `<section class="sheet" data-rehearsal="injected-credentials"><p>${values.join(' ')}</p></section>\n${CONFIG.unlockEnd}`;
  if (!html.includes(CONFIG.unlockEnd)) { console.log(`ERROR  ${CONFIG.entry} has no "${CONFIG.unlockEnd}" to inject before`); process.exit(1); }
  html = html.replace(CONFIG.unlockEnd, injected);
  writeFileSync(entryPath, html);

  const solverPath = join(site, CONFIG.solver);
  if (!existsSync(solverPath)) { console.log(`ERROR  ${CONFIG.solver} missing in the copy`); process.exit(1); }
  const res = spawnSync(process.execPath, [solverPath], { cwd: site, stdio: 'inherit' });
  process.exit(res.status ?? 1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
