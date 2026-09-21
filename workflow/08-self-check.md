# Step 8 — Self-Check

**Input:** the finished site plus all `docs/` artifacts. **Output:** a pass/fail line per item, written to `docs/self-check.md`. Every item must pass. This checklist is canonical — references/structure/tooling.md covers only the cadence, the shared CONFIG, and the manual methods; commands are not duplicated there.

## Structure

- [ ] `find . -name "*.html" | wc -l` returns 10 or more. The deliverable is a multi-HTML file tree (R1).
- [ ] `node tools/build-keywords.mjs` runs cleanly before the checkers — a stale hash table hides link and solvability drift (R3).
- [ ] `node tools/check-links.mjs` reports zero dead links (and zero layer leaks).
- [ ] `node tools/check-solvable.mjs` reports every gate unlocked and every page reachable, and exits 0.
- [ ] `grep -rL "alpine.min.js" --include=*.html .` returns nothing.
- [ ] `grep -rn "keywords.*src" --include=*.html .` returns nothing.
- [ ] Console on the entry page and one secret page: zero errors, zero 404s.
- [ ] Timers and observers are released in `destroy()`.

## Reachability (re-run workflow/04 against the built tree)

- [ ] `node tools/check-solvable.mjs` passes: it walks the graph from the entry page over top-bar search, body links and post-gate links, and reports gate unlocks plus unreachable pages. This automates the three items below; do them by hand only for the ones it cannot model.
- [ ] The graph walk from `index.html` reaches every page. Zero orphans.
- [ ] Every `<a>` under `pages/` traces to a legitimate inbound route in the reachability table. Planted clue links are gone.
- [ ] Every key in both plaintext keyword tables appears verbatim in the copy of a reachable page of the same layer.
- [ ] `grep -o '"secret/[^"]*"' data/keywords.surface.json` returns nothing.
- [ ] Every result marked with a clearance level shows `[Access denied]` or resolves to a gate; no classified result opens the document directly.
- [ ] System containers: every `data-access` account is granted by some login gate (`data-grant`); no page is reachable through a privilege ladder or a shallow-page "related archives" link; and a search hit to a protected document stays unreachable until the named account is authenticated.

## Puzzle integrity (re-run workflow/05 Q4)

- [ ] Leak scan over the built tree: no answer, restatement, derivation rule, or location string on any gate page or inference-chain page. Scan the page **chrome** as well as the form UI — `<title>`, top bar, clearance strip, and footer have all leaked answers in practice.
- [ ] `grep -rn "placeholder=" --include=*.html .` — every value names its field.
- [ ] `grep -rn "data-fail-hint\|gate-hint" --include=*.html .` — failure hints point obliquely at the source (R4). `密码错误 🎂` passes; `想想陈师傅的本命年` fails.
- [ ] `node tools/check-solvable.mjs` resolves every credential to prior page copy, naming the source page. This replaces the manual provenance pass; still replay the walkthrough yourself once, judging tone and pacing.
- [ ] Result titles in both keyword tables are catalog entries; none summarizes the document's content.

## Diegetic neutrality

- [ ] Read each `pages/surface/` and `pages/platform/` page as a document of that organization. It is complete, plausible, and gives nothing away. No page mentions the plot.
- [ ] Each announcement, notice, contract, and certificate carries issuing body, document number, date, addressee, signature or seal.
- [ ] No in-world page addresses the player.

## Copy register

- [ ] Guidance text on the entry ritual page is plain declarative sentences.
- [ ] Contrast frames (是…不是… / 是…而是… / 不能…只能…) appear nowhere in site copy (R11). Scan with `grep -rnE '不是|而是|不能.*只能|并非.*而是' pages/ index.html`.
- [ ] No metaphor, personification, or adjectives piled for effect in guidance text or documents.

## Presentation

- [ ] The header stays fixed to the viewport on long pages; body text scrolls beneath it.
- [ ] Core interactions work at phone width.
- [ ] Chrome sweep: load **every** page (plus each search state: hit / miss / forbidden) at desktop and phone width. Collect console errors, `requestfailed`, horizontal overflow (`scrollWidth > innerWidth`), and whether each `[x-data]` element actually initialized. Partial passes miss defects — a CSS specificity bug once silently disabled two declared puzzle types on the secret layer only.
- [ ] Anything the honor agreement claims is true in code: keyword tables and gate hashes really are hashed; system containers keep authenticated accounts in `sessionStorage` only and say so; no page persists unlock state or reading progress.
- [ ] Sensory puzzle hardware requirements are declared on the entry page, and nothing is declared that the site does not actually implement.
- [ ] Secret-layer entry reskins the whole page: background, title, logo, footer.

Baseline-test traps for this step: references/common-mistakes.md §8 — check them before returning the artifact.
