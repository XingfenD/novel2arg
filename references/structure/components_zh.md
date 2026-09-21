> 中文译本，供审阅用；与 `references/structure/components.md` 不一致时以英文原文为准。

# Alpine 组件参考实现

> `references/structure/base_zh.md`（目录树 + 骨架）的配套文件。为选定模块提供可复制改造的
> 实现：关键词哈希构建（§1）、搜索 M1（§2）、密码门 M2（§3）、分阶段演出 M12（§4）、
> 换肤 M5（§5）、进度 M7（§6）。步骤 6 与 7 的必读。规则编号 `(Rn)` 引用 references/guardrails_zh.md。

## 1. 关键词哈希构建（tools/build-keywords.mjs）

每个受众一份明文源，哈希成每个受众一张表（R3）。公开表由公开页获取，
**绝不得包含受限区域 URL**（默认 `internal/`；R8）；深层表只由深层页获取。`title` 是档案机构
会印出的目录条目（发布主体 + 文件类型 + 编号/日期）——绝不是文件内容的概括（R9）。这是网站
形态的约定（references/structure/form-website_zh.md）；系统形态保持单一索引，让账号矩阵决定命中
打开什么（references/structure/form-system_zh.md §1）——访问控制永不维护在 JSON 里（R10）。

权威实现随附为 **`assets/tools/build-keywords.mjs`**（把它复制到 `tools/`）。它的契约：

- 发现每个 `data/keywords*.src.json` 并在旁边写出匹配的 `data/keywords*.json`，因此按层约定
  （`keywords.surface.src.json` → `keywords.surface.json`）与单表项目（`keywords.src.json` →
  `keywords.json`）都零配置可用。
- 键支持 `|` 分隔的同义别名。值为 `"url|title"`；url 相对于 `pages/`。
- 用 `String(w).trim().toLowerCase()` → md5 → base64 归一化。这**必须逐字节等同于**
  `tools/hash.mjs` 与 §2 的页面内 `hash()` 辅助函数；如果你改用异步 WebCrypto SHA-256，
  三处必须一起改。
- 在哈希桶内按 url 去重，因此归一化到同一哈希的两个别名不会让页面出现两次。

源文件形状示例：

```json
{
  "前台|营业时间": ["news.html|焰溪镇供销社 营业时间公告"],
  "Margaret Holt": ["internal/s23-file.html|刑事侦查卷宗 087-J-03 · 询问笔录"]
}
```

部署时**不要随包发布 `.src.json` 文件**（把 `data/*.src.json` 加进 .gitignore，或构建后删除）（R3）。
如果一张名字标记为公开索引的表（`data/keywords.surface*.json`）携带受限区域 url（默认 `internal/`；
R8），`tools/check-links.mjs` 也会让部署失败。

## 2. 搜索引擎（`search` 组件）—— 三态反馈

在 `components.js` 中注册；由 search.html 以 `<main x-data="search" data-index="data/keywords.surface.json">`
挂载（深层页搜索把 `data-index` 指向深层表）。

```js
// 共享哈希辅助函数——必须与 tools/build-keywords.mjs 完全一致（同样的 trim/lowercase 归一化，
// 同样的 md5 + base64 输出）。md5 来自此辅助函数上方内联的实现，或来自在 components.js 之前
// 加载的 vendor/md5.min.js；把两侧一起换成异步 WebCrypto sha256 也是一种选择。
const hash = w => btoa(String.fromCharCode(...window.md5(w.trim().toLowerCase()).match(/../g).map(h => parseInt(h, 16))));

Alpine.data('search', () => ({
  q: '',
  state: 'empty',            // empty | forbidden | hit | miss
  results: [],
  forbidden: null,

  async init() {             // Alpine 生命周期：在组件渲染之前运行
    this.q = new URLSearchParams(location.search).get('q')?.trim().toLowerCase() ?? '';
    if (!this.q) return;
    const enc = hash(this.q);

    const forbiddenTable = await (await fetch('data/forbidden.json')).json();
    const hit = Object.values(forbiddenTable).find(f => f.keywords.includes(enc));
    if (hit) {               // 状态 3：禁词——整页换肤（背景/标题/徽标/页脚）
      this.forbidden = hit;
      this.state = 'forbidden';
      document.body.classList.add('body-forbidden');
      document.querySelector('.progress').textContent = 'ex/36';
      return;
    }

    const map = await (await fetch(this.$el.dataset.index)).json();
    this.results = map[enc] ?? [];
    this.state = this.results.length ? 'hit' : 'miss';
  },
}));
```

