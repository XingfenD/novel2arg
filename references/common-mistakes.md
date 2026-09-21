# Baseline-Test Common Mistakes (observed; avoid each)

Traps observed while running this skill on real projects, grouped by the workflow step that owns them.
Each step file cites its section; when a step cites this file, the orchestrator includes it in that
subagent's dispatch prompt. Check the section before returning the step's artifact. Section numbers
follow the workflow steps; rule IDs `(Rn)` cite the canonical table in references/guardrails.md.

Step 2 has no section: it stays with the orchestrator (a single user-facing container choice) and no
baseline trap has been recorded for it yet. The numbering below follows the workflow steps, so the
Step-2 section is intentionally absent, not missing.

## Step 1 — Deconstruct

| Mistake | Correct approach |
|---|---|
| Story chronology only | Twist points reordered by player discovery; the central twist page releases multiple side hooks in one page |

## Step 3 — Write the GDD

| Mistake | Correct approach |
|---|---|
| Puzzles detached from characters (abstract mechanisms, random passwords) | Password = character inference; finding the password = understanding a character (R3) |
| Horror delivered through adjectives and jump-scare copy | Horror delivered through bureaucratic ledgers, repetition (one sentence copied 21 times), absence (unanswered posts, `[deleted]`) |
| A single ending, or an ending that is a score | A two-option moral dilemma ending + a fourth-wall close + a sequel hook |
| No progress feedback | `NN/total` in each page footer; secret pages use anomalous numbering such as `ex/total` |
| (Website form) one flat keyword index spanning both layers; (system forms) access maintained in the keyword JSONs | Website form: one index per layer (R8). System forms: one index, and the account matrix on the pages decides what a hit opens — access never lives in the JSON (R10; references/structure/form-system.md §1) |
| (System forms) a colleague's login printed on a public page (`账号：chen.gd` in the roster) | Only the initial account may be printed; every other account is inferred from text clues (R10; references/structure/form-system.md §1) |

## Step 4 — Reachability

| Mistake | Correct approach |
|---|---|
| Links planted to chain clue → clue | Clue delivery rides the site's own IA: nav bar, index and listing pages, sitemap, search (R7) |
| Shallow page links a deep page under "related files / archives / pages" | Same-layer references only; depth is crossed by search, a gate, or an account login (R7; references/structure/form-system.md §1) |
| Numeric clearance ladder, or an admin account that opens everything | Per-account access: a page opens only to the accounts it names (`data-access`); no privilege inheritance (R10; references/structure/form-system.md §1) |
| Result titles that summarize the plot ("…完整版", "四名家长信息") | Catalog entries as the archive would print them: issuing body + document type + number/date (R9) |
| A 机密 badge with no gate behind it | Every classified result shows `[Access denied]` or resolves to a clearance gate (R8) |
| Orphan pages nobody can reach | Step 4 audits the graph before scaffolding; step 8 re-walks it after |

## Step 5 — Puzzle Audit

| Mistake | Correct approach |
|---|---|
| The answer in a `placeholder` or help text | Field names only; oblique failure hints carry the feedback (R4) |
| A gate kept because it is already written | Step 5 necessity question; a blank justification means 删除 |

## Step 6 — Scaffold

| Mistake | Correct approach |
|---|---|
| Building a SPA adventure engine (canvas scenes, inventory, generic puzzle framework) | Multi-page fake website; each page is an independently openable "document" (R1) |
| A single visual theme | Light/dark dual skins; instant full-page reskin on entering the secret layer (R2) |
| Keywords stored in plaintext JSON | Build script hashes them into a table, preventing "read the source to win" (R3) |
| Rewriting a checker to fit a renamed project | The shared `tools/config.mjs` absorbs renamed dirs, layer names, markers, and the search mount for both checkers; references/structure/tooling.md §2 lists the knobs and §3 the steps no static check replaces |
| (6a) The prompt carries the novel, GDD, or other plot-bearing artifacts | 6a reads only `docs/system-profile.md` plus the infrastructure references; keeping plot out of its context is the point of the split |
| (6a) Plot copy written into base pages to fill empty bodies | Base pages carry the system's own words; empty or placeholder bodies are correct at this stage |
| (6b/7) Rebuilding or restyling the framework 6a produced | The shell, skins, components, and tools are fixed at 6a; 6b adds skeletons, step 7 fills content |

## Step 7 — Implementation

| Mistake | Correct approach |
|---|---|
| Plot stated on a public page ("head chef — and the man who vanished in 2019") | Public pages publish what that organization publishes; the player assembles the plot from the secret layer (R5) |
| Announcements written as game hints | Real document format: issuer, number, date, addressee, body, seal, distribution list (R6) |
| Guidance copy decorated with metaphor and personification | Plain declarative sentences (R11) |
| Contrast frames in site copy (是…不是… / 是…而是…) | One positive clause per sentence (R11; references/design-playbook.md §3.14) |
| Orchestrator writes the pages itself | One subagent per workflow step; the orchestrator dispatches and reviews |

## Step 8 — Self-Check

| Mistake | Correct approach |
|---|---|
| The answer leak-scanned only in form UI | Scan the page **chrome** too — `<title>`, top bar, clearance strip, footer. An answer printed in a header is the same defect as one in a `placeholder` (R4) |
| Honor agreement claims what the code does not do | Before shipping text like "tables are hashed, nothing is persisted", grep for `localStorage` / `sessionStorage` writes and confirm the agreement's wording matches what is actually stored (system accounts are session-only) (R3) |
| Shipping without a solvability check | Copy `assets/tools/check-solvable.mjs` in at scaffold time. It proves every gate stays solvable and every page reachable after content edits, and turns red when a leak fix removes a clue |
