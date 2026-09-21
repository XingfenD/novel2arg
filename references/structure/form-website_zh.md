> 中文译本，供审阅用；与 `references/structure/form-website.md` 不一致时以英文原文为准。

# 形态 —— 假官方网站（容器 A）

适用于玩家潜入某个组织公开网站的游戏：原生触达模型是
**搜索 + 密码门**（模块 M1/M2；规则 R7–R9 见 `references/guardrails_zh.md`）。先读
`references/structure/base_zh.md`；本文件在共享基底之上添加网站层。

## 1. 结构

基底目录树，加网站特有部分：

- `search.html` —— 中枢（M1），挂载搜索组件。
- 按受众命名的关键词表：默认 `data/keywords.surface.src.json`（公开）与
  `data/keywords.secret.src.json`（深层）。
- 页面按虚构自身的区域拆分；受限区域用虚构的词（`internal/`、`staff/`、
  `archive/`）——绝不用 `secret/` 目录。让 `CONFIG.secretUrl` 指向它（`references/structure/tooling_zh.md` §2）。

## 2. 访问模型

本容器没有账号（内网子区域可以嵌套系统形态，§4）。每个隐藏页都靠关键词搜索（M1）或
密码门（M2）到达：

- 公开页以 `data-index="data/keywords.surface.json"` 挂载搜索组件；深层页把
  `data-index` 指向深层表（`references/structure/components_zh.md` §2）。按受众分范围是
  必需的（R8）——一张平铺索引会让搜索框变成通关攻略。
- 公开关键词路由到公开页或某个密码门——绝不直接进入受限文件。访客打不开的命中落到
  它的门或一条朴素的未开放提示（R8）。
- 密码门采用 Shape A/B（`references/structure/components_zh.md` §3）；凭据三要素适用（R3）。

## 3. 信息架构规则

导航栏、索引页与列表页、站点地图与页脚链接在搜索之外也承载线索投递。每条链接存在都是
因为该组织真会发布它（R7）；没有页面携带进入更深区域的"相关文件 / 档案"链接（R7；
`workflow/04-reachability_zh.md` 审计这一点）。结果标题是目录条目，不是情节概括（R9）。

## 4. 内网子区域

如果虚构包含员工内网或管理区域，那座孤岛使用系统形态模式：账号登录 + 按账号授权
（`references/structure/form-system_zh.md`）。
