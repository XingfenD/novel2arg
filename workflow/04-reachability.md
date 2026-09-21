# Step 4 — Reachability Chain Analysis (触达链分析)

A gate step. A GDD that fails here goes back to step 3 before any scaffolding starts.

**Input:** `docs/gdd.md` sections 1, 2, 4, plus the keyword table. **Output:** `docs/reachability.md`. A sample of the expected artifact shape: examples/reachability-excerpt.md.

Build a directed graph: nodes are pages, edges are inbound routes, root is `index.html`. Walk it breadth-first. Every page the walk misses is an orphan.

## Legitimate inbound routes (closed list)

An edge counts only if it belongs to this list. Anything else is a planted clue link.

0. Entry ritual page start button — the single edge from `index.html` into the public world
1. Nav bar
2. Index or listing page entry — news list, staff list, menu list, archive list, sitemap
3. Footer link — 员工入口, 联系我们, 备案信息
4. Search hit (M1) — keyword → hidden page, from the index of the audience the search surface belongs to
5. Gate or login unlock (M2/M3) — a `data-next` target
6. Breadcrumb or "back to list" link inside a document
7. Related-document reference that the issuing body would really print — a contract citing its annex, a notice citing the regulation behind it. Same area only: a shallow page never links a deeper area's page under "related files / archives / pages".
8. Hand-typed URL (container C only)
9. Off-site or fourth-wall link, declared in the GDD

## Deliverable table

One row per page:

| 页面 | 触达方式（上表编号） | 来源页面 | 该来源为什么会放这个链接 | 从首页跳数 |
|---|---|---|---|---|

The fourth column takes one sentence written from the organization's point of view. An edge with no sentence gets deleted, and its target page gets re-routed.

## Orphan fixes, in priority order

1. Add the page to a listing the site would really keep — news index, staff index, archive list, `sitemap.xml`, 友情链接.
2. Make it search-only by adding a keyword entry. Fits hidden pages.
3. Make it a gate target.
4. Cut the page.

Planting a link in the body copy of an unrelated page is off the list. That is the defect this step exists to catch.

## Additional checks

- **Reverse check (R7).** An edge whose only function is moving the player to the next clue is a defect even when its target is reachable. Delete it and re-route through a listing page or search.
- **Depth check.** Count hops from `index.html` to the page carrying each gate's clue. A clue sitting more than three listing-levels deep gets a shallower index entry.
- **Access check (R10; M3).** System containers: every protected page names the accounts that open it (`data-access`), every login gate names the account it grants (`data-grant`), and no account inherits another's page. A numeric privilege ladder, or an admin account that opens everything, fails this check (`references/structure/form-system.md` §1). A **derived/composite** account is not printed on any page, so the walk cannot read it as a verbatim clue: record its rule and public-page components in the GDD access inventory, declare them in `data/credentials.src.json`, and verify reachability with `tools/check-reachability.mjs` (a rehearsal copy with the values injected) — `tools/check-solvable.mjs` alone reports such a gate STUCK (`references/structure/tooling.md` §3 item 6).
- **Keyword solvability (M1).** Every key in the plaintext keyword tables appears verbatim in the copy of a reachable page **of the same audience**. A keyword that appears nowhere makes its puzzle unsolvable; a public-index key that appears only on a restricted page has no legitimate delivery. (A derived *credential* is the exception to "appears verbatim": its parts appear, the assembled string does not — that is `check-credentials.mjs`'s job, not this check's.)
- **Index scoping check (R8; M1).** The public table carries no restricted-area URL (default `internal/`, the `secretUrl` CONFIG knob), and every deep-table entry is fetched only from a deep page. A public search hit that opens a restricted page without a gate fails this check. (Website form; a system form keeps one index and resolves hits through the access matrix — `references/structure/form-system.md` §1.)
- **Locked-entry check (R8).** Every result or list row the visitor may not open resolves to its gate or a plain locked notice; one that opens its document directly is a defect.
- **Title check (R9).** Each keyword table title reads as a catalog entry (issuing body + document type + number/date). A title that summarizes the document leaks plot onto the search results page.
- **Post-implementation re-run.** After step 7, re-walk the graph with `node tools/check-links.mjs` plus the link-provenance item of the `workflow/08-self-check.md` checklist (cadence in `references/structure/tooling.md` §1). The graph drifts while pages are written.

Baseline-test traps for this step: references/common-mistakes.md §4 — check them before returning the artifact.
