# 前端项目结构（多文件伪网站，禁止单 index.html）

> 零依赖纯静态：HTML + CSS + 原生 JS，唯一构建脚本是关键词哈希器（node，可选）。任意静态托管可跑（GitHub Pages 优先）。

## 1. 目录结构

```
<game-name>/
├── index.html                    # 入口仪式页：免责声明+角色赋予+规则+开始按钮
├── search.html                   # 搜索结果页（假官网容器的中枢；桌面/伪互联网容器改为 desk.html 或各站互链）
├── pages/
│   ├── surface/                  # 表层页（亮色皮肤，伪装用）
│   │   ├── home.html  menu.html  news.html ...
│   ├── platform/                 # 中层功能页（登录/帖子/系统页，可选）
│   │   ├── login.html  posts-01.html ...
│   ├── secret/                   # 里层页（暗色皮肤；文件名不可剧透，用编号或乱码）
│   │   ├── s19-record.html  s23-diary.html ...
│   └── endings/
│       ├── ending-a.html  ending-b.html
├── assets/
│   ├── css/
│   │   ├── base.css              # 共享：排版骨架、文档拟真四件套、进度页脚
│   │   ├── surface.css           # 表层皮肤（亮色/温馨/拟真）
│   │   ├── secret.css            # 里层皮肤（近黑+血红+手写体+留白揭示）
│   │   └── forbidden.css         # 禁忌态（搜索命中禁词时整页突变）
│   ├── js/
│   │   ├── search.js             # 搜索引擎：哈希查表+三态反馈
│   │   ├── gate.js               # 密码门/多字段凭证门通用逻辑
│   │   ├── staging.js            # 演出：倒计时黑屏、打字机、滚动揭示
│   │   └── progress.js           # 可选：localStorage 收集度存档
│   ├── img/  audio/  docs/       # 图片、音频谜题、可下载伪文档(pdf/xlsx)
├── data/
│   ├── keywords.src.json         # 明文关键词表（仅开发期存在，构建后不进部署目录）
│   ├── keywords.json             # 哈希表（部署产物，防看源码通关）
│   └── forbidden.json            # 禁词表（哈希+禁忌态文案）
├── tools/
│   ├── build-keywords.mjs        # 明文→sha256+base64 哈希表
│   └── check-links.mjs           # 死链检查
└── README.md                     # 运行方式 + GDD 链接 + 玩家须知
```

多站"伪互联网"容器：每个站一个顶层目录（或一个 GitHub 仓库），共用同一套 assets 约定，跨站用绝对 URL 硬链接；乱码目录名 = 天然防剧透锁。

## 2. 页面骨架模板（每页统一）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>〈表层标题〉</title>
  <link rel="stylesheet" href="../../assets/css/base.css">
  <link rel="stylesheet" href="../../assets/css/surface.css"><!-- secret/ 页换成 secret.css -->
</head>
<body data-page="14" data-total="36"><!-- 进度编号 -->
  <header><!-- 全站常驻同一搜索表单（表层世界拒绝你：正门入口 onclick 弹"暂停开放" -->
    <form id="search-form" action="/search.html" method="get">
      <input type="text" name="q" placeholder="搜索内容..."><button type="submit">搜索</button>
    </form>
  </header>
  <main><!-- 本页正文：一份"文档"。文案里埋下一页的关键词（专有名词加粗/入表格） --></main>
  <footer><small>© …… <span class="progress">14/36</span></small></footer>
  <!-- secret 页可加彩蛋：隐形链接、黑底选字、手抄红字（见 design-paradigms §4.5） -->
</body>
</html>
```

规则：secret/ 页页脚编号可用 `ex/36`、`?/36` 异常值；`[此内容已被删除]` 占位符是合法叙事元素。

## 3. 关键词哈希构建（tools/build-keywords.mjs）

```js
// 明文表 keywords.src.json: {"顾铭": ["secret/s23-file.html|顾铭的记录"], "花生糕|年糕": [...]}
// key 支持 | 分隔同义别名；value 为 "url|标题"。用法: node tools/build-keywords.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
const src = JSON.parse(readFileSync('data/keywords.src.json', 'utf8'));
const hash = w => createHash('md5').update(w.trim().toLowerCase()).digest('base64');
const out = {};
for (const [keys, results] of Object.entries(src))
  for (const k of keys.split('|'))
    (out[hash(k)] ??= []).push(...results.map(r => {
      const [url, title] = r.split('|'); return { url, title };
    }));