**按层分范围（搜索模块拆分索引时必需，R8）。** 组件查询挂载它的页面对应受众的索引：
公开页携带 `data-index="data/keywords.surface.json"`；深层页携带 `data-index="data/keywords.secret.json"`。
公开关键词路由到公开页或某个门——绝不直入受限文件。当虚构列出访客打不开的条目（容器 D 的
档案列表）时，每条显示一条朴素的未开放提示或落到它的门；绝不打开文件。结果标题是目录条目，
按发布主体归档文件的方式书写（R9）。系统形态不按受众拆索引；它们保持单一索引，让每次命中
经账号矩阵解析（`references/structure/form-system_zh.md` §1，R10）。

```html
<!-- search.html（深层页搜索改为携带 data/keywords.secret.json） -->
<main id="results" x-data="search" data-index="data/keywords.surface.json" x-cloak>
  <template x-if="state === 'forbidden'">
    <span :class="forbidden.hidden ? 'hidden-text' : 'visible-text'" x-text="forbidden.text"></span>
    <!-- .hidden-text{color:#000;background:#000} ::selection{color:#f00} → 仅选中时可见 -->
  </template>
  <template x-if="state === 'hit'">
    <div>
      <p><b x-text="results.length"></b> results found:</p>
      <template x-for="r in results" :key="r.url">
        <a :href="r.url" target="_blank" x-text="r.title"></a><!-- 新标签页保住"正常世界" -->
      </template>
    </div>
  </template>
  <template x-if="state === 'miss'"><p>Sorry, no results for "<b x-text="q"></b>".</p></template>
  <template x-if="state === 'empty'"><p>Enter a search keyword.</p></template>
</main>
```

系统容器用它们自己的外壳替换这个搜索中枢——桌面 Spotlight 的 `FILE_DATABASE`、档案查询表单、
跨站链接；见 `references/structure/form-system_zh.md` §4。

**新标签页 vs. 会话状态（系统容器的必读）。** `target="_blank"` 把每个结果开进新标签页，
而新标签页拿到全新的 `sessionStorage`——因此以这种方式打开的 `data-access` 保护文件，即使玩家
在原标签页"已登录"，也会读作已锁。任何把账号登录与新标签页结果交叉的容器（容器 D 的
`query → results → archive` 链）必须把会话状态放在**会话 Cookie**（跨标签页共享，浏览器关闭
即清除），而不是按标签页的 `sessionStorage`；见 §3 与 `references/structure/form-system_zh.md` §6。
`check-solvable.mjs` 把身份建模为一个全局集合，看不到按标签页隔离，因此浏览器已失败时它仍报绿——
步骤 8 的跨标签页人工测试是唯一能抓住它的东西（tooling.md §3 第 7 项）。

## 3. 密码门（`gate` 组件）

一个组件，三种形状。`data-expect-hash` 挂在**每个 `<input>`** 上（逗号分隔的值 = 该字段接受的
同义词，因此中文姓名与其拼音都能开同一把锁）；其余配置挂在**组件根**（`<main>`）上，
而不是 `<form>` 上。

