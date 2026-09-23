# Step 8 — Self-Check

**Input:** the finished site plus all `docs/` artifacts. **Output:** a pass/fail line per item, written to `docs/self-check.md`. Every item must pass. This checklist is canonical — references/structure/tooling.md covers only the cadence, the shared CONFIG, and the manual methods; commands are not duplicated there.

## Structure

- [ ] `find . -name "*.html" | wc -l` returns 10 or more. The deliverable is a multi-HTML file tree (R1).
- [ ] `node tools/build-keywords.mjs` runs cleanly before the checkers — a stale hash table hides link and solvability drift (R3).
- [ ] `node tools/check-links.mjs` reports zero dead links (and zero layer leaks).
- [ ] `node tools/check-solvable.mjs` reports every gate unlocked and every page reachable, and exits 0.
- [ ] `node tools/check-credentials.mjs` passes (every derived credential assembles from public-page components, binds to its gate, and stays zero-plaintext) — run whenever `data/credentials.src.json` exists.
- [ ] `node tools/check-reachability.mjs` exits 0 (rehearsal copy: once each credential is known, every gate unlocks and every page is reachable).
- [ ] `grep -rL "alpine.min.js" --include=*.html .` returns nothing.
- [ ] `grep -rn "keywords.*src\|credentials.*src" --include=*.html .` returns nothing (no page references a plaintext source table).
- [ ] **Module match.** The built site matches `docs/system-profile.md`: every selected module is present and works, and every unselected one is absent (no dead skin, search table, gate component, or account furniture).
- [ ] **Ignore files in place.** `.gitignore` and `.dockerignore` exist at the project root (they ship inside `assets/starter/` and land with the starter copy at step 6). Check them by content, not by snippet: `git check-ignore -v data/keywords.surface.src.json` names the rule, `git status --porcelain` shows no untracked `memory/` or `docs/site-graph*`, and the deploy copy excludes `data/*.src.json`, `docs/`, `tools/`, `viewer/`, `deploy/` (`references/structure/base.md` §1). A plaintext table that reaches history or the image is the answer key in one request (R3).
- [ ] **Asset manifest reconciled.** Every asset the GDD asset manifest declares exists under `assets/` AND is referenced by at least one page (`grep -rn "<asset-filename>" --include=*.html .` returns ≥1 hit). An `<img>` that was never written has no `src` for check-links to resolve, so this is a manual reconciliation against the GDD list (`references/structure/tooling.md` §3 item 9).
- [ ] Console on the entry page and one secret page: zero errors, zero 404s (including every `<img>` request).
- [ ] Timers and observers are released in `destroy()`.

## Reachability (re-run workflow/04 against the built tree)

- [ ] `node tools/check-solvable.mjs` passes: it walks the graph from the entry page over top-bar search, body links and post-gate links, and reports gate unlocks plus unreachable pages. This automates the three items below; do them by hand only for the ones it cannot model.
- [ ] The graph walk from `index.html` reaches every page. Zero orphans.
- [ ] Every `<a>` under `pages/` traces to a legitimate inbound route in the reachability table. Planted clue links are gone.
- [ ] Every key in both plaintext keyword tables appears verbatim in the copy of a reachable page of the same audience.
- [ ] The public keyword table carries no restricted-area URL (default `internal/`; the `secretUrl` CONFIG knob).
- [ ] Every result or list row the visitor may not open resolves to its gate or a plain locked notice; nothing opens its document directly.
- [ ] System containers (M3): every `data-access` account is granted by some login gate (`data-grant`); no page is reachable through a privilege ladder or a shallow-page "related archives" link; and a search hit to a protected document stays unreachable until the named account is authenticated.

## Puzzle integrity (re-run workflow/05 Q4)

