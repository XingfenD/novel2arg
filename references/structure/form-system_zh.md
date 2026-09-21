> 中文译本，供审阅用；与 `references/structure/form-system.md` 不一致时以英文原文为准。

# 形态 —— 系统类虚构（容器 B/C/D）

当容器是一台机器——桌面（B）、模拟互联网 / 内网（C）、档案系统（D）——触达靠
**账号登录 + 按账号授权**区分（R10），而不是靠页面链接。先读
`references/structure/base_zh.md`；本文件在其上添加系统层（门 / 分阶段 / 换肤
组件：`references/structure/components_zh.md`；工具：`references/structure/tooling_zh.md`）。
只在虚构真有身份与登录的地方选择 M3 模块——触达跟随容器。

## 1. 触达模型 —— 账号，而非等级（RBAC 式）

- **登录门**认证一个账号：组件根上的 `data-grant="chen"` + `data-next="apps/mail.html"`。
  成功后把账号记入**会话 Cookie**（跨标签页，浏览器关闭即清除）——不是按标签页的
  `sessionStorage`，后者在 `target="_blank"` 结果打开的新标签页中会丢失
  （`references/structure/components_zh.md` §2–§3）。一个框可以经 `data-grants` 服务多个角色（§2）。
- **受保护页面或区块**注明允许读取它的账号：`data-access="chen"`（逗号 = 任一，`*` = 任何已认证账号）。
  它仍以 `x-show="unlocked"` 打开，好让 `check-solvable.mjs` 建模这条边界。
- **没有权限阶梯（R10）。** 页面只对它所命名的账号开放；admin 账号绝不继承同事的私人文件。
  如果情节需要 admin 访问某一份，页面就点名该账号，并由虚构给出理由。
- **深度靠搜索、门或账号跨越——绝不靠链接（R7）。** 浅层页面不携带进入更深区域的
  "相关文件 / 档案 / 页面"链接（`workflow/04-reachability_zh.md` 审计这一点）；每份私人文件
  在自己的账号被找到并使用之前保持关闭。
- **账号在会话内累积**（有意的简化）：认证一次，跨标签页可用；关闭浏览器清空一切。
  找到每个账号本身就是一次谜题节拍。
- **账号靠推断，不靠印出（R10）。** 只有初始账号可以印出；其他账号由文字线索（姓名、工号、
  入职年份、署名邮箱）加门上贴出的账号格式拼装。印出的同事登录名会让访问矩阵失效；
  `workflow/05-puzzle-audit_zh.md` Q4 会扫描它。
- **派生账号靠部件证明，绝不打印。** `check-solvable.mjs` 只匹配逐字字符串，
  因此拼装而成的账号读作 STUCK——为把它变绿而打印，就是泄露给每个访客（静态站点
  没有服务端鉴权；客户端遮蔽不是隐私）。在 `data/credentials.src.json` 里声明值 + 规则 + 部件；
  `check-credentials.mjs` 与 `check-reachability.mjs` 证明它（`tooling.md` §3 第 6 项）。

### 搜索 / 查询结果服从访问矩阵

检索系统是另一条触达路径，因此经同一矩阵解析——关键词索引**不是**访问控制所在之处：

- 每个站点一张索引（`data/keywords.json`）；系统形态没有按层拆分的 JSON。
- 目标页面执行自己的 `data-access`：会话账号不可读取的文件显示未开放提示 / 登录链接，绝不显示文件。
- 虚构列表（档案结果、邮箱行）把不可读条目显示为一条朴素的未开放提示，或把它路由到登录门；
  绝不直接链开文件。
- `check-solvable.mjs` 建模了这一点：一条搜索边只有在其指名的账号已认证后（该关键词必须先
  在被读过的页面中出现过）才打开受保护文件。

网站形态保留其按受众分表（`references/structure/form-website_zh.md`）；在这里，账号矩阵取代它们。

## 2. 登录页（`gate` + `data-grant` / `data-grants`）

一个登录框，每个凭据一个身份。`data-grant` 是门可授予身份的平铺列表——`check-solvable.mjs`
遍历它。`data-grants` 是根上的 JSON 映射，把*输入的账号*解析到其身份、它自己的密码哈希
与可选的换肤令牌；运行时按条目把账号与密码配对，因此 `intern + handler-pw` 会被拒绝。
**不要为给检查器"一个表单 = 一个身份"把一个登录拆成两个表单**——第二个表单的标题会
泄露设计意图，读起来像游戏 UI。

```html
<!-- Single box, two roles. data-grant = static list for the walk; data-grants = runtime account→identity map. -->
<main x-data="gate" data-grant="intern,handler" data-next="query.html" data-fail-hint="账号或口令有误"
      data-grants='{"<hash:hz-sy-0042>":{"id":"intern","pw":["<hash:1998>"]},
                    "<hash:lly0219>":{"id":"handler","pw":["<hash:2003>"],"reskin":"secret"}}'>
  <form class="gate" @submit.prevent="submit">
    <label for="u">账号</label><input id="u" type="text" placeholder="工号" data-expect-hash="<hash:hz-sy-0042>,<hash:lly0219>">
    <label for="p">密码</label><input id="p" type="password" placeholder="密码" data-expect-hash="<hash:1998>,<hash:2003>">
    <p class="gate-error" x-show="error" x-text="error" x-cloak></p>
    <button type="submit">登录</button>
  </form>
</main>
```