```js
// 形状 A —— 成功后跳转：
// <main x-data="gate" data-next="../internal/s22.html" data-fail-hint="Login failed 🎂">
//   <form class="gate" @submit.prevent="submit">
//     <label for="u">Account</label>
//     <input id="u" type="text" placeholder="Employee ID" data-expect-hash="…">
//     <label for="p">Password</label>
//     <input id="p" type="password" placeholder="Password" data-expect-hash="…">
//     <p class="gate-error" x-show="error" x-text="error" x-cloak></p>
//     <button class="btn" type="submit">Sign in</button>
//   </form>
// </main>
//
// 形状 B —— 就地解锁，不跳转。解锁后的区块必须以 x-show="unlocked" 开头
//（或 <template x-if="unlocked">）：tools/check-solvable.mjs 以此为标记，判断哪些文字
// 在门前可读、哪些只在门后可读。
// <main x-data="gate" data-success-text="Decrypting…" data-success-hold="2400">
//   <div class="blackout" x-show="busy" x-text="successText" x-cloak x-transition></div>
//   <div class="sheet narrow" x-show="!unlocked"> …上面那个表单… </div>
//   <div x-show="unlocked" x-cloak> …被守护的文件… </div>
// </main>
//
// 形状 C —— 会话登录 + 按账号授权（系统容器 B/C/D）：登录门上的 data-grant，
// 受保护页面上的 data-access，没有权限阶梯（R10）。完整模式、`access` 组件
// 与 RBAC 规则见 references/structure/form-system_zh.md。
//
// 跨标签页会话存储。访问状态必须挺过在新标签页打开的结果（target="_blank"，§2）；
// 按标签页的 sessionStorage 挺不过，所以放进会话 Cookie（无 max-age/expires → 浏览器关闭即清除）。
// 隐私模式下 Cookie 被禁时回退 sessionStorage。每个项目改名 ACCESS_KEY。
const ACCESS_KEY = 'access', SKIN_KEY = 'skin';
const session = {
  _read(key) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    if (m) { try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { /* fall through */ } }
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; }
  },
  _write(key, val) {
    const v = encodeURIComponent(JSON.stringify(val));
    document.cookie = `${key}=${v}; path=/; SameSite=Lax`;            // 会话 Cookie：刻意不设过期时间
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 隐私模式 */ }
  },
  access() { return this._read(ACCESS_KEY) || []; },
  grant(ids) { this._write(ACCESS_KEY, [...new Set([...this.access(), ...ids])]); },
  reskin(name) { if (name) this._write(SKIN_KEY, name); },            // 可选：深层页应用的换肤令牌
  skin() { return this._read(SKIN_KEY); },
};
Alpine.data('gate', () => ({
  error: '', busy: false, unlocked: false, successText: '', _t: null,
  init() { this.successText = this.$el.dataset.successText || ''; },
  submit() {
    const el = this.$root;          // data-* 在组件根上；submit 事件的 target 是 <form>
    const inputs = Array.from(el.querySelectorAll('input[data-expect-hash]'));
    // 单框多身份（形状 C）。data-grants 是根上的 JSON 映射：
    //   { "<account-hash>": { "id": "intern", "pw": ["<pw-hash>", …], "reskin": "secret" }, … }
    // 它解析输入的账号授予哪个身份，并对照该身份校验密码，
    // 因此一个登录框可以服务多个角色，而不必在页面上拆成几个表单。data-grant
    // 仍留在根上，作为 check-solvable 遍历的身份平铺列表；data-grants 是运行时事实。
    let ok, grantIds = [];
    if (el.dataset.grants) {
      const map = JSON.parse(el.dataset.grants);
      const acc = inputs.find((i) => i.type !== 'password');
      const pw = inputs.find((i) => i.type === 'password');
      const entry = acc ? map[hash(acc.value || '')] : null;
      ok = !!entry && (!pw || (entry.pw || []).includes(hash(pw.value || '')));   // 账号与密码成对
      if (ok) { grantIds = entry.id ? [entry.id] : []; session.reskin(entry.reskin); }
    } else {
      // 旧式 / 多字段门：每个 data-expect-hash 输入都必须匹配；data-grant 无条件生效。
      ok = inputs.length > 0 && inputs.every((inp) => {
        const expects = (inp.dataset.expectHash || '').split(',').map((s) => s.trim()).filter(Boolean);
        return expects.includes(hash(inp.value || ''));
      });
      grantIds = (el.dataset.grant || '').split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (ok) {
      if (grantIds.length) session.grant(grantIds);
      const next = el.dataset.next;
      const hold = parseInt(el.dataset.successHold || '0', 10);
      const staged = this.successText && hold > 0;
      const finish = () => { if (next) location.href = next; else { this.busy = false; this.unlocked = true; } };
      if (staged) { this.busy = true; this._t = setTimeout(finish, hold); } else finish();
      return;
    }
    this.error = el.dataset.failHint || 'Verification failed.';   // 行内红字；裸 alert 会破坏伪装
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
                { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], 320);
  },
  destroy() { clearTimeout(this._t); },
}));
```

`hash()` 是 §2 的共享辅助函数。设计一道门时，执行**凭据三要素**：账号藏在 A 页，密码线索在
B 页（需要推断：生肖年 → 1977，孩子照片日期 → 20201125），门在 C 页。哈希让明文不进入源码的
随意见处（R3）。

凭据可以是**派生 / 组合**的——账号由部件拼装（拼音首字母 + 车牌年份），从不整串印出。
`check-solvable.mjs` 只匹配在可读页面中*逐字*出现的值，因此无法证明派生凭据可解，会把该门
报为 STUCK。**绝不要为了把它变绿而打印凭据**——那会泄露给每个访客（静态站点没有服务端鉴权；
客户端遮蔽不是隐私，R12），并让谜题崩塌。在 `data/credentials.src.json` 里声明值、拼装规则与
公开页部件，并用 `tools/check-credentials.mjs`（部件 + 规则 + 零明文）证明它；用
`tools/check-reachability.mjs` 证明"已知凭据则可达"。见 tooling.md §1 与 §3。

门的设计规则：

