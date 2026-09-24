# Step 3 — Write the GDD

Four subagent rounds: **3a `docs/gdd-plan.md` → 3b `docs/gdd.md` → 3c `docs/registry.md` → 3d
reconcile**. A full system profile yields 40+ pages, and a turn that reads the reference stack and then
digests the inputs and drafts the output inside one reasoning block exhausts its response budget and
returns nothing. Each round therefore runs as an explicit sequence of small steps and follows the rules
below.

**Rules (all rounds).**

1. **The file is the only digest.** Never restate inputs — the deconstruction, the module matrix, the plan — in reasoning. Replaying the inputs and drafting the output in one response is exactly what truncates a turn.
2. **Run the round's sequence; never batch.** After every read, the very next tool call is the write that read unblocks — never a second content read, never a planning pass in between. Reading everything before writing anything is the failure this rule exists to prevent. The only reads that may share a step are a content block plus the one small reference that governs it (a rules table, a shape example).
3. **Read slices, never whole files.** A cited `file.md §N` is its own call, reading that section's lines. A runtime artifact is read by its named tables or headings — one or two per call, never the whole file.

Round outputs travel as named files (dispatch contract item 2); artifacts are never pasted into a prompt.

## Round 3a — Plan

Writes `docs/gdd-plan.md`: the whole GDD as one-line rows under ten fixed headings — the GDD's own
numbering, so later rounds read one block at a time: `## 0 assets`, `## 1 page map`, `## 2 IA`,
`## 3 register split`, `## 4 access inventory`, `## 5 puzzle allocation`, `## 6 endings`,
`## 7 world texture`, `## 8 document specs`, `## registry seed`.

Run this exact sequence:

1. Read `docs/system-profile.md`. → `write` creating `docs/gdd-plan.md`: the `## 1 page map` block with the public-area rows the selected modules imply — the shell pages plus every page a module switches on.
2. Read `docs/deconstruction.md`'s character-network and timeline tables. → append page-map rows for the restricted and nested areas, each with its unlock source.
3. Read `docs/deconstruction.md`'s evidence-inventory and contrast-matrix tables. → append the remaining page-map rows, then the `## registry seed` block (persons, IDs, key dates) and the `## 0 assets` block (every non-text asset: filename under `assets/`, referencing page(s), in-world caption).
4. Read `docs/deconstruction.md`'s twist-ordering table. → append the `## 6 endings` block, the `## 7 world texture` block, and `## 8 document specs` rows (per announcement, notice, contract, certificate: issuing body, document number, date, addressee, signature and seal, distribution list — R6).
5. Read `references/design-playbook.md` §2. → append the `## 2 IA` block (nav bar, index and listing pages, sitemap, footer links, plus the entry points of the selected reach modules — search surface, gates, login) and the `## 3 register split` block (the pages that address the player vs. in-world only).
6. Read `references/design-playbook.md` §3. → append the `## 5 puzzle allocation` block — 5 to 10 gates and puzzles from the 13 types; sensory puzzles declare hardware requirements.
7. Read `references/guardrails.md`'s Canonical rules (R1–R12) table. → append the `## 4 access inventory` block — per gate or protected page: its credential triad (account clue on page A, password clue on page B, gate on page C, R3) or the granting account (`data-access`, granted by `data-grant`, R10); the index carrying each keyword (M1); what an unreadable search hit resolves to (its gate or a plain locked notice, never the document, R8/R9). Then fix in place any earlier row that breaks a rule.

Every row traces to a deconstruction row or a selected module — nothing invented. No single page may
co-locate two components of one credential (a "zero-jump" solve) — split them so the derivation is the
puzzle. The novel text is a fallback only (SKILL.md dispatch contract item 1). The final message returns
the file path plus unresolved questions.

## Round 3b — Write docs/gdd.md

Reads only `docs/gdd-plan.md` (block by block) and three small references. Sections marked *conditional*
are written only when the plan carries their block, else they get one line saying so. Run this exact
sequence:

1. Read the plan's `## 0 assets` and `## 1 page map` blocks. → `write` creating `docs/gdd.md`: the front matter (the asset list verbatim; step 7 phase 4 lands exactly this list, step 8 reconciles it — `references/structure/tooling.md` §3 item 9) and section 1 — the numbered page map: every page, its area (public / restricted / nested system), and its unlock source.
2. Read the plan's `## 2 IA` and `## 3 register split` blocks. → append section 2 — the site information architecture — and section 3 — the register split.
3. Read the plan's `## 4 access inventory` block plus `references/guardrails.md`'s Canonical rules (R1–R12) table. → append section 4. System containers record the access matrix and, per account, the inference chain that yields the login string — only the initial account may be printed. A **derived/composite** credential records its rule and public-page components here; prove it with `tools/check-credentials.mjs`, never by printing it (`references/structure/components.md` §3).
4. Read the plan's `## 5 puzzle allocation` block plus `references/design-playbook.md` §3. → append section 5 — the puzzle allocation table.
5. Read the plan's `## 6 endings` through `## 8 document specs` blocks. → append section 6 (ending plan, M10 — ending copy reuses documents the player has just read; dual moral choices when selected), section 7 (world-texture list, M11 — atmosphere pages off the critical path, epigraph, easter eggs; no non-progression labelling is needed), and section 8 (document format specs).
6. Read `references/common-mistakes.md` §3. → fix every trap it names, in place.
7. Read `examples/gdd-excerpt.md`. → check the artifact against the example's shape; fix deviations in place.

Sections 2–4 are the inputs step 4 audits, and 4–5 the inputs step 5 audits. Writing them thinly guarantees
both audits fail. The final message returns the file path plus unresolved questions.

## Round 3c — Write docs/registry.md

Run this exact sequence:

1. Read the plan's `## registry seed` block. → `write` creating `docs/registry.md`: the table header and the first 5 entity rows — person names, IDs, account strings and their derivation rules, page titles, document numbers, key dates.
2. Read `references/guardrails.md`'s Canonical rules (R1–R12) table. → append the remaining rows; only the initial account may be printed (R10), and a derived/composite credential records its rule and public-page components, proven with `tools/check-credentials.mjs`, never printed.
3. Read `examples/gdd-excerpt.md`. → normalize the table to the example's registry shape.

Every page copies the registry verbatim, and most cross-page contradictions are registry violations. It
ships as its own file so a step-7 phase can load the registry without loading the whole GDD. The final
message returns the file path plus unresolved questions.

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
