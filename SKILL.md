---
name: novel2arg
description: Use when adapting a mystery/suspense novel into an interactive web puzzle game (ARG-lite), or when the user asks for a web puzzle site, an interactive novel adaptation, a puzzle website, or a mystery-novel game adaptation. Also use when such a project drifts toward a single-file SPA, canvas scene engine, inventory-based adventure UI, generic puzzle framework, or random passwords, even when told to "keep it simple" or that an engine was already scaffolded.
---

# novel2arg: Mystery Novel → Interactive Web Puzzle Game

Adapt a mystery/suspense novel into a multi-page static puzzle game disguised as a real website (ARG-lite);
success means the player feels they are infiltrating a real site. The guardrails — four constraints,
prohibited forms, baseline rationalizations, red flags, and exclusions — live in `references/paradigm.md`:
read it before step 1 and when reviewing any artifact.

## Workflow

Eight steps in order. Each step body lives in `workflow/`; this section routes.

| Step | File | Deliverable | Dispatch |
|---|---|---|---|
| 1 Deconstruct the novel | workflow/01-deconstruct.md | five tables | subagent |
| 2 Select the world container | workflow/02-container.md | GDD cover-page record | orchestrator (asks the user) |
| 3 Write the GDD | workflow/03-gdd.md | `docs/gdd.md`, eight sections | subagent → user review checkpoint |
| 4 Reachability chain analysis 触达链分析 | workflow/04-reachability.md | `docs/reachability.md` | subagent |
| 5 Puzzle design audit 谜题设计分析 | workflow/05-puzzle-audit.md | `docs/puzzle-audit.md` with dispositions | subagent |
| 6 Scaffold | workflow/06-scaffold.md | file tree, every page skeletoned | subagent |
| 7 Implementation | workflow/07-implementation.md | finished site | one subagent per phase |
| 8 Self-check | workflow/08-self-check.md | `docs/self-check.md`, pass/fail per item | subagent |

Step 3 ends with a user review checkpoint: when the subagent returns `docs/gdd.md`, the orchestrator presents it to the user and asks for review before dispatching steps 4 and 5. Approval is required; requested changes go back to step 3.

Steps 4 and 5 are gates. A GDD that fails either returns to step 3 before scaffolding starts.

**Dispatch contract.** The orchestrator writes the prompt, reads the returned artifact, then dispatches the next step. It performs step 2 itself and delegates the rest. Every prompt carries: the novel text path, file paths of prior artifacts, that step's deliverable definition copied from its workflow file, the reference file paths that step cites, the realism priority (references/paradigm.md: realism outranks any check, and a conflict goes to the user through the orchestrator), and the closing line "return the artifact plus unresolved questions; route questions back through the orchestrator." Subagents hold no conversation with the user.

## References

- **references/paradigm.md**: four constraints, prohibited forms, baseline rationalizations, red flags, when not to use.
- **references/design-paradigms.md**: six-dimension design paradigm (flow / puzzles / copy / typography / conflict / interaction) + 13-type puzzle taxonomy. Required reading at step 3.
- **references/structure/base.md**: shared multi-file front-end base + reference implementations for the search engine / password gates / skins / staging modules. Required reading at step 6.
- **references/structure/form-website.md**: container A — fake official website: search hub, layer-scoped indexes, gates as the only access. Required reading at steps 3 and 6 when container A is chosen.
- **references/structure/form-system.md**: containers B/C/D — system fictions: account login, per-account access (RBAC-style), desktop / simulated-internet / archive shells, checker conventions. Required reading at steps 3 and 6 when a system container is chosen.
- **references/common-mistakes.md**: baseline-test traps grouped by workflow step; each step file cites its section.
- **assets/tools/**: four dependency-free scripts copied into every project at step 6 — `hash.mjs` (gate hashes), `build-keywords.mjs` (plaintext tables → hash tables), `check-links.mjs` (dead links + surface-index layer leaks), and `check-solvable.mjs` (cold-start walk: reachable + solvable + search earned). Run all of them at step 8. Each checker's `CONFIG` block absorbs renamed directories and markers; references/structure/base.md §10 lists the knobs and the manual methods that remain.
