# Step 3 — Write the GDD

Four subagent rounds: **3a `docs/gdd-plan.md` → 3b `docs/gdd.md` → 3c `docs/registry.md` → 3d
reconcile**. A full system profile yields 40+ pages, and a single turn that reads the reference stack and
then digests the inputs and drafts the output inside one reasoning block exhausts its response budget and
returns nothing. Each round has one bounded job, works from the files named in it, and follows the rules
below.

**Rules (all rounds).**

1. **The file is the only digest.** Never restate inputs — the deconstruction, the module matrix, the plan — in reasoning. Replaying the inputs and drafting the output in one response is exactly what truncates a turn.
2. **The round's first tool call is named in its Output section and fires right after the last read** — no planning pass in between. Later calls append 5–10 rows or one section, continuing from what is already on disk. Never enumerate unwritten content in reasoning before it is written.
3. **Read by section, one call at a time.** A cited `file.md §N` is read as its own call — that section's lines, not the whole file — and dropped before the next read. Never hold two references in one think.

Round outputs travel as named files (dispatch contract item 2); artifacts are never pasted into a prompt.

## Round 3a — Plan

**Input:** `docs/deconstruction.md` plus `docs/system-profile.md`. Required reading, each its own read
call: `references/guardrails.md` — the Canonical rules (R1–R12) table only, not the rationalizations or
red-flag sections; `references/design-playbook.md` §2 (module catalog), `references/design-playbook.md`
§3 (puzzle types), `references/design-playbook.md` §4 (copy rules); `examples/gdd-excerpt.md`. The novel
text is a fallback only (SKILL.md dispatch contract item 1).

**Output:** `docs/gdd-plan.md` — four skeleton tables, one line per row, no prose. **First tool call:
`write` creating the file with the page-map header and the first 5 rows.** The final message returns the
file path plus unresolved questions.

1. **Page map** — number, path, area (public / restricted / nested system), unlock source; every page the selected modules imply.
2. **Entity list** — one row per shared entity: kind (person / ID / account / page title / document number / key date), value, derivation rule if any.
3. **Access inventory** — per gate or protected page: its credential triad (account clue on page A, password clue on page B, gate on page C, R3) or the granting account (`data-access`, granted by `data-grant`, R10); the index carrying each keyword (M1); what an unreadable search hit resolves to (its gate or a plain locked notice, never the document, R8/R9).
4. **Puzzle allocation** — 5 to 10 gates and puzzles from the 13 types in `references/design-playbook.md` §3; sensory puzzles declare hardware requirements.

Every row traces to a deconstruction row or a selected module — nothing invented. No single page may
co-locate two components of one credential (a "zero-jump" solve) — split them so the derivation is the
puzzle.

## Round 3b — Write docs/gdd.md

**Input:** `docs/gdd-plan.md` plus, each its own read call: `references/guardrails.md` — the Canonical
rules (R1–R12) table only; `references/design-playbook.md` §2 (module catalog),
`references/design-playbook.md` §3 (puzzle types), `references/design-playbook.md` §4 (copy rules);
`references/common-mistakes.md` §3 (step-3 traps); `examples/gdd-excerpt.md`.

**Output:** `docs/gdd.md` — a front-matter block plus eight sections; sections marked *conditional*
are written only when the system profile selects the module they belong to, else they get one line
saying so. The entity registry is not one of the eight — it ships separately as `docs/registry.md`
(round 3c), and the GDD names every entity exactly as the plan's entity list spells it. **First tool
call: `write` creating `docs/gdd.md` with the front matter and section 1.**

