![novel2arg——把小说变成解谜网站](../assets/banner.webp)

# novel2arg

[中文](README.md) | [English](README_en.md)

一个 agent 技能，把悬疑 / 推理小说改编成伪装成真实网站的多页静态解谜游戏（ARG-lite）。

玩家看到的不是一个游戏。他们打开的是一个看起来像真实机构网站的站点——公司内网、档案馆、登录门户——阅读其中的公文，检索站内索引，从人物的生活痕迹里找出密码。真实感就是产品本身，本技能的每一条规则都在保护它。

## 你会得到什么

- **多页站点，不是单页应用。** 每个叙事地点都是可独立打开的 HTML 文档，地址栏是叙事道具；单文件壳、canvas 场景、道具栏界面、打包成单文件发布都被规则禁止（R1）。
- **谜题即人物推断。** 每个凭据都出自人物的生活痕迹——生肖、工号、纪念日；禁止随机字符串，门禁哈希不带明文上线（R3）。
- **双层叙事。** 表层日常温和，暗层阴冷，两层各自拥有皮肤与文案；跨层时整页换肤（R2）。
- **每页都写给它在世界观里的读者。** 公开页只发布该机构会发布的内容，没有页面面向玩家说话或提及剧情（R5、R6）。
- **交付前有证据。** 无依赖的 Node 检查器证明冷启动可解、无死链、无跨层泄漏、凭据可溯源，并完整彩排通关。

## 安装

把仓库地址发给你的 agent（Claude Code / opencode / Codex 等）：

> Install this skill: https://github.com/XingfenD/novel2arg

agent 会把仓库放进对应的 skills 目录。

## 使用

> 用 novel2arg 技能把这部悬疑小说（"…"）改编成互动网页解谜游戏。

技能按八步工作流推进。第 4、5 步是脚手架前的闸门，第 3 步会停下来等你审阅：

| # | 步骤 | 交付物 |
|---|---|---|
| 1 | 拆解小说 | 五张表 |
| 2 | 选择世界容器（技能会问你） | GDD 封面记录 |
| 3 | 撰写 GDD | `docs/gdd.md` — 你的审阅检查点 |
| 4 | 触达链分析 | `docs/reachability.md` — 闸门 |
| 5 | 谜题设计分析 | `docs/puzzle-audit.md` — 闸门 |
| 6 | 脚手架 | 框架 + 每页骨架 |
| 7 | 实现 | 成品站点 |
| 8 | 自检 | `docs/self-check.md` |

## 仓库地图

- `SKILL.md` — 工作流路由、项目根目录约定与六项派发契约
- `workflow/` — 八个步骤文件：小说拆解 → 世界容器选择 → GDD → 触达链分析 → 谜题设计分析 → 脚手架 → 实现 → 自检
- `references/guardrails.md` — 四条约束、权威规则 R1–R12（所有重复规则的唯一出处）、禁止形态、基线理性化对照、红旗信号、不适用场景
- `references/design-playbook.md` — 六维设计范式（流程 / 谜题 / 文案 / 排版 / 冲突 / 交互）+ 13 类谜题分类
- `references/structure/base.md` — 共用的多页前端基底：目录树 + 页面骨架
- `references/structure/components.md` — Alpine.js 组件参考实现（关键词哈希构建、搜索引擎、密码门、分阶段组件、皮肤、进度）
- `references/structure/tooling.md` — 检查节奏、共享 `tools/config.mjs` 旋钮、静态检查无法替代的人工方法
- `references/structure/form-website.md` — 容器 A：假官方网站（搜索中枢、分层索引、密码门）
- `references/structure/form-system.md` — 容器 B/C/D：系统类虚构（账号登录、按账号授权、桌面 / 模拟互联网 / 档案系统外壳）
- `references/common-mistakes.md` — 按工作流步骤分组的基线测试陷阱；各步骤文件引用对应小节
- `examples/` — 步骤 1/3/4/5 的产物形状示例 + 一份填好的派发 prompt 样例
- `assets/tools/` — 随项目复制的零依赖 Node 文件：`config.mjs`（所有检查脚本共享的约定，项目改名时只改这一个文件）、`hash.mjs`、`build-keywords.mjs`、`check-links.mjs`、`check-solvable.mjs`、`check-credentials.mjs`（组合 / 派生凭据：部件 + 规则 + 零明文）、`check-reachability.mjs`（演算副本可达性）、`vendor-alpine.mjs`；`check-solvable.mjs --self-test` 可自检文本匹配器
- `scripts/check-docs.mjs` — 仓库自检（路径、§ 引用、规则编号、链接、孤儿文档），由 CI（`.github/workflows/ci.yml`）运行
- `docs/CHANGELOG.md` — 变更日志（每条中英文各一行）
- `LICENSE` / `LICENSE.docs` — 双许可：代码与工具用 MIT，文档与提示词内容用 CC BY-SA 4.0
- `docs/USAGE.md` / `docs/USAGE_en.md` — 使用须知中文默认版与英文译版（改编有版权的小说、欺骗性使用边界）；属政策声明，不是许可证的一部分

## 运行要求

Node.js 20+ 用于运行检查器工具。生成的游戏本身是纯静态 HTML/CSS/JS，外加本地化、经 sha256 校验的 Alpine.js——无构建步骤，直接托管即可（GitHub Pages 可用）。

## 许可与合规

双许可：代码与工具为 [MIT](../LICENSE)，文档与 prompt 内容为 [CC BY-SA 4.0](../LICENSE.docs)。你用本技能产出的游戏归你所有，不受两份许可证约束。

改编受版权保护的小说或公开部署游戏前，请先读[使用须知](USAGE.md)（[English](USAGE_en.md)）：改编需要权利人许可，产出物不得用于钓鱼、冒充真实机构或诽谤。

## 文档

- 更新日志：[CHANGELOG.md](CHANGELOG.md)
- 负责任使用说明：[USAGE.md](USAGE.md)（[English](USAGE_en.md)）
