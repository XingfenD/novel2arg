# novel2arg

把悬疑小说改编成"伪装成真实网站"的多页面静态网页解密游戏（ARG-lite）的 agent skill。

## 安装

把仓库链接发给你的 agent（Claude Code / opencode / Codex 等），说一句：

> 安装这个 skill：https://github.com/XingfenD/novel2arg

agent 会自己把仓库放到对应的 skills 目录。

## 使用

对 agent 说：

> 基于这部悬疑小说《…》，用 novel2arg skill 生成一个交互式网页解密游戏

## 内容

- `SKILL.md` — 六步工作流：小说拆解 → 选世界容器 → GDD → 脚手架 → 实现 → 自检
- `references/design-paradigms.md` — 六维设计范式（流程/谜题/文案/排版/冲突/交互）+ 13 类谜题分类学
- `references/project-structure.md` — 多文件前端项目结构 + 搜索引擎/密码门/皮肤/演出模块参考实现
