# Step 6 — Scaffold

**Input:** `docs/gdd.md`, `docs/reachability.md`, `docs/puzzle-audit.md`. **Output:** the file tree. Required reading first: references/paradigm.md (prohibited forms), references/structure/base.md, plus the chosen container's form doc (references/structure/form-website.md for A, references/structure/form-system.md for B/C/D).

Create the multi-file project strictly per references/structure/base.md §1, using the page skeleton in §2 for every page.

Minimum structure:

- entry ritual page (`index.html`)
- surface page directory
- secret page directory
- three skin CSS files (`base.css`, `surface.css`, `secret.css`, plus `forbidden.css` when a forbidden-word trigger is in the puzzle set)
- vendored Alpine runtime (`assets/js/vendor/alpine.min.js`)
- `components.js` carrying the search, gate, staging, and progress components
- the six verification tools copied from this skill's `assets/tools/` into `tools/`: `hash.mjs`, `build-keywords.mjs`, `check-links.mjs`, `check-solvable.mjs`, `check-credentials.mjs`, `check-reachability.mjs` (they are dependency-free and run on Node built-ins)
- dual ending pages
- `docs/` holding the artifacts from steps 1 to 5

Pages stay separate documents with real navigation. Alpine manages in-page component lifecycle (`init()` / `destroy()`) only; routing and scene switching stay out of it.

Scaffold every page listed in the reachability table as a skeleton with the correct skin, header nav, footer, and progress number. Empty bodies are fine at this stage; a missing file breaks the graph walk in step 8.

Baseline-test traps for this step: references/common-mistakes.md §6 — check them before returning the artifact.
