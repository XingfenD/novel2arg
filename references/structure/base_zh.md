> 中文译本，供审阅用；与 `references/structure/base.md` 不一致时以英文原文为准。

# 前端基底（各容器共用；禁止单个 index.html）

> 纯静态，无构建步骤：HTML + CSS + Alpine.js v3 核心（本地内置；无插件，无运行时 CDN）。
> Node 工具可选、零依赖、只跑内置模块。可在任何静态托管上运行（推荐 GitHub Pages）。
> 本文件覆盖目录树（§1）与页面骨架（§2）。Alpine 组件参考实现位于
> `references/structure/components_zh.md`；检查节奏、共享配置与人工方法见 `references/structure/tooling_zh.md`。

## 1. 目录结构

模块标记（M1…M13）来自 `references/design-playbook_zh.md` §2，仅当 `docs/system-profile.md`
选中时出现；其余都属于基底。

```
<game-name>/
├── index.html                    # 入口页（M9）：角色分配 + start 按钮（规则只在虚构需要时出现）
├── search.html                   # M1 搜索模块
├── pages/
│   ├── home.html  menu.html  news.html …      # 公开页，在虚构需要分区前保持平铺
│   └── internal/                 # 受限区域——用虚构自身的词命名（staff/ archive/ members/），
│       │                         # 绝不用 "secret"；文件名不得剧透。CONFIG.secretUrl 指向这里（tooling.md §2）。
│       └── s19-record.html  s23-diary.html …
├── assets/
│   ├── css/
│   │   ├── base.css              # 共享布局骨架、文件现实感套件、x-cloak
│   │   ├── surface.css           # 公开皮肤
│   │   └── secret.css            # M5 图层换肤模块
│   ├── js/
│   │   ├── components.js         # Alpine 组件（search / gate / access / staging / progress），在 alpine:init 上注册
│   │   └── vendor/
│   │       └── alpine.min.js     # Alpine v3 核心，固定版本（脚手架时经 tools/vendor-alpine.mjs 内置一次；永不编辑；无插件）
│   └── img/  audio/  docs/       # 图片、音频谜题、可下载的仿真文件（pdf/xlsx）
├── data/
│   ├── keywords.surface.src.json # 明文公开索引（仅开发；不进部署树）
│   ├── keywords.secret.src.json  # 明文深层索引（仅开发；不进部署树）
│   ├── keywords.surface.json     # 公开哈希表——不得包含受限区域 URL（R8）
│   ├── keywords.secret.json      # 深层哈希表，仅由深层页面获取
│   ├── forbidden.json            # M6 模块（哈希 + 禁词状态文案）
│   └── credentials.src.json      # M2 派生凭据溯源（仅开发）
├── tools/                        # 脚手架时从本 skill 的 assets/tools/ 复制的八个文件
└── README.md                     # 如何运行 + GDD 链接 + 玩家须知
```

工具在本 skill 的 `assets/tools/` 下随附；脚手架把它们复制进 `tools/`，让项目自足且可重复
运行。它们只用 Node 内置模块（`node:crypto`、`node:fs`、`node:path`、`node:child_process`）——
零依赖，无需安装。检查器从共享的 `tools/config.mjs` 导入自己的假设：项目改名目录、层名或
标记时，只改这一个文件，而不重写检查器（`references/structure/tooling_zh.md` §2 列出旋钮，
其第 3 节列出静态检查无法替代的方法）。关键词表自动发现，因此上面的按层约定与单表项目
都能零配置工作。每次内容修改后重跑检查，而不只在部署前——权威的通过 / 失败清单是
`workflow/08-self-check_zh.md`。

脚手架时一次性内置 Alpine 运行时（脚本固定版本、写入前校验 sha256，随后随游戏一起提交）：

```bash
node tools/vendor-alpine.mjs      # 写入 assets/js/vendor/alpine.min.js（alpinejs@3.17.3，校验和已验证）
```

上面的树是共享基底；形态文档在其上调整页面与触达模型：

- **容器 A —— 假官方网站**：`references/structure/form-website_zh.md` —— 搜索中枢、按受众分索引、密码门。
- **容器 B/C/D —— 系统类虚构**：`references/structure/form-system_zh.md` —— 账号登录、按账号授权（RBAC 式），以及桌面 / 模拟互联网 / 档案系统外壳。系统类项目的页面根目录可以是 `apps/` 而不是 `pages/`；在 `tools/config.mjs` 里设置一次 `pagesDir`（tooling.md §2）。

## 2. 页面骨架模板（各页统一）

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>&lt;页面标题&gt;</title>
  <link rel="stylesheet" href="../../assets/css/base.css">
  <link rel="stylesheet" href="../../assets/css/surface.css"><!-- M5：深层页改为引用 secret.css -->
  <script defer src="../../assets/js/components.js"></script><!-- 在 alpine:init 上注册 Alpine 组件；先于 Alpine 运行时执行 -->
  <script defer src="../../assets/js/vendor/alpine.min.js"></script><!-- 内置的 Alpine v3 核心；自动启动并触发 alpine:init -->
</head>
<body><!-- M7: data-page="14" data-total="36" -->
  <header><!-- 全站常驻栏，承载该组织自己的导航链接（选择 M1 时也承载搜索表单） -->
  </header>
  <main><!-- 页面正文：一份"文件"。把下一个关键词埋进文案（加粗专有名词 / 放进表格） --></main>
  <footer><small>© ...<!-- M7: <span class="progress">14/36</span> --></small></footer>
  <!-- M11 世界纹理：隐形链接、黑底黑字可选文本、手抄红字（`references/design-playbook_zh.md` §2） -->
</body>
</html>
```

规则：**常驻顶栏**——每个页面的页头（容器 B 的顶部菜单栏同理）固定在视口顶部，长页面上
不随滚动离开视野（base.css 全站给出 `position: sticky; top: 0` + 不透明背景，深层页也一样）；
页头承载该组织自己的导航链接，它与页脚自己的链接（以及选择 M1 时的搜索框）是公开页仅有的
跨页链接（R7）。每个 `<input>` 的 placeholder 都只命名其字段（`Search...`、`Employee ID`）（R4）。
每个页面按相同顺序加载同样的两个脚本（`components.js` 先于 Alpine 运行时），且不携带内联
行为接线——行为住在 `x-data` 组件里。深层页页脚可用 `ex/36` 或 `?/36` 这样的异常编号（M7）；
`[该内容已被删除]` 占位是合法的叙事元素。
