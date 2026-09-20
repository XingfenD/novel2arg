# Step 4 — Reachability Chain Analysis (触达链分析)

A gate step. A GDD that fails here goes back to step 3 before any scaffolding starts.

**Input:** `docs/gdd.md` sections 1, 2, 4, plus the keyword table. **Output:** `docs/reachability.md`.

Build a directed graph: nodes are pages, edges are inbound routes, root is `index.html`. Walk it breadth-first. Every page the walk misses is an orphan.

## Legitimate inbound routes (closed list)

An edge counts only if it belongs to this list. Anything else is a planted clue link.

0. Entry ritual page start button — the single edge from `index.html` into the surface world
1. Nav bar
2. Index or listing page entry — news list, staff list, menu list, archive list, sitemap
3. Footer link — 员工入口, 联系我们, 备案信息
4. Search hit — keyword → hidden page, from the index of the layer the search surface belongs to
5. Gate unlock — a `data-next` target
6. Breadcrumb or "back to list" link inside a document
7. Related-document reference that the issuing body would really print — a contract citing its annex, a notice citing the regulation behind it
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

- **Reverse check.** An edge whose only function is moving the player to the next clue is a defect even when its target is reachable. Delete it and re-route through a listing page or search.
- **Depth check.** Count hops from `index.html` to the page carrying each gate's clue. A clue sitting more than three listing-levels deep gets a shallower index entry.
- **Keyword solvability.** Every key in the plaintext keyword tables appears verbatim in the copy of a reachable page **of the same layer**. A keyword that appears nowhere makes its puzzle unsolvable; a surface-index key that appears only on a secret page has no legitimate delivery.
- **Layer check.** `data/keywords.surface.json` contains no `pages/secret/` URL, and every secret-index entry is fetched only from a secret-layer page. A surface search hit that opens a secret page without a gate fails this check.
- **Badge check.** Every result marked with a clearance level shows `[Access denied]` or resolves to a gate demanding that clearance. A classified result that opens its document directly is a defect.
- **Title check.** Each keyword table title reads as a catalog entry (issuing body + document type + number/date). A title that summarizes the document leaks plot onto the search results page.
- **Post-implementation re-run.** After step 7, re-walk the graph with `node tools/check-links.mjs` and the `href` grep in references/project-structure.md §9. The graph drifts while pages are written.
