> 中文译本，供审阅用；与 `workflow/07-implementation.md` 不一致时以英文原文为准。

# 步骤 7 — 实现

**输入：** 已搭好脚手架的树加全部 `docs/` 产物。**输出：** 完成的站点。每个阶段一个子 agent，按下列顺序。

| 阶段 | 工作 | 派发 |
|---|---|---|
| 1 | 公开页与仿真文件 | 子 agent |
| 2 | 搜索引擎与密码门——完整打通一条最短可玩路径 | 子 agent |
| 3 | 受限区域页面（选择 M5 时含换肤） | 子 agent |
| 4 | 图片、印章、扫描件、照片与仿真文件——落地 GDD 资产清单声明的**每一个**资产，并把每个 `<img src>` / 下载链接接到引用它的页面 | 子 agent |
| 5 | 分阶段模块：倒计时黑屏、打字机、滚动揭示（选择 M12 时） | 子 agent |
| 6 | 结局与第四面墙收尾（选择 M10 时） | 子 agent |
| 7 | 入口页：角色分配、start 按钮、声明的需求 | 子 agent |

Phase 7 最后落地，因为它的文案要描述此刻已经存在的游戏。Phase 4 是独立的 phase，不是
phase 1–3 的细节：一个被声明却没有任何 phase 认领的徽标 / 印章 / 扫描件 / 照片，正是会被漏掉的
东西，两个检查器都抓不到（没写出来的 `<img>` 没有 `src` 可解析——references/structure/tooling_zh.md §3 第 9 项）。

每个阶段的子 agent 收到：`docs/gdd.md`、`docs/reachability.md`、`docs/puzzle-audit.md` 的文件路径；
它必须加载的参考文件——`references/guardrails_zh.md`、`references/design-playbook_zh.md` §4（文案
规则）、`references/structure/base_zh.md`、`references/structure/components_zh.md`，以及所选容器的
形态文档（A 用 `references/structure/form-website_zh.md`，B/C/D 用 `references/structure/form-system_zh.md`）；
以及它负责的页面清单。它交回变更文件清单与未决问题。

## 每个阶段的常设规则

- **框架固定。** 步骤 6a 确立了外壳、皮肤、组件与工具；各 phase 只填页面文案与内容——不重建、不改样式。
- **只用选定模块。** 写 `docs/system-profile.md` 选中的模块；被禁用的模块不留下任何家具（没有未用的搜索表、皮肤、密码门或账号页）。
- **公开页保持中性（R5）。** 每一页都写成该组织的一份文件。名册条目承载姓名、职务、任期、职责。情节不进去。
- **链接来自触达表，且不越区域（R7）。** 不在该表中的链接不写；深度由触达模块跨越——绝不靠"相关文件 / 档案 / 页面"链接。
- **选择 M3 时，系统页面只对指名账号开放（R10）。** 受保护页面携带 `data-access`（`references/structure/form-system_zh.md` §1）；admin 账号绝不继承同事的私人文件；只有初始账号被印出——其他登录一律从线索推断，绝不从页面复制。
- **派生 / 组合凭据靠部件证明，绝不打印（R3、R12）。** 编写 `data/credentials.src.json`（每个门字段的值 + 规则 + 公开页部件 + 类型），运行 `node tools/check-credentials.mjs` 与 `node tools/check-reachability.mjs`。不要为了让 `check-solvable.mjs` 变绿而打印账号——那会把它泄露给每个访客并杀掉谜题（`references/structure/components_zh.md` §3；`references/structure/tooling_zh.md` §3 第 6 项）。
- **选择 M3 时，登录只有一个框，会话靠 Cookie（R10）。** 一个框服务多个身份，用 `data-grants`（账号→身份映射），而不是在同一页面摆两个表单；访问状态存放在会话 Cookie 中，使 `target="_blank"` 打开的结果保持解锁（`references/structure/form-system_zh.md` §2；`references/structure/components_zh.md` §3）。
- **文件携带其格式（R6）。** 发布主体、文件编号、日期、受文者、正文、署名与印章、分发范围。
- **输入控件只标注字段名（R4）。** `placeholder="工号"`、`placeholder="站内搜索…"`。密码门页面可以贴出账号格式；密码推导不上该页。
- **文案是陈述句（R11）。** 写任何句子之前先看 references/design-playbook_zh.md §4.14。
- **关键词要哈希（R3）。** 对任一 `data/keywords.<layer>.src.json` 做任何修改后，运行 `node tools/build-keywords.mjs`。
- **共享实体保持一致。** 出现在多个页面上的姓名、编号、账号、页面标题或日期，从 GDD 实体登记表（workflow/03）复制，绝不重新输入；登记表是唯一事实来源。

每个 phase 结束时，对本次 phase 触及的文件重跑 workflow/05-puzzle-audit_zh.md Q4 的泄答扫描。

本步骤的基线测试陷阱：`references/common-mistakes_zh.md` §7 —— 交回产物前逐条检查。
