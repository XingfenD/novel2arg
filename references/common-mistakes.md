# Baseline-Test Common Mistakes (observed; avoid each)

Traps observed while running this skill on real projects, grouped by the workflow step that owns them.
Each step file cites its section; when a step cites this file, the orchestrator includes it in that
subagent's dispatch prompt. Check the section before returning the step's artifact. Section numbers
follow the workflow steps; rule IDs `(Rn)` cite the canonical table in `references/guardrails.md`.

## Step 1 — Deconstruct

| Mistake | Correct approach |
|---|---|
| Story chronology only | Twist points reordered by player discovery; the central twist page releases multiple side hooks in one page |

## Step 2 — Container & Module Selection

| Mistake | Correct approach |
|---|---|
| An account/login system stuffed into a story that has no system fiction | Reach follows the container: a public website differentiates by search and gates, a system fiction by accounts (`workflow/02-container.md`) |
| Every optional module turned on "to be safe", or the reskin impact chosen without asking | Modules are selected with the user at step 2 and recorded in `docs/system-profile.md`; the built site matches the selection exactly |

## Step 3 — Write the GDD

| Mistake | Correct approach |
|---|---|
| Puzzles detached from characters (abstract mechanisms, random passwords) | Password = character inference; finding the password = understanding a character (R3) |
| Horror delivered through adjectives and jump-scare copy | Horror delivered through bureaucratic ledgers, repetition (one sentence copied 21 times), absence (unanswered posts, `[deleted]`) |
| An ending that is a score | The ending reuses documents the player has just read; a moral choice + fourth-wall close when M10 is selected |
| No progress feedback when M7 is selected | `NN/total` in each page footer; deep pages use anomalous numbering such as `ex/total` |
| (Website form) one flat keyword index spanning both areas; (system forms) access maintained in the keyword JSONs | Website form: one index per audience (R8). System forms: one index, and the account matrix on the pages decides what a hit opens — access never lives in the JSON (R10; `references/structure/form-system.md` §1) |
| (System forms) a colleague's login printed on a public page (`账号：chen.gd` in the roster) | Only the initial account may be printed; every other account is inferred from text clues (R10; `references/structure/form-system.md` §1) |
| GDD contradicts itself — a page named two ways (page map vs. nav vs. its own title), or a value one line forbids and another requires on the same page | Run the step-3 self-consistency scan before the user checkpoint; `docs/registry.md` is the single source of truth every page copies |
| A worked example that violates the rule it illustrates (sample `wang00□□` against a "pinyin initials" rule, or the wrong shape) | Every example satisfies its stated derivation and matches the real value's length / separators / mask |
| Two components of one credential co-located on a page (工号 + year together → zero-jump solve) | Split the components across pages so the derivation is the puzzle (R3; GDD puzzle allocation table) |

## Step 4 — Reachability

| Mistake | Correct approach |
|---|---|
| Links planted to chain clue → clue | Clue delivery rides the site's own IA: nav bar, index and listing pages, sitemap, search (R7) |
| Shallow page links a deep page under "related files / archives / pages" | Same-area references only; depth is crossed by a reach module (R7; `references/structure/form-system.md` §1) |
| Numeric privilege ladder, or an admin account that opens everything | Per-account access: a page opens only to the accounts it names (`data-access`); no privilege inheritance (R10; `references/structure/form-system.md` §1) |
| Result titles that summarize the plot ("…完整版", "四名家长信息") | Catalog entries as the archive would print them: issuing body + document type + number/date (R9) |
| An unreadable entry with no way to understand it is locked | It resolves to its gate or a plain locked notice; it never opens the document (R8) |
| Orphan pages nobody can reach | Step 4 audits the graph before scaffolding; step 8 re-walks it after |

## Step 5 — Puzzle Audit

