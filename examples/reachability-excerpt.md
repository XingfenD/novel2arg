# Example — Reachability Excerpt (Step 4)

Shape anchor for `docs/reachability.md`. One row per page; the fourth column is one sentence written
from the organization's point of view (workflow/04-reachability.md).

## Deliverable table (excerpt)

| 页面 | 触达方式（编号） | 来源页面 | 该来源为什么会放这个链接 | 从首页跳数 |
|---|---|---|---|---|
| pages/news.html | 1 导航栏 | index.html | 官网导航固定含"新闻动态" | 1 |
| pages/staff-chen.html | 2 列表页 | pages/staff.html | 员工名录逐人成页，官网惯例 | 2 |
| pages/login.html | 3 页脚 | 全站页脚 | 页脚"员工入口"是真实站点标配 | 1 |
| pages/internal/s21-ledger.html | 4 搜索命中 | search.html（暗层索引） | 深区搜索指向暗层表 | 3 |
| pages/internal/s22-diary.html | 5 门解锁 | login.html `data-next` | 登录后跳转的目标页 | 3 |

## Defect examples (the two this step exists to catch)

| 缺陷行 | 为什么不合格 | 修复（按优先级） |
|---|---|---|
| pages/internal/s23.html ← 正文内链自 news.html | 编号外私植链接；组织不会在新闻正文链向私密页（R7） | 改为暗层索引加关键词，search-only 触达 |
| pages/menu.html → pages/internal/s21-ledger.html（"相关文件"） | 浅层页跨区链深层页（R7/R8） | 删除该链；由搜索或门触达 |

## Check verdicts (one line each)

- Reverse check: 2 edges deleted (news.html 正文内链 ×2), re-routed via listing.
- Depth check: max 3 hops, no clue deeper than 3 listing levels.
- Keyword solvability: every public key appears verbatim in a reachable public page.
- Index scoping check: keywords.surface.json carries no `pages/internal/` URL. PASS.
- Title check: all titles are catalog entries (R9). PASS.
