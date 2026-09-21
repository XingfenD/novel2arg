> 中文译本，供审阅用；与 `references/structure/tooling.md` 不一致时以英文原文为准。

# 工具 —— 检查节奏、共享配置、人工方法

> `references/structure/base_zh.md` 与 `references/structure/components_zh.md` 的配套文件。
> 步骤 8（以及在步骤 6 把 `tools/` 复制进项目时）的必读。

## 1. 运行检查

权威的通过 / 失败清单——每条命令与每个人工项——是 **`workflow/08-self-check_zh.md`**；
本节只覆盖检查节奏与脚本自动化的部分。

```bash
node tools/build-keywords.mjs     # 对任一 data/keywords*.src.json 做任何修改后重新生成哈希表
node tools/check-links.mjs        # 死链 + 公开索引泄漏；期望 "0 dead · 0 layer leaks"
node tools/check-solvable.mjs     # 冷启动遍历；期望 "fixpoint in N round(s) · gates 4/4 unlocked · pages 28/28 reachable"
node tools/check-credentials.mjs  # 组合 / 派生凭据：部件 + 规则 + 零明文（只要 data/credentials.src.json 存在就运行）
node tools/check-reachability.mjs # 演算副本：把凭据注入一份一次性拷贝，再证明门解锁 + 页面可触达
```

`check-solvable.mjs` 把人工走查中**逐字凭据**的溯源那一半自动化了，因此人工走查只需判断
语气与节奏。线索被删、密码被改、线索被错放进页面自己的解锁后区块、列表条目被砍，它都会
以非零退出——每次内容修改后都运行，而不只在部署前。它从 components.md §3 读取门约定
（`data-expect-hash`、`x-show="unlocked"` / `<template x-if="unlocked">`、`x-data="search"`）；
改名这些标记的项目改 `tools/config.mjs`（§2），然后用 `node tools/check-solvable.mjs --self-test`
复核匹配器。

**派生 / 组合**凭据（由部件拼装、从不整串印出）落在 check-solvable 的逐字模型之外——
它会把该门报为 STUCK。不要为了把检查变绿而打印它（那会泄露给每个访客；静态站点没有
服务端鉴权）。`check-credentials.mjs` 证明它由公开页部件零明文拼装；`check-reachability.mjs`
证明凭据已知后图仍能解锁（§3 第 6 项）。

`hash.mjs` 是设计期辅助工具（步骤 3/5，用于计算门的 `data-expect-hash` 值）；
`vendor-alpine.mjs` 在脚手架时运行一次（步骤 6）。

## 2. 共享配置（tools/config.mjs）

工具是对着一个接口写的，不是对着某一本书写的。每个检查器都从共享的 **`tools/config.mjs`**
导入自己的假设；项目改名目录、层名或标记时，只改这一个文件，而不重写检查器（重写会把
这些检查赖以存在的历史缺陷全部丢掉）。

| 旋钮 | 默认值 | 使用者 |
|---|---|---|
| `dataDir` / `pagesDir` | `data` / `pages` | check-links, check-solvable, build-keywords |
| `surfaceTable` / `secretUrl` | 文件名上的 `/surface/i` / `/^internal\//` | check-links |
| `entry` | `index.html` | check-solvable, check-reachability |
| `gateHashAttr` / `indexAttr` | `data-expect-hash` / `data-index` | check-solvable, check-credentials |
| `grantAttr` / `accessAttr` / `nextAttr` | `data-grant` / `data-access` / `data-next` | check-solvable（系统形态账号） |
| `unlockMarkers` / `unlockEnd` | `x-show="unlocked"` … `</main>` | check-solvable, check-reachability |
| `searchMount` | `x-data="search"` | check-solvable |
| `maxTokenLen` / `maxPhraseWords` / `maxPhraseLen` | 8 / 4 / 48 | check-solvable 匹配器 |
| `credTable` | `data/credentials.src.json` | check-credentials, check-reachability |
| `derivedKinds` / `zeroPlaintextKinds` | `['account','secret']` / `['account']` | check-credentials |
| `credSkipDirs` | `.git node_modules docs tools deploy` | check-credentials |
| `solver` | `tools/check-solvable.mjs` | check-reachability |

`node tools/check-solvable.mjs --self-test` 在改配置后校验匹配器（多词、长词、HTML 实体、CJK）。

## 3. 保持人工的部分

九件静态检查器看不到的事。每一件都有人工方法或配套工具；跳过它就是泄露路径。

1. **运行时绑定**——`:href`、`x-bind`、在 JS 里拼装的 DOM。两个链接检查器只解析静态 `href`、静态 `<form action>` 与门的 `data-next` 目标。人工方法是关键词表（搜索结果路由住在那里；`data-index` 告诉检查器搜索页能触达哪张表）以及把会话状态建模为 `data-grant` / `data-access`（`references/structure/form-system_zh.md` §5）。
2. **自身即数据库的中枢**——容器 B 的明文 `FILE_DATABASE`、容器 C 的绝对跨站链接。人工方法：在步骤 4 的遍历中把中枢当作列表页，然后在步骤 8 的全站巡检中把每个条目点一遍。
3. **不可跳过性**——check-solvable 证明门可解，从不证明它不可绕过；人工方法是按受众分范围（M1）：按受众分表、按页面 `data-index`、check-links 的泄漏守卫（R8）。
4. **哈希归一化是四方契约**——页面内辅助函数、`hash.mjs`、`build-keywords.mjs` 与 `check-credentials.mjs` 必须逐字节一致（`trim().toLowerCase()` → md5 → base64）。更换算法意味着在一次修改里改完这四方，然后 grep 找出按旧规则生成的表（R3）。
5. **多站点布局**——容器 C 给每个站点自己的根；每个根跑一遍工具（绝对跨站 URL 按设计被跳过，跨站图因此仍是步骤 4 的产物）。
6. **派生 / 组合凭据**——check-solvable 只匹配*逐字*出现的值，因此拼装而成的账号读作 STUCK。修法**不是**打印它（R12）：声明它，并用 `check-credentials.mjs`（部件 + 规则 + 零明文）加 `check-reachability.mjs`（注入这些值的演算副本）证明它。
7. **按标签页会话 vs. 新标签页结果**——check-solvable 把身份建模为一个全局集合，看不到 `sessionStorage` 是按标签页的，而结果以 `target="_blank"` 在新标签页打开；浏览器里文件显示为锁定时它照样报绿。人工方法：步骤 8 的跨标签页测试；结构性修法：会话 Cookie（components.md §2–§3，`references/structure/form-system_zh.md` §6）。
8. **元素级权限遮蔽**——检查器读页面*文本*，不读计算后的可见性；仅靠 `x-show` / CSS 类 / 元素级 `data-access` 藏起来的凭据仍在送达每个访客的 HTML 里，客户端遮蔽不是隐私（R12）。把它当公开内容对待：步骤 8 的外框扫描与 `check-credentials` 的零明文断言会抓住它。
9. **GDD 声明却从未落地的资产**——清单列出却没有页面引用的徽标 / 印章 / 扫描件 / 照片 / 仿真文件没有 `src` 可解析，两个检查器都不会抱怨。人工方法：步骤 8 的资产清单对账——每个声明资产都存在于 `assets/` 下，且至少被一个页面引用。

匹配器读*页面文本*而非 DOM，理由与玩家一样：它要证明某个字符串在门前是可读的。藏在
`placeholder`、`title` 或 JS 字符串里的线索对玩家与检查器同样不可见——步骤 8 的外框泄答
扫描覆盖这一类（R4）。
