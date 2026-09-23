# Example — GDD Excerpt (Step 3)

Shape anchor for `docs/gdd.md` and `docs/registry.md` (workflow/03-gdd.md defines both). Rows are
illustrative, from the same hypothetical restaurant novel as the other examples.

## 0. Front matter + `docs/registry.md` (shape)

| 实体 | 值 | 派生规则 | 出现页 |
|---|---|---|---|
| 陈国栋 | 工号 `chen.gd` | 拼音首字母 + 姓 | pages/roster.html, pages/internal/s21-ledger.html |

Account strings carry their derivation rule; only the initial account may be printed (R10).

## 1. Numbered page map (excerpt)

| # | 页面 | 层 | 解锁来源 |
|---|---|---|---|
| 06/36 | pages/news.html | 表层 | 导航栏（index 起第 1 跳） |
| 14/36 | pages/login.html | 中层 | 页脚"员工入口" |
| 21/36 | pages/internal/s21-ledger.html | 暗层 | 搜索"癸巳"命中（暗层索引） |

## 4. Access inventory (excerpt)

| 门（页面） | 账号线索页 A | 密码线索页 B | 凭据三元组推理链 | 承载关键词的索引层 | 不可读命中解析为 |
|---|---|---|---|---|---|
| pages/login.html | 员工名录（初始账号，唯一可印出） | 老帖《老蛇的本命年》2013 | 2013 癸巳 → 陈生于 1977 → 密码 `1977` | surface | 跳本门（不给文档） |

System containers add the access matrix here: 页面 ↔ `data-access` 账号 ↔ 授予它的 `data-grant` 登录门 ↔
该账号登录串的推理链（R10）。

## 5. Puzzle allocation table (excerpt)

| 谜题 | 类型（references/design-playbook.md §3） | 守护内容 | 跳数 |
|---|---|---|---|
| 本命年推生日 | B 跨页凭据 | 员工邮箱入口 | 1 |
| 黑底选字 | F 视觉隐藏 | 账本附言 | 0 |

## 6–8 (shape reminders)

- Dual endings: both options reuse copy from `s31-verdict.html`, read minutes earlier.
- Atmosphere pages: `pages/menu-2019.html`（off the critical path, no progress inside）.
- Document specs: 每份公告记发文单位/文号/日期/主送/印章/抄送（R6）。

Sections 2–3 (IA + register split) and 4–5 feed the step-4 and step-5 audits; writing them thinly
guarantees both fail.