writeFileSync('data/keywords.json', JSON.stringify(out, null, 1));
```

部署时**不要把 keywords.src.json 带上**（.gitignore 或构建后删除）。

## 4. 搜索引擎（assets/js/search.js）——三态反馈

```js
// 与构建脚本同构：md5 用内联实现或 blueimp-md5 单文件；也可换 sha256(WebCrypto异步)
document.addEventListener('DOMContentLoaded', async () => {
  const q = new URLSearchParams(location.search).get('q')?.trim().toLowerCase();
  const box = document.getElementById('results');
  if (!q) return (box.textContent = '请输入搜索关键字。');
  const enc = btoa(String.fromCharCode(...window.md5(q).match(/../g).map(h => parseInt(h, 16))));
  const forbidden = await (await fetch('data/forbidden.json')).json();
  const hit = Object.values(forbidden).find(f => f.keywords.includes(enc));
  if (hit) {  // 态3：禁忌模式——整页换肤四重信号（背景/标题/logo/页脚）
    document.body.classList.add('body-forbidden');
    document.querySelector('.progress').textContent = 'ex/36';
    box.innerHTML = `<span class="${hit.hidden ? 'hidden-text' : 'visible-text'}">${hit.text}</span>`;
    return;   // .hidden-text{color:#000;background:#000} ::selection{color:#f00} → 划选才显形
  }
  const map = await (await fetch('data/keywords.json')).json();
  const results = map[enc] ?? [];
  box.innerHTML = results.length          // 态1：命中——新标签打开，保留"正常世界"
    ? `<p>共有 <b>${results.length}</b> 项结果：</p>` +
      results.map(r => `<a href="${r.url}" target="_blank">${r.title}</a>`).join('')
    : `<p>抱歉，没有找到与"<b>${q}</b>"相关的结果。</p>`;  // 态2：未命中——维持假面，不泄露游戏
});
```

桌面容器的 Spotlight 变体：明文 `FILE_DATABASE = {关键词: {file,label,color}}`，`onkeyup` 精确匹配，结果条目颜色=危险度分类。

## 5. 密码门（assets/js/gate.js）

```js
// 用法: <form data-gate data-user-hash="…" data-pass-hash="…" data-next="../secret/s22.html"
//             data-fail-hint="登录失败：密码错误🎂">   ← 失败提示必须带叙事暗示
export function bindGate(form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const [u, p] = [form.user.value, form.pass.value];
    const ok = hash(u) === form.dataset.userHash && hash(p) === form.dataset.passHash;
    if (ok) location.href = form.dataset.next;
    else {
      const msg = form.querySelector('.gate-error');
      msg.textContent = form.dataset.failHint;       // 内联红字，不用裸 alert
      form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], 300);
    }
  });
}
```

设计门时执行**凭证三要素**：账号藏在 A 页、密码线索藏在 B 页（需推理：本命年→1977、晒娃日期→20201125）、门在 C 页。多字段门（四元组/双因子）= 多个 hash 属性并列。哈希仅防"扫一眼源码就看见明文"，不做真加密——君子协定写在入口页。

## 6. 演出模块（assets/js/staging.js）

```js
export const countdownBlackout = (ms, text, then) => {  // "被系统发现"：解锁后延时黑屏
  const el = Object.assign(document.createElement('div'), { className: 'blackout' });
  document.body.append(el);
  setTimeout(() => { el.textContent = text; el.classList.add('show-text'); }, ms);
  if (then) setTimeout(then, ms + 5000);
};
export const typewriterRewrite = (el, newText, speed = 60) => { /* 逐字删除原文再重打，仪式感 */ };
export const revealOnScroll = sel => { /* IntersectionObserver 给 .reveal 加 .shown，控制阅读节奏 */ };
```

## 7. 皮肤切换（base.css 约定）

```css
/* 表层 */ body { background:#f9ebde; color:#555; }  a { color:#d15c20; }
/* 里层：secret/ 页直接 link secret.css */
body.secret { background:#1a1a1c; color:#9e9e9e; } body.secret h2 { color:#db1400; }
.handwrite { font-family:'LongCang',cursive; color:#d20a0a; }  /* 手抄红字 */
.spacer { height:180px; }                                        /* 留白即节奏 */
.hidden-text { background:#000; color:#000; user-select:text; }
.hidden-text::selection { color:#f00; background:#333; }         /* 黑底选字显形 */
.blurred { filter:blur(6px); user-select:none; }                 /* 打码即线索 */
```

## 8. 可选：收集度存档（assets/js/progress.js)

```js
// 三原作均无存档（进度在玩家脑中）。若要加：只记"访问过的页编号"，门保持单向不记录
const seen = JSON.parse(localStorage.getItem('seen') ?? '[]');
const n = document.body.dataset.page;
if (n && !seen.includes(n)) seen.push(n);
localStorage.setItem('seen', JSON.stringify(seen));
// 入口页可显示 收集度 seen.length + '/36'
```

## 9. 部署前自检

```bash
node tools/build-keywords.mjs          # 重新生成哈希表
node tools/check-links.mjs             # 遍历所有 href/src 对照文件树，报死链
grep -rn "keywords.src" --include=*.html .   # 确认明文表没被页面引用
# 人肉走查：按 GDD 页面图从 index.html 通关一遍，记录每个凭证的出处页
```
