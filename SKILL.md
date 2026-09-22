---
name: novel2arg
description: Use when adapting a mystery/suspense novel into an interactive web puzzle game (ARG-lite), or when the user asks for a web puzzle site, an interactive novel adaptation, a puzzle website, or a mystery-novel game adaptation. Also use when such a project drifts toward a single-file SPA, canvas scene engine, inventory-based adventure UI, generic puzzle framework, or random passwords, even when told to "keep it simple" or that an engine was already scaffolded.
---

# novel2arg: Mystery Novel → Interactive Web Puzzle Game

Adapt a mystery/suspense novel into a multi-page static puzzle game disguised as a real website (ARG-lite);
success means the player feels they are infiltrating a real site. The guardrails — four constraints,
canonical rules R1–R12, prohibited forms, baseline rationalizations, red flags, and exclusions — live in
`references/guardrails.md`: read it before step 1 and when reviewing any artifact.

**Project-root convention.** The generated game lives in `<cwd>/<game-name>/` (kebab-case, named after the
novel) unless the user specifies another location. Every `docs/*.md` artifact path in the workflow files is
relative to that project root, not to this skill directory.

## Workflow

Eight steps in order. Each step body lives in `workflow/`; this section routes. Step 2 assembles the system
from the module catalog (`references/design-playbook.md` §2); steps 3–5 fill that system with game content.
The Example column names the artifact-shape anchor included in that step's dispatch prompt, when one exists.

| Step | File | Deliverable | Example | Dispatch |
|---|---|---|---|---|
| 1 Deconstruct the novel | workflow/01-deconstruct.md | five tables | examples/deconstruction-excerpt.md | subagent |
| 2 Choose the container + assemble the system | workflow/02-container.md | `docs/system-profile.md` (modules selected with the user) | — | orchestrator (asks the user) |
| 3 Write the GDD | workflow/03-gdd.md | `docs/gdd.md`, front matter (asset manifest + entity registry) + eight sections | examples/gdd-excerpt.md | subagent → user review checkpoint |
| 4 Reachability chain analysis 触达链分析 | workflow/04-reachability.md | `docs/reachability.md` | examples/reachability-excerpt.md | subagent |
| 5 Puzzle design audit 谜题设计分析 | workflow/05-puzzle-audit.md | `docs/puzzle-audit.md` with dispositions | examples/puzzle-audit-excerpt.md | subagent |
| 6 Scaffold | workflow/06-scaffold.md | framework + every page skeletoned | — | 6a framework (plot-blind) → 6b skeletons (plot-aware) |
| 7 Implementation | workflow/07-implementation.md | finished site | — | one subagent per phase |
| 8 Self-check | workflow/08-self-check.md | `docs/self-check.md`, pass/fail per item | — | subagent |

Step 3 ends with a user review checkpoint: when the subagent returns `docs/gdd.md`, the orchestrator presents it to the user and asks for review before dispatching steps 4 and 5. Approval is required; requested changes go back to step 3.

Steps 4 and 5 are gates. A GDD that fails either returns to step 3 before scaffolding starts.

**Dispatch contract.** The orchestrator writes the prompt, reads the returned artifact, then dispatches the
next step. It performs step 2 itself and delegates the rest. Subagents hold no conversation with the user.
Every subagent prompt carries all six items below (a filled sample: examples/dispatch-prompt.md):

1. the novel text path;
2. the project root (convention above) and the file paths of prior artifacts;
3. that step's deliverable definition, copied from its workflow file;
4. the reference file paths that step cites, plus that step's example file from the table above when one exists;
5. the realism-priority line — references/guardrails.md R12: realism outranks any check, and a conflict goes to the user through the orchestrator;
6. the closing line: "return the artifact plus unresolved questions; route questions back through the orchestrator."

The one exception is step 6a: its prompt carries `docs/system-profile.md` and the infrastructure references
only — no novel text, no plot-bearing artifacts.

## References

- **references/guardrails.md**: four constraints, canonical rules R1–R12 (the single home of every rule more than one file states; `(Rn)` citations elsewhere point here), prohibited forms, baseline rationalizations, red flags, when not to use.
- **references/design-playbook.md**: the step-2 module catalog (13 selectable design modules), the core loop, the 13-type puzzle taxonomy, and the copy rules. Required reading at steps 2 and 3.
- **references/structure/base.md**: shared multi-file front-end base — module-marked directory tree + page skeleton. Required reading at step 6.
- **references/structure/components.md**: Alpine component reference implementations — keyword hash build, search engine, password gates, staging, reskin, progress. Required reading at steps 6 and 7.
- **references/structure/form-website.md**: container A — fake official website: search hub, audience-scoped indexes, gates as the only access. Required reading at steps 3 and 6 when container A is chosen.
- **references/structure/form-system.md**: containers B/C/D — system fictions: account login, per-account access (RBAC-style), desktop / simulated-internet / archive shells, checker conventions. Required reading at steps 3 and 6 when a system container is chosen.
- **references/structure/tooling.md**: check cadence, the shared `tools/config.mjs` knobs, and the nine manual methods no static checker replaces. Required reading at step 8.
- **references/common-mistakes.md**: baseline-test traps grouped by workflow step; each step file cites its section.
- **examples/**: artifact excerpts anchoring the expected shape of steps 1/3/4/5, plus a filled dispatch-prompt sample for the orchestrator.
- **assets/tools/**: dependency-free Node files copied into every project at step 6 — `config.mjs` (shared conventions every checker imports; the one file a renamed project edits), `hash.mjs` (design-time gate hashes, steps 3/5), `build-keywords.mjs` (plaintext tables → hash tables; re-run after every src edit), `check-links.mjs` (dead links + public-index leaks), `check-solvable.mjs` (cold-start walk: reachable + solvable + search earned), `check-credentials.mjs` (composite/derived credentials: parts + rule + zero-plaintext — the half `check-solvable` cannot model), `check-reachability.mjs` (rehearsal build: inject the credentials into a throwaway copy, then prove gates unlock + pages reachable), and `vendor-alpine.mjs` (downloads the pinned Alpine runtime, sha256-verified, step 6). `site-model.mjs` is the shared parsing + walk core every site-reading tool imports; `site-graph.mjs` builds `docs/site-graph.json` (vertices are pages, edges carry their guard and credential provenance) and injects it into the `assets/viewer/` renderer tree to emit the self-contained `docs/site-graph/` folder — a reporting tool, not a gate. Steps 7 and 8 run build-keywords, check-links, and check-solvable; a project with derived credentials or a system container also runs check-credentials and check-reachability. The canonical pass/fail checklist is workflow/08-self-check.md.
- **assets/viewer/**: `graph-viewer.html`, the dependency-free SVG renderer framework `site-graph.mjs` injects the graph JSON into; copied into every project's `viewer/` at step 6 (site-graph resolves it at `../viewer/graph-viewer.html`).
- **assets/fixtures/**: `mini-site/`, the miniature site `site-graph.mjs --self-test` builds its graph from — reachable pages, one stuck gate, one orphan, both credential kinds. It stays in the skill repo and is never copied into a project.

## Repo self-checks

`scripts/check-docs.mjs` validates this skill's own docs: file paths, `§N` / `§N.M` citations, rule IDs,
markdown links, and orphan documents. CI (`.github/workflows/ci.yml`) runs it together with
`node assets/tools/check-solvable.mjs --self-test`. Run `node scripts/check-docs.mjs` after editing any
file in this repo.