- **失败提示含蓄地指向来源并就此打住（R4）。** `密码错误 🎂` 通过；点名页面、复述推导、把字段内容拼出来都不通过；光秃秃一句"错误"被禁止。
- **输入只命名字段（R4）。** `placeholder="Employee ID"` / `工号` 通过；`placeholder="e.g. 1977"` 泄露。推导规则不上门页面；*账号格式*可以贴在那里。
- **多字段门**是多个 `data-expect-hash` 输入；必须全部匹配。门页面自己的正文在门通过前不可读——线索停在它自己的 `x-show="unlocked"` 区块里，解锁前不计入，正是检查所建模的边界。
- **会话状态是技术，不是文案。** 账号住在**会话 Cookie**（跨标签页，浏览器关闭即清除；绝不在 `target="_blank"` 结果背后用按标签页的 `sessionStorage`），且站点不向玩家解释其存储（`references/structure/form-system_zh.md` §6）。

## 4. 分阶段组件（生命周期托管）

所有定时器与观察者都在 `init()` 中注册、在 `destroy()` 中释放，因此分阶段效果随组件存活或消亡。

```js
// "系统已经注意到你"：解锁后的延迟黑屏；可选的 `next` 在 5 秒后跳转
Alpine.data('blackout', (delay = 3000, text = '', next = null) => ({
  visible: false, text, showTimer: null, exitTimer: null,
  init() {
    this.showTimer = setTimeout(() => {
      this.visible = true;
      if (next) this.exitTimer = setTimeout(() => (location.href = next), 5000);
    }, delay);
  },
  destroy() { clearTimeout(this.showTimer); clearTimeout(this.exitTimer); },
}));
// <div class="blackout" x-data="blackout(4000, 'The system has noticed you')" x-show="visible" x-transition x-cloak x-text="text"></div>

// 逐字删除元素原有文字，再逐字打出 newText——仪式感效果
Alpine.data('typewriter', (newText, speed = 60) => ({
  output: '', timer: null,
  init() {
    const original = this.$el.textContent;
    let i = original.length;
    this.output = original;
    this.timer = setInterval(() => {
      this.output = original.slice(0, --i);
      if (i > 0) return;
      clearInterval(this.timer);
      let j = 0;
      this.timer = setInterval(() => {
        this.output = newText.slice(0, ++j);
        if (j >= newText.length) clearInterval(this.timer);
      }, speed);
    }, speed);
  },
  destroy() { clearInterval(this.timer); },
}));
// <p x-data="typewriter('Access granted. Do not look back.')" x-text="output"></p>

// 滚动揭示：组件自有的 IntersectionObserver，控制阅读节奏
Alpine.data('reveal', () => ({
  shown: false, observer: null,
  init() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      this.shown = true;
      this.observer.disconnect();
    });
    this.observer.observe(this.$el);
  },
  destroy() { this.observer?.disconnect(); },
}));
// <div class="reveal" :class="{ shown }" x-data="reveal">…</div>  .reveal{opacity:0;transition:opacity .6s}.reveal.shown{opacity:1}
```

## 5. 可选：图层换肤（M5；base.css 约定）

```css
/* 顶栏：固定在视口顶部，不随页面滚动；背景必须不透明，正文才不会透出来 */
header { position:sticky; top:0; z-index:10; background:inherit; }
[x-cloak] { display:none !important; }                           /* Alpine 组件初始化前隐藏 */
/* 表层 */ body { background:#f9ebde; color:#555; }  a { color:#d15c20; }
/* M5 深层皮肤：深层页直接引用 secret.css */
body.secret { background:#1a1a1c; color:#9e9e9e; } body.secret h2 { color:#db1400; }
.handwrite { font-family:'Caveat',cursive; color:#d20a0a; }      /* 手抄红字 */
.spacer { height:180px; }                                        /* 留白即节奏 */
.hidden-text { background:#000; color:#000; user-select:text; }
.hidden-text::selection { color:#f00; background:#333; }         /* 选中才显的黑底黑字 */
.blurred { filter:blur(6px); user-select:none; }                 /* 遮挡本身就是线索 */
```

## 6. 可选：收集进度（`progress` 组件）

```js
// 本范式默认没有存档（进度住在玩家脑子里）。若要添加：只记录访问过的页码；
// 门保持单向且不追踪，系统容器的已认证账号住在会话 Cookie，绝不用 localStorage
// （references/structure/form-system_zh.md §6）。挂在共享页脚上，让它每页都运行。
Alpine.data('progress', () => ({
  seen: [],
  init() {
    this.seen = JSON.parse(localStorage.getItem('seen') ?? '[]');
    const n = document.body.dataset.page;
    if (n && !this.seen.includes(n)) this.seen.push(n);
    localStorage.setItem('seen', JSON.stringify(this.seen));
  },
}));
// <footer x-data="progress"><small>© ... <span x-text="seen.length"></span>/36</small></footer>
```
