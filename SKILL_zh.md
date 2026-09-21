---
name: novel2arg
description: Use when adapting a mystery/suspense novel into an interactive web puzzle game (ARG-lite), or when the user asks for a web puzzle site, an interactive novel adaptation, a puzzle website, or a mystery-novel game adaptation. Also use when such a project drifts toward a single-file SPA, canvas scene engine, inventory-based adventure UI, generic puzzle framework, or random passwords, even when told to "keep it simple" or that an engine was already scaffolded.
---

> 中文译本，供审阅用；与 `SKILL.md` 不一致时以英文原文为准。

# novel2arg：悬疑小说 → 互动网页解谜游戏

把悬疑 / 推理小说改编成伪装成真实网站的多页静态解谜游戏（ARG-lite）；
成功标准是玩家感觉自己正在潜入一个真实站点。护栏——四条约束、
权威规则 R1–R12、禁止形态、常见辩解、红旗信号与不适用场景——位于
`references/guardrails_zh.md`：步骤 1 之前要读，审阅任何产物时也要读。

**项目根目录约定。** 生成的游戏位于 `<cwd>/<game-name>/`（kebab-case，以小说命名），
除非用户另行指定位置。工作流文件里所有 `docs/*.md` 产物路径都相对于该项目根目录，
而不是本 skill 目录。

## 工作流

八个步骤按顺序执行。每个步骤正文位于 `workflow/`；本节只做路由。步骤 2 依据模块目录
（`references/design-playbook_zh.md` §2）组装系统；步骤 3–5 向该系统填入游戏内容。
示例列列出该步骤派发 prompt 中携带的产物形状锚点（存在时）。

| 步骤 | 文件 | 交付物 | 示例 | 派发 |
|---|---|---|---|---|
| 1 拆解小说 | workflow/01-deconstruct_zh.md | 五张表 | examples/deconstruction-excerpt.md | 子 agent |
| 2 选择容器 + 组装系统 | workflow/02-container_zh.md | `docs/system-profile.md`（与用户一起选定模块） | — | 编排者（询问用户） |
| 3 撰写 GDD | workflow/03-gdd_zh.md | `docs/gdd.md`，前置材料（资产清单 + 实体登记表）+ 八个章节 | examples/gdd-excerpt.md | 子 agent → 用户审阅检查点 |
| 4 触达链分析 | workflow/04-reachability_zh.md | `docs/reachability.md` | examples/reachability-excerpt.md | 子 agent |
| 5 谜题设计分析 | workflow/05-puzzle-audit_zh.md | 带处置结论的 `docs/puzzle-audit.md` | examples/puzzle-audit-excerpt.md | 子 agent |
| 6 脚手架 | workflow/06-scaffold_zh.md | 框架 + 每个页面的骨架 | — | 6a 框架（不含情节）→ 6b 骨架（含情节） |
| 7 实现 | workflow/07-implementation_zh.md | 完成的站点 | — | 每个阶段一个子 agent |
| 8 自检 | workflow/08-self-check_zh.md | `docs/self-check.md`，逐项通过/失败 | — | 子 agent |

步骤 3 以用户审阅检查点收尾：当子 agent 交回 `docs/gdd.md`，编排者把它呈现给用户，
并在派发步骤 4、5 之前请求审阅。必须获得批准；用户要求的修改退回步骤 3。

步骤 4 与 5 是闸门。GDD 未通过其中任何一项，都要在脚手架开始之前退回步骤 3。

**派发契约。** 编排者写 prompt、读取交回的产物，然后派发下一步。步骤 2 由编排者亲自执行，
其余都委派出去。子 agent 不与用户对话。每个子 agent 的 prompt 都携带下列六项
（完整样例：examples/dispatch-prompt.md）：

1. 小说文本路径；
2. 项目根目录（见上面的约定）与前置产物的文件路径；
3. 该步骤的交付物定义，从其工作流文件原样复制；
4. 该步骤引用的参考文件路径，以及上表所列该步骤的示例文件（存在时）；
5. 现实优先条款——references/guardrails_zh.md R12：现实感高于任何检查；冲突通过编排者上报用户；
6. 结尾句："return the artifact plus unresolved questions; route questions back through the orchestrator."
   （交回产物与未决问题；问题经由编排者转回。）

唯一的例外是步骤 6a：它的 prompt 只携带 `docs/system-profile.md` 与基础设施类参考——
不含小说文本，不含任何承载情节的产物。

## 参考资料

- **references/guardrails_zh.md**：四条约束、权威规则 R1–R12（每条被多个文件写到的规则的唯一出处；其他文件的 `(Rn)` 引用都指向这里）、禁止形态、常见辩解、红旗信号、不适用场景。
- **references/design-playbook_zh.md**：步骤 2 的模块目录（13 个可选设计模块）、核心循环、13 类谜题分类与文案规则。步骤 2 与 3 的必读。
- **references/structure/base_zh.md**：共用的多页前端基底——带模块标注的目录树 + 页面骨架。步骤 6 的必读。
- **references/structure/components_zh.md**：Alpine 组件参考实现——关键词哈希构建、搜索引擎、密码门、分阶段演出、换肤、进度。步骤 6 与 7 的必读。
- **references/structure/form-website_zh.md**：容器 A——假官方网站：搜索中枢、按受众分索引、密码门是唯一入口。选择容器 A 时是步骤 3 与 6 的必读。
- **references/structure/form-system_zh.md**：容器 B/C/D——系统类虚构：账号登录、按账号授权（RBAC 式）、桌面 / 模拟互联网 / 档案系统外壳、检查器约定。选择系统类容器时是步骤 3 与 6 的必读。
- **references/structure/tooling_zh.md**：检查节奏、共享 `tools/config.mjs` 旋钮，以及静态检查无法替代的九种人工方法。步骤 8 的必读。
- **references/common-mistakes_zh.md**：按工作流步骤分组的基线测试陷阱；每个步骤文件引用其对应小节。
- **examples/**：锚定步骤 1/3/4/5 产物形状的示例，以及一份填好的派发 prompt 样例。
- **assets/tools/**：步骤 6 复制进每个项目的零依赖 Node 文件——`config.mjs`（所有检查器共同导入的共享约定；项目改名时唯一要改的文件）、`hash.mjs`（设计期门哈希，步骤 3/5）、`build-keywords.mjs`（明文表 → 哈希表；每次 src 修改后重跑）、`check-links.mjs`（死链 + 公开索引层泄漏）、`check-solvable.mjs`（冷启动遍历：可触达 + 可解 + 搜索有据）、`check-credentials.mjs`（组合 / 派生凭据：部件 + 规则 + 零明文——`check-solvable` 无法建模的另一半）、`check-reachability.mjs`（演算副本：把凭据注入一份一次性拷贝，再证明门解锁 + 页面可触达）、`vendor-alpine.mjs`（下载固定版本的 Alpine 运行时，sha256 校验，步骤 6）。步骤 7 与 8 运行 build-keywords、check-links、check-solvable；带派生凭据或系统容器的项目还要运行 check-credentials 与 check-reachability。权威的通过 / 失败清单是 workflow/08-self-check_zh.md。

## 仓库自检

`scripts/check-docs.mjs` 校验本 skill 自身的文档：文件路径、`§N` / `§N.M` 引用、规则编号、
markdown 链接与孤儿文档。CI（`.github/workflows/ci.yml`）把它与
`node assets/tools/check-solvable.mjs --self-test` 一起运行。修改本仓库任何文件后
运行 `node scripts/check-docs.mjs`。
