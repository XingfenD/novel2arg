# novel2arg

[English](README.md) | [中文](README_zh.md)

一个 agent 技能：把悬疑 / 推理小说改编成伪装成真实网站的多页静态解谜游戏（ARG-lite）。

## 安装

把仓库地址发给你的 agent（Claude Code / opencode / Codex 等），并说：

> Install this skill: https://github.com/XingfenD/novel2arg

agent 会把仓库放进对应的 skills 目录。

## 使用

对 agent 说：

> 用 novel2arg 技能把这部悬疑小说（"…"）改编成互动网页解谜游戏。

## 目录结构

- `SKILL.md` — 工作流路由与子代理派发契约
- `workflow/` — 八个步骤文件：小说拆解 → 世界容器选择 → GDD → 触达链分析 → 谜题设计分析 → 脚手架 → 实现 → 自检
- `references/paradigm.md` — 四条约束、禁止形态、基线理性化对照、红旗信号、不适用场景
- `references/design-paradigms.md` — 六维设计范式（流程 / 谜题 / 文案 / 排版 / 冲突 / 交互）+ 13 类谜题分类
- `references/structure/base.md` — 共用的多页前端基底 + Alpine.js 组件参考实现（搜索引擎、密码门、分阶段组件、进度）
- `references/structure/form-website.md` — 容器 A：假官方网站（搜索中枢、分层索引、密码门）
- `references/structure/form-system.md` — 容器 B/C/D：系统类虚构（账号登录、按账号授权、桌面 / 模拟互联网 / 档案系统外壳）
- `references/common-mistakes.md` — 按工作流步骤分组的基线测试陷阱；各步骤文件引用对应小节
- `assets/tools/` — 四个零依赖 Node 脚本，随项目复制：`hash.mjs`、`build-keywords.mjs`、`check-links.mjs`、`check-solvable.mjs`；项目改名时改 CONFIG 即可，`check-solvable.mjs --self-test` 可自检文本匹配器
