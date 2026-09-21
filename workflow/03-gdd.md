# Step 3 — Write the GDD

**Input:** `docs/deconstruction.md` plus the container record. **Output:** `docs/gdd.md`. Required reading first: references/guardrails.md (canonical rules R1–R12) and references/design-playbook.md. A sample of the expected artifact shape: examples/gdd-excerpt.md.

The GDD carries a front-matter block plus eight sections.

0. **Front matter — asset manifest + entity registry.**
   - **Asset manifest:** every non-text asset the site needs — emblem, seals, scans, photos, mock documents (pdf/xlsx), audio. One row each: filename under `assets/`, the page(s) that reference it, and its in-world caption. Step 7 phase 4 lands exactly this list; step 8 reconciles it (a declared asset that no phase owns is what gets dropped, and neither checker catches an `<img>` that was never written — references/structure/tooling.md §3 item 9).
   - **Entity registry:** the single source of truth for every shared entity — person names, IDs / license numbers, account strings and their derivation rules, page titles and nav labels, document numbers, and key dates. Each appears once here; every page and every other GDD section copies it verbatim, never re-types it. Most cross-page contradictions (a roster missing a person, a page answering to two titles, a date printed where the same GDD forbids it) are registry violations.

1. **Numbered page map** — every page gets an `NN/total` progress number and an unlock source.
2. **Site information architecture** — the nav bar, index and listing pages, sitemap, and footer links that organization would really publish. Clue delivery rides these plus search. List them explicitly; step 4 audits against this list.
3. **Register split** — the pages that address the player, normally the entry ritual page and the two endings. Every other page is in-world only.
4. **Gate inventory** — each gate follows the credential triad (R3): account on page A, password clue on page B, gate on page C. Record which layer's search index carries each keyword and what a classified search hit resolves to (gate or `[Access denied]`, never the document) (R8/R9). System containers also record the access matrix: which account opens which page (`data-access`), which login gate grants it (`data-grant`), and per account the inference chain that yields the login string — only the initial account may be printed (R10; references/structure/form-system.md §1). A **derived/composite** credential (account = initials + license-year) records its rule and its public-page components here; it is proved by `tools/check-credentials.mjs`, never by printing the string (references/structure/components.md §3).
5. **Puzzle allocation table** — 5 to 10 gates and puzzles chosen from the 13 types in references/design-playbook.md §2. Sensory puzzles declare hardware requirements here. No single page may co-locate two components of one credential — if the 工号 and the year sit on the same page, the player copies both with zero inference (a "zero-jump" solve); split them across pages so the derivation is the puzzle.
6. **Dual-ending plan** — ending copy reuses knowledge from documents the player has just read.
7. **Extra atmosphere page list** — explicitly marked non-progression.
8. **Document format specs** — for each announcement, notice, contract, and certificate: issuing body, document number, date, addressee, signature and seal, distribution list.

Sections 2 and 3 are the inputs step 4 audits, and sections 4 and 5 are the inputs step 5 audits. Writing them thinly guarantees both audits fail.

**Self-consistency scan (before the user checkpoint).** The GDD is large enough to contradict itself, and a contradiction propagates into the pages. Before presenting it, re-read it for: a page named two ways (page map vs. nav spec vs. the page's own title); an entity the registry forbids on a page that the same GDD then requires to carry it (e.g. "no `1994` here" plus "this is the 1994 annual edition"); a worked example that violates its own stated rule (sample account `wang00□□` against a rule of "pinyin initials"); and any two sections that assign the same fact different values. Fix each in the GDD or the contradiction ships.

**User review checkpoint.** When the subagent returns `docs/gdd.md`, the orchestrator presents the asset manifest, entity registry, page map, IA, register split, gate inventory, and ending plan to the user and asks for review. Steps 4 and 5 start only after the user approves; requested changes are dispatched back to step 3.

Baseline-test traps for this step: references/common-mistakes.md §3 — check them before returning the artifact.
