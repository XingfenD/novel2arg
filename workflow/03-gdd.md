# Step 3 — Write the GDD

**Input:** `docs/deconstruction.md` plus the container record. **Output:** `docs/gdd.md`. Required reading first: references/guardrails.md (canonical rules R1–R12) and references/design-playbook.md. A sample of the expected artifact shape: examples/gdd-excerpt.md.

The GDD carries eight sections.

1. **Numbered page map** — every page gets an `NN/total` progress number and an unlock source.
2. **Site information architecture** — the nav bar, index and listing pages, sitemap, and footer links that organization would really publish. Clue delivery rides these plus search. List them explicitly; step 4 audits against this list.
3. **Register split** — the pages that address the player, normally the entry ritual page and the two endings. Every other page is in-world only.
4. **Gate inventory** — each gate follows the credential triad (R3): account on page A, password clue on page B, gate on page C. Record which layer's search index carries each keyword and what a classified search hit resolves to (gate or `[Access denied]`, never the document) (R8/R9). System containers also record the access matrix: which account opens which page (`data-access`), which login gate grants it (`data-grant`), and per account the inference chain that yields the login string — only the initial account may be printed (R10; references/structure/form-system.md §1).
5. **Puzzle allocation table** — 5 to 10 gates and puzzles chosen from the 13 types in references/design-playbook.md §2. Sensory puzzles declare hardware requirements here.
6. **Dual-ending plan** — ending copy reuses knowledge from documents the player has just read.
7. **Extra atmosphere page list** — explicitly marked non-progression.
8. **Document format specs** — for each announcement, notice, contract, and certificate: issuing body, document number, date, addressee, signature and seal, distribution list.

Sections 2 and 3 are the inputs step 4 audits, and sections 4 and 5 are the inputs step 5 audits. Writing them thinly guarantees both audits fail.

**User review checkpoint.** When the subagent returns `docs/gdd.md`, the orchestrator presents the page map, IA, register split, gate inventory, and ending plan to the user and asks for review. Steps 4 and 5 start only after the user approves; requested changes are dispatched back to step 3.

Baseline-test traps for this step: references/common-mistakes.md §3 — check them before returning the artifact.
