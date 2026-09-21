# Example — Puzzle Audit Excerpt (Step 5)

Shape anchor for `docs/puzzle-audit.md`: four questions per puzzle, one row per puzzle, a written
verdict and disposition on each (workflow/05-puzzle-audit.md).

## Q2 inference-chain sample (one line, ≤2 hops)

> 站内帖《老蛇的本命年》发布于 2013 年 → 2013 为癸巳蛇年 → 陈国栋生于 1977 → 密码 `1977`

## Deliverable table (excerpt)

| 谜题 | 类型 | 守护内容 | 答案来源页 + 原文 | 推理链 | 跳数 | 必要性一句话 | 泄答扫描 | 处置 |
|---|---|---|---|---|---|---|---|---|
| 本命年推生日 | B | 员工邮箱 | posts-01.html「今年本命年，2013 癸巳」 | 癸巳→1977 | 1 | 邮箱内有账本，是暗层入口 | 门页仅 `placeholder="密码"`，无泄答 | 保留 |
| 黑底选字 | F | 账本附言 | s21-ledger.html `::selection` 红字 | 0（同页） | 0 | 附言给出下一关键词"溪A·7K209" | GDD 已声明 F 型 | 保留 |
| 车牌猜密码 | B | 库房页 | 无任何页面出现该车牌 | 断链 | — | — | — | 改来源：把车牌写进 staff-chen 通勤记录 |
| 员工风采门 | B | 纯氛围页 | news.html「陈师傅爱钓鱼」 | 2 | — | 守护页只加氛围，无进展 | — | 降级为普通链接 |

## Difficulty ladder (sorted by hops)

0（黑底选字）→ 1（本命年）→ 1（工号 0143）→ 2（流水单日期）：首个门 0–1 跳，最深 2 跳，PASS。

## Q4 leak-scan record (post-implementation re-run, step 8)

Real grep over the built tree, per workflow/05-puzzle-audit.md "Re-run": scan `placeholder`, `<label>`,
help text, empty states, failure hints, page chrome (`<title>`, top bar, footer), and HTML comments;
record the diff against the table above (R4).
