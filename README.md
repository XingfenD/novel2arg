# mystery-web-game (opencode skill)

把悬疑小说改编成"伪装成真实网站"的多页面静态网页解密游戏（ARG-lite）的 agent skill。
范式提炼自三个已上线中文网页解谜游戏的源码级逆向分析（假餐馆官网 / 假 macOS 桌面 / 33 仓库伪互联网）。

## 安装

```bash
git clone https://github.com/XingfenD/novel2arg.git \
  ~/.config/opencode/skills/mystery-web-game
```

Claude Code 用户改装到 `~/.claude/skills/mystery-web-game`。

## 使用

对 agent 说：

> 基于这部悬疑小说《…》，用 mystery-web-game skill 生成一个交互式网页解密游戏

## 内容

- `SKILL.md` — 六步工作流：小说拆解 → 选世界容器 → GDD → 脚手架 → 实现 → 自检
- `references/design-paradigms.md` — 六维设计范式（流程/谜题/文案/排版/冲突/交互）+ 13 类谜题分类学
- `references/project-structure.md` — 多文件前端项目结构 + 搜索引擎/密码门/皮肤/演出模块参考实现