- [ ] Leak scan over the built tree: no answer, restatement, derivation rule, or location string on any gate page or inference-chain page. Scan the page **chrome** as well as the form UI — `<title>`, top bar, and footer have all leaked answers in practice.
- [ ] `grep -rn "placeholder=" --include=*.html .` — every value names its field.
- [ ] `grep -rn "data-fail-hint\|gate-hint" --include=*.html .` — failure hints point obliquely at the source (R4). `密码错误 🎂` passes; `想想陈师傅的本命年` fails.
- [ ] `node tools/check-solvable.mjs` resolves every **verbatim** credential to prior page copy, naming the source page. This replaces the manual provenance pass; still replay the walkthrough yourself once, judging tone and pacing.
- [ ] `node tools/check-credentials.mjs` resolves every **derived/composite** credential to its public-page components and asserts zero plaintext: no account string appears whole on any page (client-side masking — `x-show`, a CSS class, an element-level `data-access` — is not privacy on a static site with no server auth; the HTML reaches every visitor).
- [ ] No single page co-locates two components of one credential (a "zero-jump" solve): if the 工号 and the year print on the same page, the player copies both without inferring. Split them per the GDD puzzle allocation table.
- [ ] Result titles in both keyword tables are catalog entries; none summarizes the document's content.

## Consistency (GDD entity registry vs. the built tree)

- [ ] Every shared entity — person name, ID / license number, account, page title, nav label, document number, key date — is byte-identical across the GDD entity registry and every page that carries it. A roster missing a person who appears on a duty schedule, or a page answering to two titles (nav vs. its own `<title>` vs. body references), fails here.
- [ ] Every worked example satisfies the rule it illustrates. A sample account must obey the stated derivation (a "pinyin initials" rule cannot be exemplified by a full-pinyin string), and its shape must match real values (length, separators, mask).
- [ ] No GDD self-contradiction survived into the pages: a value one GDD line forbids is not required by another line on the same page (the registry is the tiebreaker).

## Diegetic neutrality

- [ ] Read each public page as a document of that organization. It is complete, plausible, and gives nothing away. No page mentions the plot.
- [ ] Each announcement, notice, contract, and certificate carries issuing body, document number, date, addressee, signature or seal.
- [ ] No in-world page addresses the player.

## Copy register

- [ ] Guidance text on the entry ritual page is plain declarative sentences.
- [ ] Contrast frames (是…不是… / 是…而是… / 不能…只能…) appear nowhere in site copy (R11). Scan with `grep -rnE '不是|而是|不能.*只能|并非.*而是' pages/ index.html`.
- [ ] No metaphor, personification, or adjectives piled for effect in guidance text or documents.

## Presentation

- [ ] The header stays fixed to the viewport on long pages; body text scrolls beneath it.
- [ ] Core interactions work at phone width.
- [ ] Chrome sweep: load **every** page (plus each search state: hit / miss / forbidden) at desktop and phone width. Collect console errors, `requestfailed` (including every `<img>`), horizontal overflow (`scrollWidth > innerWidth`), and whether each `[x-data]` element actually initialized. Partial passes miss defects — a CSS specificity bug once silently disabled two declared puzzle types on the secret layer only.
- [ ] **Cross-tab session (M3).** Log in, then open a search/result link (`target="_blank"`): the protected document must be unlocked in the new tab too. Close the browser, reopen: signed out. Per-tab `sessionStorage` fails the first half; a session cookie passes. `check-solvable.mjs` models identities as one global set and cannot see this — it reports green either way, so this manual test is the only catch (`references/structure/tooling.md` §3 item 7).
- [ ] No page persists unlock state or reading progress across sessions, and no page explains its storage to the player. `grep -rn "localStorage\|sessionStorage" --include=*.js --include=*.html .` and confirm nothing but the documented session helper touches it.
- [ ] Sensory puzzle hardware requirements are declared on the entry page, and nothing is declared that the site does not actually implement.
- [ ] When M5 is selected: entering the deep area restyles the whole page — background, title, logo, footer — and no theme shift fires in a project that did not select it.

Baseline-test traps for this step: references/common-mistakes.md §8 — check them before returning the artifact.
