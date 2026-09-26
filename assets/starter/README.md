# 《游戏名》

make-my-arg 的起点项目：每个生成的项目都把这棵树复制为起点，再按 `docs/system-profile.md` 组装、删改、填充。
纯静态、无构建步骤——HTML + CSS + 本地 vendored 的 Alpine v3 + 零依赖 Node 工具，任何静态托管都能跑。

## 模板说明（成稿时改写或删除本节）

- `《》` 是占位符：组织名、页面标题、正文文案，全部换成虚构自己的话。本页随项目一起改写。
- 模板里的 `<!-- -->` 注释是写作指引，不是给玩家看的内容：填充页面时逐条删除。step 8 的 chrome 扫描会把残留提示当泄漏处理（R4）。
- `<html lang>` 随故事的语言设置。
- 入口页带一个指向 make-my-arg 技能仓库的 GitHub 链接（对技能的引用，请勿删除）；入口除此之外只有进入按钮，没有“关于”页。
- 这棵树只放**不随模块变化**的那部分：入口外壳、共用 css/js、两份忽略文件、README。带模块标记的文件——`search.html`（M1）、`data/`（M1/M2/M6）、`secret.css`（M5）、`pages/` 与受限区域、结局页（M10）——由 step 6a 按 `docs/system-profile.md` 的选择创建；profile 没选的机制一个都不出现。`tools/` 和 `viewer/` 由 step 6a 从 skill 的 `assets/` 拼装进来，它们各有唯一出处，不要在项目里分叉维护。
- 起点项目里没有 `data/*.src.json`：它自带的 `.gitignore` 会把这些明文表忽略掉，而明文表只应在 6a 选中对应模块时才创建。

## 目录结构

| 路径 | 说明 |
|---|---|
| `index.html` | 入口外壳（M9）：身份赋予 + 进入按钮；底部带指向 make-my-arg 仓库的引用链接；规则说明只在虚构确有必要时出现 |
| `pages/` | 站点页面，一篇一文档；受限区域用虚构自己的词命名（`internal/` `staff/` `archive/`），绝不叫 `secret/`，文件名不许剧透 |
| `assets/css/base.css` | 共用骨架：常驻顶栏、页面栏宽、文档套件、门禁表单、`x-cloak`、M11 纹理 |
| `assets/css/surface.css` | 公开层皮肤：色板与字体，唯一随虚构气质改动的地方 |
| `assets/css/secret.css` | M5 深层皮肤；profile 未选 M5 时这个文件不存在 |
| `assets/js/components.js` | 共用内核：`hash()` 与 session store；只注册 profile 选中的组件 |
| `assets/js/vendor/alpine.min.js` | `node tools/vendor-alpine.mjs` 拉取并校验 sha256 后落下，永不改动、不走 CDN |
| `.gitignore` | 随起点项目落到项目根：开发副产物不进 Git 历史 |
| `.dockerignore` | 随起点项目落到项目根：明文表 / `docs/` / 机制文件不进部署镜像 |
| `assets/img/` `audio/` `docs/` | 图片、音频谜题、可下载的仿制文档（pdf/xlsx），用到才建 |
| `data/keywords.*.src.json` | 明文索引表，开发专用，不进部署树 |
| `data/keywords.*.json` | `node tools/build-keywords.mjs` 产出的哈希表，站点真正读取的文件 |
| `data/forbidden.json` | M6 禁用词模块（哈希 + 触发态文案） |
| `data/credentials.src.json` | M2 派生凭据的出处登记（部件 + 规则），开发专用 |
| `tools/` | step 6a 从 `assets/tools/` 复制：检查器与 `config.mjs` |
| `viewer/` | step 6a 从 `assets/viewer/` 复制：站点图渲染树，不是站点页面 |
| `docs/` | step 1–5 的产物：story canon（五张表）、system-profile、GDD、触达链、谜题分析 |
| `deploy/` | 部署脚本与清单，用到才建 |

`tools/`、`viewer/`、`docs/`、`deploy/` 里没有站点页面：走图工具按 `CONFIG.skipDirs` 跳过它们，所以生成的站点图永远不会把页数撑大。

## 本地运行

静态站点，没有构建：

```bash
python3 -m http.server 8000     # 然后打开 http://localhost:8000
```

直接双击 `index.html` 也能看，但检索模块要 `fetch()` 读 `data/*.json`，需要 http(s)，所以请用上面的本地服务。

## 检查（`tools/` 拼装后可用）

```bash
node tools/build-keywords.mjs      # 改动任何 data/keywords*.src.json 之后，重新生成哈希表
node tools/check-links.mjs         # 死链 + 公开索引泄漏；期望 "0 dead · 0 layer leaks"
node tools/check-solvable.mjs      # 冷启动走查：每页可达、每个门可解、关键词都被读过
node tools/check-credentials.mjs   # 派生凭据：部件 + 规则 + 零明文（存在 credentials.src.json 时）
node tools/check-reachability.mjs  # 演算副本：把凭据注入一次性副本，复跑可达性
node tools/site-graph.mjs          # 产出 docs/site-graph.json 与 docs/site-graph/（报告型，有问题也退出 0）
node tools/check-solvable.mjs --self-test   # 改过 tools/config.mjs 之后自检匹配器
```

每次内容编辑后重跑，不只是部署前。改名、改层名、改标记只改 `tools/config.mjs` 一个文件，不要重写检查器。

## 部署

静态树部署就是一次拷贝，因此有第二条泄漏路径：明文 `data/*.src.json`（答案本身，R3）、`docs/`（GDD 与触达链就是全部答案）、`tools/` `viewer/` `deploy/` 机制文件，都不得进入部署目录。两份忽略文件就在这棵树里，随复制落到项目根；GitHub Pages 直接发布仓库即可。

## 设计文档

- `docs/system-profile.md` — step 2 与用户一起选定的容器与模块
- `docs/gdd.md` — 游戏设计文档：front matter（资产清单 + 实体登记表）+ 八节
- `docs/reachability.md` — 触达链分析：每页从哪来、守门是什么
- `docs/puzzle-audit.md` — 谜题设计分析：必要性 / 可得性 / 直观性 / 泄漏扫描
- `docs/self-check.md` — step 8 的逐项通过 / 失败清单
