# Step 3 — Write the GDD

**Input:** `docs/deconstruction.md` plus `docs/system-profile.md`. **Output:** `docs/gdd.md` and `docs/registry.md`. Required reading
first: `references/guardrails.md` (canonical rules R1–R12) and `references/design-playbook.md` §2 (module
catalog) plus `references/design-playbook.md` §4 (copy rules). A sample of the expected artifact shape:
`examples/gdd-excerpt.md`.

The GDD carries a front-matter block plus eight sections; sections marked *conditional* are written only when
the system profile selects the module they belong to, else they get one line saying so. The entity registry is
not one of the eight — it ships separately as `docs/registry.md` (item 0b).

0. **Front matter — asset manifest.** The manifest lists every non-text asset (emblem, seals, scans, photos, mock documents, audio): filename under `assets/`, referencing page(s), in-world caption. Step 7 phase 4 lands exactly this list; step 8 reconciles it (`references/structure/tooling.md` §3 item 9).
0b. **`docs/registry.md` — the entity registry.** The single source of truth for every shared entity — person names, IDs, account strings and their derivation rules, page titles, document numbers, key dates; every page copies it verbatim, and most cross-page contradictions are registry violations. It ships as its own file so a step-7 phase can load the registry without loading the whole GDD.
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

**Self-consistency scan (before the user checkpoint).** Re-read for: a page named two ways (page map vs. nav vs.
its own title); an entity `docs/registry.md` forbids on a page the same GDD requires it to carry; a worked example
that violates its own stated rule (sample account `wang00□□` against a "pinyin initials" rule); two sections
assigning the same fact different values. Fix each in the GDD or the contradiction ships.

**User review checkpoint.** When the subagent returns `docs/gdd.md`, the orchestrator presents the asset
manifest, `docs/registry.md`, page map, IA, register split, access inventory, puzzle allocation, and ending plan to
the user; steps 4 and 5 start only after approval, and requested changes go back to step 3.

Baseline-test traps for this step: `references/common-mistakes.md` §3 — check them before returning the artifact.
