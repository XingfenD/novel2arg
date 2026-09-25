---
name: make-my-arg
description: Use when generating a multi-page static web puzzle game (ARG-lite) from any story source — a novel, a screenplay, setting material, or the user's own idea — or when the user asks for a web puzzle site, an interactive story adaptation, a puzzle website, or a mystery game disguised as a real website. Also use when such a project drifts toward a single-file SPA, canvas scene engine, inventory-based adventure UI, generic puzzle framework, or random passwords, even when told to "keep it simple" or that an engine was already scaffolded.
---

# make-my-arg: Story Source → Interactive Web Puzzle Game

Build a multi-page static puzzle game disguised as a real website (ARG-lite) from any story source — a novel,
a screenplay, setting material, or the user's own idea; success means the player feels they are infiltrating
a real site. The guardrails — four constraints,
canonical rules R1–R12, prohibited forms, baseline rationalizations, red flags, and exclusions — live in
`references/guardrails.md`: read it before step 1 and when reviewing any artifact.

**Project-root convention.** The generated game lives in `<cwd>/<game-name>/` (kebab-case, named after the
story) unless the user specifies another location. Every `docs/*.md` artifact path in the workflow files is
relative to that project root, not to this skill directory.

## Workflow

Eight steps. Each step body lives in `workflow/`; this section routes. Step 2 assembles the system
from the module catalog (`references/design-playbook.md` §2); steps 3–5 fill that system with game content.
Most of the sequence is strict, but four dispatches overlap: 3b∥3c, 4∥5, 6a alongside 3–5, and inside step 7
(4a with 1–3, 5 with 3). The Example column names the artifact-shape
anchor included in that step's dispatch prompt, when one exists.

| Step | File | Deliverable | Example | Dispatch |
|---|---|---|---|---|
| 1 Story intake | workflow/01-story-intake.md | five tables | examples/story-canon-excerpt.md | long-form source: one subagent per chunk → 1 merge (past ~150k tokens), single subagent below; structured material / original idea: orchestrator; user checkpoint after the tables when any row is invented |
| 2 Choose the container + assemble the system | workflow/02-container.md | `docs/system-profile.md` (modules selected with the user) | — | orchestrator (asks the user) |
| 3 Write the GDD | workflow/03-gdd.md | `docs/gdd.md` (asset manifest + eight sections) + `docs/registry.md` (entity registry) | examples/gdd-excerpt.md | 3a gdd-plan → (3b gdd ∥ 3c registry) → 3d reconcile (subagents) → user review checkpoint |
| 4 Reachability chain analysis 触达链分析 | workflow/04-reachability.md | `docs/reachability.md` | examples/reachability-excerpt.md | subagent — dispatched together with step 5 |
| 5 Puzzle design audit 谜题设计分析 | workflow/05-puzzle-audit.md | `docs/puzzle-audit.md` with dispositions | examples/puzzle-audit-excerpt.md | subagent — dispatched together with step 4 |
| 6 Scaffold | workflow/06-scaffold.md | framework + every page skeletoned | — | 6a framework (plot-blind; after step 2, parallel to 3–5) → 6b skeletons (plot-aware; after 6a and the gates) |
| 7 Implementation | workflow/07-implementation.md | finished site | — | one subagent per phase; 1→2→3 chained, 4a ∥ 1, 4b after 3, 5 ∥ 3, 6 after 3, 7 last |
| 8 Self-check | workflow/08-self-check.md | `docs/self-check.md`, pass/fail per item | — | 3 parallel subagents (lanes A/B/C) + merge |

Step 1 ends with a user confirmation checkpoint when the canon tables carry `invented` rows — always for
an original idea, only on delegated gap-fills otherwise: the orchestrator presents the five tables, and
step 2 starts only after approval; requested changes go back to step 1.

Step 3 ends with a user review checkpoint: after round 3d returns, the orchestrator presents the
artifacts to the user and asks for review before dispatching the gates. Approval is required;
requested changes go back to step 3.

Steps 4 and 5 are gates. A GDD that fails either returns to step 3 before scaffolding starts. They
dispatch together in one message; the orchestrator cross-checks the pages step 4 cuts against the
source-page column step 5's audit cites.

Step 6a dispatches the moment step 2 returns, in parallel with steps 3–5; only 6b waits for both it
and the gates.

**Dispatch contract.** The orchestrator writes the prompt, reads the returned artifact, then dispatches the
next step. It performs step 2 itself and delegates the rest. Subagents hold no conversation with the user.
Where a step file marks rounds parallel, their prompts go out together in one message and the orchestrator
merges the returns.
Every subagent prompt carries all six items below (a filled sample: examples/dispatch-prompt.md):

1. the story source path — step 1 always; step 3 only as a fallback when `docs/story-canon.md` lacks a life trace the GDD needs (the prompt says so explicitly); no other step receives it, and their prompts state that the raw source material must not be read;
2. the project root (convention above) and the file paths of prior artifacts — naming the sections the step file specifies (e.g. `docs/gdd.md` sections 1, 2, 4), never a whole file where a section list exists;
3. that step's deliverable definition, copied from its workflow file;
4. the reference file paths that step cites, plus that step's example file from the table above when one exists;
5. the realism-priority line — references/guardrails.md R12: realism outranks any check, and a conflict goes to the user through the orchestrator;
6. the closing line: "return the artifact plus unresolved questions; route questions back through the orchestrator."

A prompt carries paths and the round definition — nothing else: never an inline digest of an artifact the
round is about to read (the file is the input; a prompt summary is input the round has to hold twice), and
never required reading beyond what the step file cites (the step file's list is complete — nothing gets
added at dispatch time).

The one exception is step 6a: its prompt carries `docs/system-profile.md` and the infrastructure references
only — no raw story source, no plot-bearing artifacts.

Step 3 dispatches the six items four times, once per round (3b and 3c together in one message); which files each round's prompt names is specified in `workflow/03-gdd.md`.
