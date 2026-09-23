# Step 6 — Scaffold

Two dispatches in order: 6a builds the system framework with no plot in its context; 6b completes the page skeletons with the plot artifacts. **Output:** the file tree, every page skeletoned.

**Inputs:** 6a: `docs/system-profile.md`, references/guardrails.md (prohibited forms), references/structure/base.md, references/structure/components.md, and the chosen container's form doc (references/structure/form-website.md for A, references/structure/form-system.md for B/C/D). 6b: `docs/gdd.md`, `docs/reachability.md`, `docs/puzzle-audit.md`, the 6a framework, plus the same references.

## 6a — Front-end system framework (plot-blind)

Step 2 wrote `docs/system-profile.md` with the user; 6a consumes it. The profile is the assembly record:
container and form doc; system identity (type, organization, era, register, language); selected modules; shell
IA (top bar, directory layout, page root, site roots for C); base pages; infrastructure (base.md sections,
components.js, vendored Alpine, tools/, CONFIG knobs); index/access convention; numbering choice. It carries no
characters, plot, secrets, clue design, endings, novel text, or prior artifacts.

Build the framework strictly per `references/structure/base.md` §1, using the page skeleton in
`references/structure/base.md` §2 for every page, and the form doc:

- the full directory tree, areas included (base.md's naming rules: the restricted area takes the fiction's own word, never `secret/`)
- `index.html` entry shell (start button; rules placeholders only where the profile lists any — its copy lands in step 7 phase 7) plus the `about.html` page the entry links, introducing where the project came from
- the system shell and base pages — A: home, nav/index/listing templates, search results, login/gate template; B: `desk.html` plus empty app shells; C: site roots, intranet home and login; D: `query.html`, `results.html`, detail template
- the skin CSS the profile selects (`base.css` and `surface.css` always; `secret.css` only with M5; `forbidden.css` only with M6), `components.js` with only the selected components (search / gate / access / staging / progress; reference implementations: `references/structure/components.md`), the vendored Alpine runtime (`assets/js/vendor/alpine.min.js`, produced by `node tools/vendor-alpine.mjs`, which pins the version and verifies the sha256 before writing)
- the tool files copied from this skill's `assets/tools/` into `tools/` (`config.mjs` — shared conventions every checker imports, the one file a renamed project edits — plus `hash.mjs`, `build-keywords.mjs`, `check-links.mjs`, `check-solvable.mjs`, `check-credentials.mjs`, `check-reachability.mjs`, `vendor-alpine.mjs`, `site-model.mjs`, and `site-graph.mjs`; dependency-free, Node built-ins only), the renderer tree `assets/viewer/` copied whole into `viewer/` (`graph-viewer.html` shell plus `css/` and `js/` — site-graph resolves the template at `../viewer/graph-viewer.html`), and empty-but-valid keyword table(s) only when M1 is selected
- the two ignore files, which ride inside the starter tree as `.gitignore` and `.dockerignore` and land at the project root with the copy. They are not decoration — without them the plaintext `data/*.src.json` tables are committed and shipped, and the generated `docs/site-graph.*` + an agent's `memory/` dress up as project content (`references/structure/base.md` §1)
- ending pages when M10 is selected, and `docs/` holding the artifacts from steps 1 to 5
- every base page on the `references/structure/base.md` §2 skeleton: correct skin, header nav, footer, progress number when M7 is selected, empty or placeholder body

The framework is a real system's shell, not a game: no plot copy anywhere, and filenames do not spoil. Base page copy uses the system's own words (通知公告, 通讯录), never the story's. Pages stay separate documents with real navigation; Alpine manages in-page component lifecycle (`init()` / `destroy()`) only — routing and scene switching stay out of it.

**Returns:** the changed file list plus unresolved questions, routed back through the orchestrator.

## 6b — Page skeletons (plot-aware)

On the 6a framework, scaffold every page listed in the reachability table as a skeleton with the correct skin, header nav, footer, and progress number (when M7 is selected). Empty bodies are fine at this stage; a missing file breaks the graph walk in step 8. The ending pages are skeletons here; their copy lands in step 7.

The framework is fixed: do not rebuild the shell, CSS, components, or tools — add the page set only.

Baseline-test traps for this step: references/common-mistakes.md §6 — check them before returning the artifact.
