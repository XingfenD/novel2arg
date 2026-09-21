# Step 5 — Puzzle Design Audit (谜题设计分析)

A gate step. A GDD that fails here goes back to step 3 before any scaffolding starts.

**Input:** `docs/gdd.md` sections 4 and 5, plus `docs/reachability.md`. **Output:** `docs/puzzle-audit.md`. A sample of the expected artifact shape: examples/puzzle-audit-excerpt.md.

Four questions per puzzle, one row per puzzle, a written verdict on each.

## Q1 必要性 — Necessity

Write one sentence naming what the guarded page gives the player. If the honest answer is atmosphere, the gate becomes a plain link or the page moves to the atmosphere list. Two adjacent gates sharing a puzzle type get merged or one gets cut; the loop needs variety more than it needs volume.

A blank cell here means 删除.

## Q2 答案可得性 — Obtainability

Name the source page and quote the exact span carrying the clue. Then write the inference chain on one line:

> 站内帖《老蛇的本命年》发布于 2013 年 → 2013 为癸巳蛇年 → 陈国栋生于 1977 → 密码 `1977`

A chain longer than two hops gets redesigned. Knowledge from outside the site is allowed only for a puzzle the GDD declares as type I (knowledge-search tutorial). The chain must start from a life trace, never a random string (R3).

## Q3 直觉性 — Intuitiveness

Ask whether a reader's eye lands on that span while reading the page for its stated purpose. Body copy, tables, captions, dates, and signatures pass. `alt` attributes, CSS comments, HTML source, and text invisible until selected pass only when the GDD declares the puzzle as type F (visual concealment) or type M (meta easter egg).

## Q4 泄答扫描 — Leak scan

Search the gate page and every page in the inference chain for four things:

| Leak | Example |
|---|---|
| The answer itself | `1977` printed on the login page |
| A restatement | `placeholder="例如 1977"`, help text spelling the credential |
| The derivation rule | `初始密码为本人出生年份` posted under the form |
| The answer's location | `答案在员工风采页`, `去老帖子里找本命年` |
| A login string printed verbatim (system containers) (R10) | `账号：chen.gd` in the staff roster — only the initial account may appear |

Scope covers `placeholder`, `<label>`, help text, empty states, failure hints, the surrounding body copy, and HTML comments (R4). A failure hint points at the source obliquely and stops there — `密码错误 🎂` qualifies; `想想陈师傅的本命年` leaks the location.

At implementation time this runs as a real grep over the page set, recorded in `docs/puzzle-audit.md`. A mental pass leaves the leaks in.

## Deliverable table

| 谜题 | 类型 | 守护内容 | 答案来源页 + 原文 | 推理链 | 跳数 | 必要性一句话 | 泄答扫描 | 处置 |
|---|---|---|---|---|---|---|---|---|

处置 values: 保留 / 改来源 / 合并 / 删除 / 降级为普通链接.

## Difficulty ladder

Sort the surviving puzzles by hop count. The first gate the player meets sits at 0 to 1 hops; the deepest may reach 2. A ladder that starts at 2 teaches the player to quit.

## Re-run

Copy changes while pages are written. Re-run Q4 against the built file tree at step 8 and record the diff against this table.

Baseline-test traps for this step: references/common-mistakes.md §5 — check them before returning the artifact.