`gate` 组件先读 `data-grants`，回退到 `data-grant`（`references/structure/components_zh.md` §3）。
凭据三要素仍然适用（A 页账号线索、B 页密码线索、C 页门）。账号字符串是其他页面对照的身份；
除初始账号外不印在任何地方（§1）。

## 3. 受保护页面（`access` 组件）

```html
<main x-data="access" data-access="chen">
  <div x-show="!unlocked">请先登录。</div>
  <div x-show="unlocked" x-cloak>…chen 的私人文件与后续链接…</div>
</main>
```

```js
// Reads the cross-tab session cookie set by the gate (components.md §3 `session` helper), falling back to
// sessionStorage in private mode. A protected document opened in a new tab (target="_blank") must still
// unlock — per-tab sessionStorage would not, which is exactly the defect this avoids.
Alpine.data('access', () => ({
  unlocked: false,
  init() {
    const held = session.access();          // components.md §3 helper: cookie-first, sessionStorage fallback
    const need = (this.$el.dataset.access || '').split(',').map((s) => s.trim()).filter(Boolean);
    this.unlocked = need.some((r) => (r === '*' ? held.length > 0 : held.includes(r)));
    const skin = session.skin();            // optional reskin token granted at login (M5)
    if (skin) document.body.classList.add(skin);
  },
}));
```

一个页面可以既受保护又带门（保险库）：门表单位于上锁的那部分内部，因此遍历先认证账号，
再解开密码门。

## 4. 各容器外壳

- **B 桌面**：`desk.html`（图标网格 + Dock + 菜单栏）；每个应用一页（`chat.html`、`mailbox.html`、
  `cloud-drive.html`…）。Spotlight 的 `FILE_DATABASE` 是明文 JS，对 `check-solvable` 不可见——
  把它的条目镜像进关键词表，或人工核对（`tooling.md` §3 第 2 项）。操作系统账号就是登录账号。
- **C 模拟互联网**：每个站点一个顶层目录（`sites/forum/`、`sites/blog-2009/`…），跨站链接用绝对路径；
  内网登录就是账号系统。每个站点根跑一遍工具（`tooling.md` §3 第 5 项）。
- **D 档案系统**：`query.html`（多字段门：姓名 / 编号 / 日期）→ `results.html`（目录条目；
  不可读行显示一条朴素的未开放提示或路由到它们的登录门）→ 档案详情页，每页携带
  `data-access`。访问靠账号，绝不靠等级。
- **假官方网站**可以为内网子区域借用这个模式；其公开页遵循
  `references/structure/form-website_zh.md`。

## 5. 检查器约定（`assets/tools/`）

- 登录门：`data-grant`（+ `data-grants`）+ `data-next`。`check-links.mjs` 把 `data-next` 当链接解析；
  `check-solvable.mjs` 把它当解锁后的边来跟随，并遍历平铺的 `data-grant` 列表。
- 受保护页面 / 区块：`data-access` + `x-show="unlocked"`。在指名账号认证之前，该区块对遍历
  不可读；`data-access` 指向的账号没有任何门授予时会被报为不可触达——那是线索图断裂，
  不是检查器错误。
- 派生 / 组合账号在逐字模型之外：在 `data/credentials.src.json` 中声明它，运行
  `check-credentials.mjs` + `check-reachability.mjs`；绝不为让 `check-solvable` 变绿而打印它（§1）。
- 如果页面根目录不是 `pages/`（例如 `apps/`），在 `tools/config.mjs` 里设置 `pagesDir`（`tooling.md` §2）。
  只存在于 JS 中的状态，或按标签页 vs 跨标签页的会话存储，对检查器不可见——用
  `data-grant` / `data-access` 建模，或人工核对（`tooling.md` §3 第 1、7 项）。

## 6. 会话状态

访问状态住在**会话 Cookie**（跨标签页，浏览器关闭即清除）；会话之外什么都不留存，
也不保存任何进度。绝不用 `localStorage`，绝不在 `target="_blank"` 结果背后用按标签页的
`sessionStorage`。这是实现要求，不是面向玩家的文案。

## 7. 反模式

| 反模式 | 为什么失败 |
|---|---|
| 数值权限阶梯，或一个能打开一切的 admin 账号（R10） | 不是按人授权：私人文件泄露给权限最高的账号，登录不再是谜题；workflow/04 的访问检查判其为缺陷 |
| 浅层页的"相关档案 / 文件"链接进入深层区域（R7） | 用链接跨越深度；触达必须经过搜索、门或账号 |
| `data-access` 指向的账号没有任何门授予 | 死掉的私人页面；check-solvable 报其不可触达 |
| 访问状态放在 `localStorage`，或放在 `target="_blank"` 结果背后的按标签页 `sessionStorage` | localStorage 破坏会话虚构；按标签页 sessionStorage 在结果打开的新标签页里读作已登出——用会话 Cookie |
| 为让 `check-solvable` 变绿而把派生账号印到公开页 | check-solvable 只匹配逐字字符串；打印凭据会泄露给每个访客（没有服务端鉴权）并让谜题失效。改用 `check-credentials.mjs` 证明 |
| 把一个登录拆成两个表单，好让每个都"一个身份" | 在第二个表单的标题里泄露设计意图，读起来像游戏 UI；一个框 + `data-grants` 承载矩阵（§2） |
| 公开页印出同事的登录名（名册里的 `账号：chen.gd`） | 只有初始账号可以印出；其他登录一律从线索推断（workflow/05 Q4 会扫描它） |