| Mistake | Correct approach |
|---|---|
| The answer in a `placeholder` or help text | Field names only; oblique failure hints carry the feedback (R4) |
| A gate kept because it is already written | Step 5 necessity question; a blank justification means 删除 |
| Printing a derived account on a public page to make `check-solvable` green | It only matches verbatim strings, so a derived credential reads STUCK; prove it with `check-credentials.mjs` (parts + rule + zero-plaintext), never by printing it — a static site has no server auth, so client-side masking is not privacy |

## Step 6 — Scaffold

| Mistake | Correct approach |
|---|---|
| Building a SPA adventure engine (canvas scenes, generic puzzle framework) | Multi-page fake system; each page is an independently openable "document" (R1) |
| A module drift: the framework ships machinery the profile did not select, or misses one it did | Build exactly the selected modules — no unused skins, search tables, gate components, or account furniture (`workflow/06-scaffold.md`) |
| Keywords stored in plaintext JSON | Build script hashes them into a table, preventing "read the source to win" (R3) |
| Rewriting a checker to fit a renamed project | The shared `tools/config.mjs` absorbs renamed dirs, layer names, markers, and the search mount for both checkers; `references/structure/tooling.md` §2 lists the knobs and §3 the steps no static check replaces |
| (6a) The prompt carries the novel, GDD, or other plot-bearing artifacts | 6a reads only `docs/system-profile.md` plus the infrastructure references; keeping plot out of its context is the point of the split |
| (6a) Plot copy written into base pages to fill empty bodies | Base pages carry the system's own words; empty or placeholder bodies are correct at this stage |
| (6b/7) Rebuilding or restyling the framework 6a produced | The shell, skins, components, and tools are fixed at 6a; 6b adds skeletons, step 7 fills content |

## Step 7 — Implementation

| Mistake | Correct approach |
|---|---|
| Plot stated on a public page ("head chef — and the man who vanished in 2019") | Public pages publish what that organization publishes; the player assembles the plot from the secret layer (R5) |
| Announcements written as game hints | Real document format: issuer, number, date, addressee, body, seal, distribution list (R6) |
| Guidance copy decorated with metaphor and personification | Plain declarative sentences (R11) |
| Contrast frames in site copy (是…不是… / 是…而是…) | One positive clause per sentence (R11; `references/design-playbook.md` §4.14) |
| Orchestrator writes the pages itself | One subagent per workflow step; the orchestrator dispatches and reviews |
| A declared image / seal / scan / photo never landed (no `<img>` written, so no checker complains) | Step 7 phase 4 owns the GDD asset manifest; step 8 reconciles every declared asset against files + references |
| One login split into two forms to give the checker "one form = one identity" | One box + `data-grants` (account→identity map); two forms leak the design intent in the title and read as game UI (`references/structure/form-system.md` §2) |
| Access state in per-tab `sessionStorage` behind a `target="_blank"` result | Session cookie (cross-tab); the new tab the result opens else reads as logged out (`references/structure/components.md` §2–§3) |
| Credential printed in plaintext to satisfy a static checker | Zero-plaintext: `check-credentials.mjs` asserts no account appears whole; client-side masking is not privacy on a static site |

## Step 8 — Self-Check

| Mistake | Correct approach |
|---|---|
| The answer leak-scanned only in form UI | Scan the page **chrome** too — `<title>`, top bar, footer. An answer printed in a header is the same defect as one in a `placeholder` (R4) |
| Cross-tab unlock left untested because `check-solvable` is green | It models identities as one global set and cannot see per-tab isolation; run the manual new-tab test (log in → open a `target="_blank"` result → the protected doc must be unlocked there) |
| Asset manifest unreconciled | Every GDD-declared asset exists under `assets/` and is referenced by ≥1 page; an `<img>` never written has no `src` for check-links to resolve |
| Shared entities drift between pages | Reconcile names / IDs / accounts / page titles / dates against `docs/registry.md`; a roster missing a duty-schedule person, or a page under two titles, fails here |
| Shipping without a solvability check | Copy `assets/tools/check-solvable.mjs` in at scaffold time. It proves every gate stays solvable and every page reachable after content edits, and turns red when a leak fix removes a clue. For derived credentials add `check-credentials.mjs` + `check-reachability.mjs` |