0. **Front matter — asset manifest.** The manifest lists every non-text asset (emblem, seals, scans, photos, mock documents, audio): filename under `assets/`, referencing page(s), in-world caption. Step 7 phase 4 lands exactly this list; step 8 reconciles it (`references/structure/tooling.md` §3 item 9).
1. **Numbered page map** — every page, its area (public / restricted / nested system), and its unlock source.
2. **Site information architecture** — the nav bar, index and listing pages, sitemap, and footer links that organization would really publish, plus the entry points of the selected reach modules (search surface, gates, login). List them explicitly; step 4 audits against this list.
3. **Register split** — the pages that address the player, normally the entry page and the endings; every other page is in-world only.
4. **Access inventory** — per gate or protected page: its credential triad (account clue on page A, password clue on page B, gate on page C, R3) or the account that opens it (`data-access`, granted by `data-grant`, R10); what an unreadable search hit resolves to (its gate or a plain locked notice, never the document, R8/R9); which index carries each keyword (M1). System containers record the access matrix and, per account, the inference chain that yields the login string — only the initial account may be printed. A **derived/composite** credential records its rule and public-page components here; prove it with `tools/check-credentials.mjs`, never by printing it (`references/structure/components.md` §3).
5. **Puzzle allocation table** — 5 to 10 gates and puzzles from the 13 types in `references/design-playbook.md` §3; sensory puzzles declare hardware requirements. No single page may co-locate two components of one credential (a "zero-jump" solve) — split them so the derivation is the puzzle.
6. **Ending plan** *(M10)* — ending copy reuses documents the player has just read; dual moral choices when selected.
7. **World-texture list** *(M11)* — atmosphere pages off the critical path, epigraph, easter eggs; no non-progression labelling is needed.
8. **Document format specs** — per announcement, notice, contract, certificate: issuing body, document number, date, addressee, signature and seal, distribution list.

Sections 2–4 are the inputs step 4 audits, and 4–5 the inputs step 5 audits. Writing them thinly guarantees
both audits fail.

Baseline-test traps for this step: `references/common-mistakes.md` §3 — check them before returning the artifact.

## Round 3c — Write docs/registry.md

**Input:** `docs/gdd-plan.md` (its entity list) plus, each its own read call:
`references/guardrails.md` — the Canonical rules (R1–R12) table only — and `examples/gdd-excerpt.md`.
Not the GDD; this round only expands the plan's entity rows.

**Output:** `docs/registry.md` — the single source of truth for every shared entity: person names, IDs,
account strings and their derivation rules, page titles, document numbers, key dates. Every page copies
it verbatim, and most cross-page contradictions are registry violations. It ships as its own file so a
step-7 phase can load the registry without loading the whole GDD. **First tool call: `write` creating
the file with the table header and the first 5 entity rows.**

## Round 3d — Reconcile

**Input:** `docs/registry.md` plus `docs/gdd.md`. No reference files — this round is a mechanical diff
between two files already on disk. **First tool call: `read` of `docs/gdd.md` section 1 only — never the
whole file.**

**Procedure — one forward walk, the four checks applied as their evidence appears.** Read the registry
once, then read `docs/gdd.md` one section per call in the order 1, 2, 4, 5, 8, dropping each section
after it is fixed. Never read ahead, never hold two GDD sections in reasoning at once, and never
accumulate findings for a later summary — every fix is applied immediately with `edit`, in whichever
file is wrong (the registry wins by default, the GDD wins when it carries the more precise value).

1. **Page naming** — during the section 1–2 pass: a page named two ways (page map vs. IA vs. its own title) is fixed to the registry spelling.
2. **Entity usage** — in every section walked: each person name, ID, account string, page title, document number and key date as written there against its registry row.
3. **Worked examples** — where a walked section carries one: the example against its own stated rule (sample account `wang00□□` against a "pinyin initials" rule).
4. **One fact, two values** — after the walk, from the fixes already applied: two sections that assigned the same fact different values are settled to one.

**Output:** the final message lists the fixes applied (file plus what changed) and unresolved questions.

**User review checkpoint.** When 3d returns, the orchestrator presents the asset manifest,
`docs/registry.md`, page map, IA, register split, access inventory, puzzle allocation, and ending plan to
the user; steps 4 and 5 start only after approval, and requested changes go back to step 3.
