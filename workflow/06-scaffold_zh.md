> 中文译本，供审阅用；与 `workflow/06-scaffold.md` 不一致时以英文原文为准。

# 步骤 6 — 脚手架

按顺序两次派发：6a 在上下文中不含任何情节的前提下搭建系统框架；6b 带着情节产物补全页面骨架。**输出：** 文件树，每个页面都有骨架。

**输入：** 6a：`docs/system-profile.md`、references/guardrails_zh.md（禁止形态）、references/structure/base_zh.md、references/structure/components_zh.md，以及所选容器的形态文档（A 用 references/structure/form-website_zh.md，B/C/D 用 references/structure/form-system_zh.md）。6b：`docs/gdd.md`、`docs/reachability.md`、`docs/puzzle-audit.md`、6a 的框架，外加同样的参考资料。

## 6a — 前端系统框架（不含情节）

步骤 2 与用户一起写好了 `docs/system-profile.md`；6a 消费它。profile 是组装记录：
容器与形态文档；系统身份（类型、组织、年代、语域、语言）；选定模块；外壳
信息架构（顶栏、目录布局、页面根目录、C 的站点根目录）；基础页；基础设施（base.md 章节、
components.js、内置 Alpine、tools/、CONFIG 旋钮）；索引 / 访问约定；编号选择。它不携带
角色、情节、秘密、线索设计、结局、小说文本或任何前置产物。

严格按 `references/structure/base_zh.md` §1 搭建框架，每个页面使用
`references/structure/base_zh.md` §2 的页面骨架，并遵循形态文档：

- 完整目录树，含各区域（base.md 的命名规则：受限区域用虚构自身的词，绝不用 `secret/`）
- `index.html` 入口外壳（start 按钮；规则占位符只在 profile 列出规则时保留——其文案在步骤 7 的 phase 7 落地）
- 系统外壳与基础页——A：首页、导航 / 索引 / 列表模板、搜索结果、登录 / 密码门模板；B：`desk.html` 加空的应用外壳；C：站点根目录、内网首页与登录；D：`query.html`、`results.html`、详情模板
- profile 选定的皮肤 CSS（`base.css` 与 `surface.css` 总是包含；`secret.css` 仅当 M5；`forbidden.css` 仅当 M6）、只含所选组件的 `components.js`（search / gate / access / staging / progress；参考实现：`references/structure/components_zh.md`）、内置的 Alpine 运行时（`assets/js/vendor/alpine.min.js`，由 `node tools/vendor-alpine.mjs` 生成，该脚本固定版本并在写入前校验 sha256）
- 从本 skill 的 `assets/tools/` 复制进 `tools/` 的八个工具文件（`config.mjs` —— 所有检查器共同导入的共享约定，项目改名只需改这一个文件 —— 加上 `hash.mjs`、`build-keywords.mjs`、`check-links.mjs`、`check-solvable.mjs`、`check-credentials.mjs`、`check-reachability.mjs`、`vendor-alpine.mjs`；零依赖，只用 Node 内置模块），以及仅当选择 M1 时才创建的空但合法的关键词表
- 选择 M10 时的结局页，以及存放步骤 1 到 5 产物的 `docs/`
- 每个基础页都落在 `references/structure/base_zh.md` §2 骨架上：正确的皮肤、页头导航、页脚、选择 M7 时的进度编号、空或占位的正文

框架是真实系统的外壳，不是游戏：任何地方都不含情节文案，文件名也不剧透。基础页文案使用系统自己的词（通知公告、通讯录），绝不使用故事的词。页面保持为独立文档、带真实导航；Alpine 只管理页内组件的生命周期（`init()` / `destroy()`）——路由与场景切换不归它管。

**交回：** 变更文件清单与未决问题，经编排者转回。

## 6b — 页面骨架（含情节）

在 6a 框架上，把触达表中列出的每个页面搭成骨架，带正确的皮肤、页头导航、页脚与进度编号（选择 M7 时）。此阶段正文为空即可；缺文件会破坏步骤 8 的图遍历。结局页在此只是骨架；其文案在步骤 7 落地。

框架是固定的：不要重建外壳、CSS、组件或工具——只添加页面集合。

本步骤的基线测试陷阱：`references/common-mistakes_zh.md` §6 —— 交回产物前逐条检查。
