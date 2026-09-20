# Step 8 — Self-Check

**Input:** the finished site plus all `docs/` artifacts. **Output:** a pass/fail line per item, written to `docs/self-check.md`. Every item must pass.

## Structure

- [ ] `find . -name "*.html" | wc -l` returns 10 or more. The deliverable is a multi-HTML file tree.
- [ ] `node tools/check-links.mjs` reports zero dead links.
- [ ] `grep -rL "alpine.min.js" --include=*.html .` returns nothing.
- [ ] `grep -rn "keywords.src" --include=*.html .` returns nothing.
- [ ] Console on the entry page and one secret page: zero errors, zero 404s.
- [ ] Timers and observers are released in `destroy()`.

## Reachability (re-run workflow/04 against the built tree)

- [ ] The graph walk from `index.html` reaches every page. Zero orphans.
- [ ] Every `<a>` under `pages/` traces to a legitimate inbound route in the reachability table. Planted clue links are gone.
- [ ] Every key in `data/keywords.src.json` appears verbatim in the copy of a reachable page.

## Puzzle integrity (re-run workflow/05 Q4)

- [ ] Leak scan over the built tree: no answer, restatement, derivation rule, or location string on any gate page or inference-chain page.
- [ ] `grep -rn "placeholder=" --include=*.html .` — every value names its field.
- [ ] Failure hints point obliquely at the source. `密码错误 🎂` passes; `想想陈师傅的本命年` fails.
- [ ] Full walkthrough from `index.html` along the GDD page map. Record the source page for every credential; each one traces to prior page copy.

## Diegetic neutrality

- [ ] Read each `pages/surface/` and `pages/platform/` page as a document of that organization. It is complete, plausible, and gives nothing away. No page mentions the plot.
- [ ] Each announcement, notice, contract, and certificate carries issuing body, document number, date, addressee, signature or seal.
- [ ] No in-world page addresses the player.

## Copy register

- [ ] Guidance text on the entry ritual page is plain declarative sentences.
- [ ] Contrast frames (是…不是… / 是…而是… / 不能…只能…) appear nowhere in site copy. Scan with `grep -rnE '不是|而是|不能.*只能|并非.*而是' pages/ index.html`.
- [ ] No metaphor, personification, or adjectives piled for effect in guidance text or documents.

## Presentation

- [ ] The header stays fixed to the viewport on long pages; body text scrolls beneath it.
- [ ] Core interactions work at phone width.
- [ ] Sensory puzzle hardware requirements are declared on the entry page.
- [ ] Secret-layer entry reskins the whole page: background, title, logo, footer.
