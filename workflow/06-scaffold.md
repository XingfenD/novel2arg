# Step 6 — Scaffold

Two dispatches in order: 6a builds the system framework with no plot in its context; 6b completes the page skeletons with the plot artifacts.

**Inputs:** 6a: `docs/system-profile.md`, references/paradigm.md (prohibited forms), references/structure/base.md, the chosen container's form doc. 6b: `docs/gdd.md`, `docs/reachability.md`, `docs/puzzle-audit.md`, the 6a framework, plus the same references.

## 6a — Front-end system framework (plot-blind)

The orchestrator writes `docs/system-profile.md` before dispatching. It is a filtered extraction, not a copy: the container and its form doc; the system identity (system type, organization name, era, register, language); the shell IA (top bar items, directory layout, page root, site roots for C); the list of base pages every such system has; the infrastructure requirements (base.md sections, dual-skin mechanism, components.js, vendored Alpine, tools/, checker CONFIG knobs); the search/index convention (layer-scoped tables for A, one index for B/C/D); the progress-numbering convention. It carries no characters, plot, secrets, clue design, endings, novel text, or prior artifacts.

Build the framework strictly per references/structure/base.md §1–§2 and the form doc:

- the full directory tree, layer directories included
- `index.html` entry shell (start button, rules and honor-agreement placeholders; its copy lands in step 7 phase 6)
- the system shell and base pages — A: home, nav/index/listing templates, search results, login/gate template; B: `desk.html` plus empty app shells; C: site roots, intranet home and login; D: `query.html`, `results.html`, detail template
- the skin CSS set (`base.css`, `surface.css`, `secret.css`, plus `forbidden.css` only when the profile declares the forbidden trigger), `components.js` (search / gate / access / staging / progress), the vendored Alpine runtime, `tools/` with the four checkers, empty-but-valid keyword table(s) in the profile's convention
- every base page on the §2 skeleton: correct skin, header nav, footer, progress number, empty or placeholder body

The framework is a real system's shell, not a game: no plot copy anywhere, and filenames do not spoil. Base page copy uses the system's own words (通知公告, 通讯录), never the story's. Pages stay separate documents with real navigation; Alpine manages in-page component lifecycle (`init()` / `destroy()`) only — routing and scene switching stay out of it.

**Returns:** the changed file list plus unresolved questions, routed back through the orchestrator.

## 6b — Page skeletons (plot-aware)

On the 6a framework, scaffold every page listed in the reachability table as a skeleton with the correct skin, header nav, footer, and progress number. Empty bodies are fine at this stage; a missing file breaks the graph walk in step 8. The dual ending pages are skeletons here; their copy lands in step 7.

The framework is fixed: do not rebuild the shell, CSS, components, or tools — add the page set only.

Baseline-test traps for this step: references/common-mistakes.md §6 — check them before returning the artifact.
