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
| 3 Write the GDD | workflow/03-gdd.md | `docs/gdd.md` (asset manifest + eight sections) + `docs/registry.md` (entity registry) | examples/gdd-excerpt.md | 3a docs/gdd-plan.md → 3b gdd → 3c registry → 3d reconcile (subagents) → user review checkpoint |
| 4 Reachability chain analysis 触达链分析 | workflow/04-reachability.md | `docs/reachability.md` | examples/reachability-excerpt.md | subagent |
| 5 Puzzle design audit 谜题设计分析 | workflow/05-puzzle-audit.md | `docs/puzzle-audit.md` with dispositions | examples/puzzle-audit-excerpt.md | subagent |
| 6 Scaffold | workflow/06-scaffold.md | framework + every page skeletoned | — | 6a framework (plot-blind) → 6b skeletons (plot-aware) |
| 7 Implementation | workflow/07-implementation.md | finished site | — | one subagent per phase |
| 8 Self-check | workflow/08-self-check.md | `docs/self-check.md`, pass/fail per item | — | 3 parallel subagents (lanes A/B/C) + merge |

Step 3 ends with a user review checkpoint: after round 3d returns, the orchestrator presents the
artifacts to the user and asks for review before dispatching steps 4 and 5. Approval is required;
requested changes go back to step 3.

Steps 4 and 5 are gates. A GDD that fails either returns to step 3 before scaffolding starts.

**Dispatch contract.** The orchestrator writes the prompt, reads the returned artifact, then dispatches the
next step. It performs step 2 itself and delegates the rest. Subagents hold no conversation with the user.
Every subagent prompt carries all six items below (a filled sample: examples/dispatch-prompt.md):

1. the novel text path — step 1 always; step 3 only as a fallback when `docs/deconstruction.md` lacks a life trace the GDD needs (the prompt says so explicitly); no other step receives it, and their prompts state that the novel must not be read;
2. the project root (convention above) and the file paths of prior artifacts — naming the sections the step file specifies (e.g. `docs/gdd.md` sections 1, 2, 4), never a whole file where a section list exists;
3. that step's deliverable definition, copied from its workflow file;
4. the reference file paths that step cites, plus that step's example file from the table above when one exists;
5. the realism-priority line — references/guardrails.md R12: realism outranks any check, and a conflict goes to the user through the orchestrator;
6. the closing line: "return the artifact plus unresolved questions; route questions back through the orchestrator."

The one exception is step 6a: its prompt carries `docs/system-profile.md` and the infrastructure references
only — no novel text, no plot-bearing artifacts.

Step 3 dispatches the six items four times, once per round; which files each round's prompt names is
specified in `workflow/03-gdd.md`.
