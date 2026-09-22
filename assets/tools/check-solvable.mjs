// Cold-start solvability walk. Proves, mechanically, that a player who only reads and searches can
// reach every page and solve every gate. Run from the project root: node tools/check-solvable.mjs
//
// Three things must hold at once, or this exits 1:
//   1. Reachable  — from the entry page, via top-bar search / body links / post-gate links, every page is
//                   reached; an access-protected page counts only once an account it names is authenticated.
//   2. Solvable   — for each gate, every field's plaintext already appears in text readable *elsewhere*,
//                   before the gate is reached.
//   3. Search is earned — a keyword only opens the pages it routes to once that keyword has been READ
//                   in some page's body copy ("keywords are copied out of the body" is the game's rule).
//
// The parsing + walk core lives in the shared site-model.mjs (also consumed by site-graph.mjs, so the
// graph can never disagree with this walk). Known ceilings (static href only; un-skippability; derived
// credentials read as STUCK — prove them with check-credentials.mjs + check-reachability.mjs; per-tab
// session isolation) are documented in references/structure/tooling.md §3.
import { analyze, candidates, visible } from './site-model.mjs';

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

const { pages, names, gatePages, rounds, visited, unlocked, identities, gateSrc, readableHits, kwPlain } = analyze(process.cwd());

const unmatchable = kwPlain.filter((k) => !candidates(k).has(k));
if (unmatchable.length) {
  console.log(`NOTE  ${unmatchable.length}/${kwPlain.length} keywords can never be matched as written (over 48 chars, more than 4 words, or carrying edge punctuation); their group must be discovered through another alias:\n      ${unmatchable.slice(0, 10).join(' / ')}${unmatchable.length > 10 ? ' …' : ''}\n`);
}

console.log(`fixpoint in ${rounds} round(s) · gates ${unlocked.size}/${gatePages.length} unlocked · pages ${visited.size}/${names.length} reachable${identities.size ? ` · accounts ${[...identities].join(',')}` : ''}\n`);

let fail = 0;
for (const g of gatePages) {
  if (unlocked.has(g)) {
    console.log(`✓ ${g}`);
    gateSrc.get(g).forEach((alts, i) => {
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
    console.log(`✗ ${g}  STUCK (fields: ${got.join(', ')})${visited.has(g) ? '' : '  — and the gate page itself is unreachable'}${pages[g].access.length && ![...identities].some((r) => pages[g].access.includes(r) || pages[g].access.includes('*')) ? '  — and its data-access account is never authenticated' : ''}`);
  }
}

const missing = names.filter((n) => !visited.has(n));
if (missing.length) { fail++; console.log(`\nunreachable pages (${missing.length}):\n  ` + missing.join('\n  ')); }
else console.log('\nevery page is reachable from the entry page via search / links / gate unlocks.');

process.exit(fail ? 1 : 0);
