# Front-End Project Structure (Multi-Page Fake Website; a Single index.html Is Prohibited)

> Pure static, no build step: HTML + CSS + Alpine.js v3 core (vendored locally; no plugins, no runtime CDN). The only tool is the keyword hasher (Node, optional). Runs on any static host (GitHub Pages preferred).

## 1. Directory Structure

```
<game-name>/
├── index.html                    # Entry ritual page: disclaimer + role assignment + rules + start button
├── search.html                   # Search results page (hub for container A; for desktop / simulated-internet containers, replace with desk.html or cross-site links)
├── pages/
│   ├── surface/                  # Surface pages (light skin, for the facade)
│   │   ├── home.html  menu.html  news.html ...
│   ├── platform/                 # Mid-layer functional pages (login / posts / system pages; optional)
│   │   ├── login.html  posts-01.html ...
│   ├── secret/                   # Secret pages (dark skin; filenames must not spoil — use numbers or scrambled names)
│   │   ├── s19-record.html  s23-diary.html ...
│   └── endings/
│       ├── ending-a.html  ending-b.html
├── assets/
│   ├── css/
│   │   ├── base.css              # Shared: layout skeleton, document realism kit, progress footer, x-cloak
│   │   ├── surface.css           # Surface skin (light / warm / realistic)
│   │   ├── secret.css            # Secret skin (near-black + blood red + handwriting + whitespace reveals)
│   │   └── forbidden.css         # Forbidden state (full-page shift when a forbidden keyword is searched)
│   ├── js/
│   │   ├── components.js         # Alpine components (search / gate / staging / progress), registered on alpine:init
│   │   └── vendor/
│   │       └── alpine.min.js     # Alpine v3 core, pinned (vendored once; never edited; no plugins)
│   ├── img/  audio/  docs/       # Images, audio puzzles, downloadable mock documents (pdf/xlsx)
├── data/
│   ├── keywords.src.json         # Plaintext keyword table (development only; excluded from the deploy directory after build)
│   ├── keywords.json             # Hash table (deploy artifact; prevents winning by reading source)
│   └── forbidden.json            # Forbidden word table (hashes + forbidden-state copy)
├── tools/
│   ├── build-keywords.mjs        # Plaintext → sha256+base64 hash table
│   └── check-links.mjs           # Dead-link checker
└── README.md                     # How to run + GDD link + player notes
```

Vendor the Alpine runtime once at scaffold time (the pinned version is in the URL; the file is then committed with the game):

```bash
mkdir -p assets/js/vendor
curl -o assets/js/vendor/alpine.min.js https://cdn.jsdelivr.net/npm/alpinejs@3.17.3/dist/cdn.min.js
```

The above is the standard structure for container A (fake official website). Other containers replace only the "hub" part; the pages/assets/data conventions stay the same:

**Container B — fake computer desktop**: replace `search.html` with `desk.html` (desktop: icon grid + Dock + top menu bar); change `pages/surface/` to `pages/apps/` (one page per "app": chat.html, mailbox.html, cloud-drive.html…, each replicating the desktop wallpaper and menu bar to create the "same computer, popup window" feel); the hub is a plaintext `FILE_DATABASE` inlined in desk.html (keyword → app page mapping; see the Spotlight variant at the end of §4); in-game time is frozen to the same day on every page.

**Container C — simulated internet**: each "website" gets a top-level directory (or its own GitHub repo), sharing the same assets conventions; cross-site navigation uses absolute URL hard links; scrambled directory names serve as a natural anti-spoiler lock. Requires parallel entries under `sites/`: forum/, blog-2009/…blog-2015/, archive-machine/ (fake Wayback Machine: URL whitelist validation, the `gate` component suffices), intranet/, etc.

**Container D — archive system**: replace `search.html` with `query.html` (multi-field query form: name / ID / date, validated by the `gate` component with multiple hash attributes) → `pages/results.html` (archive list: ID + classification + title; unauthorized entries show `[Access denied]`) → `pages/archive/` (one page per case file; clearance levels = different password gates). Skin: government-intranet style — fixed 850px width, gray-blue #003366, serif type, footer "Technical support: Information Systems Division"; the secret layer is classified files switching to secret.css.

## 2. Page Skeleton Template (uniform across pages)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>&lt;Surface page title&gt;</title>
  <link rel="stylesheet" href="../../assets/css/base.css">
  <link rel="stylesheet" href="../../assets/css/surface.css"><!-- secret/ pages link secret.css instead -->
  <script defer src="../../assets/js/components.js"></script><!-- registers Alpine components on alpine:init; runs before the Alpine runtime -->
  <script defer src="../../assets/js/vendor/alpine.min.js"></script><!-- vendored Alpine v3 core; auto-starts and fires alpine:init -->
</head>
<body data-page="14" data-total="36"><!-- progress number -->
  <header><!-- site-wide persistent search form (the surface world rejects you: front-door onclick pops "Temporarily closed") -->
    <form id="search-form" action="/search.html" method="get">
      <input type="text" name="q" placeholder="Search..."><button type="submit">Search</button>
    </form>
  </header>
  <main><!-- page body: one "document". Bury keywords for the next page in the copy (bold proper nouns / place them in tables) --></main>
  <footer><small>© ... <span class="progress">14/36</span></small></footer>
  <!-- secret pages may add easter eggs: invisible links, black-on-black selectable text, hand-copied red text (see design-paradigms §4.5) -->
</body>
</html>
```

Rules: **persistent top bar** — every page's header (same for container B's top menu bar) is fixed to the top of the viewport and does not leave view on long pages (base.css gives `position: sticky; top: 0` + an opaque background site-wide; secret/ pages included); the header carries that organization's own nav links (nav bar / index / sitemap), which together with the search box and the footer's own links are the only cross-page links a public page carries; every `<input>` placeholder names its field (`Search...`, `Employee ID`); every page loads the same two scripts in the same order (`components.js` before the Alpine runtime) and carries no inline behavior wiring — behavior lives in `x-data` components; secret/ page footers may use anomalous numbers such as `ex/36` or `?/36`; the `[This content has been deleted]` placeholder is a valid narrative element.

## 3. Keyword Hash Build (tools/build-keywords.mjs)

```js
// Plaintext table keywords.src.json: {"Margaret Holt": ["secret/s23-file.html|Margaret Holt's Record"], "walnut cake|pastry": [...]}
// Keys support | separated synonym aliases; values are "url|title". Usage: node tools/build-keywords.mjs
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

At deployment, **do not ship keywords.src.json** (add it to .gitignore or delete it after the build).

## 4. Search Engine (`search` Component) — Three-State Feedback

Registered in `components.js`; mounted by search.html as `<main x-data="search">`.

```js
// Shared hash helper — must mirror tools/build-keywords.mjs exactly (same trim/lowercase normalization,
// same md5 + base64 output). md5 comes from an implementation inlined above this helper or from a vendored
// vendor/md5.min.js loaded before components.js; switching both sides to async WebCrypto sha256 is also an option.
const hash = w => btoa(String.fromCharCode(...window.md5(w.trim().toLowerCase()).match(/../g).map(h => parseInt(h, 16))));

Alpine.data('search', () => ({
  q: '',
  state: 'empty',            // empty | forbidden | hit | miss
  results: [],
  forbidden: null,

  async init() {             // Alpine lifecycle: runs before the component renders
    this.q = new URLSearchParams(location.search).get('q')?.trim().toLowerCase() ?? '';
    if (!this.q) return;
    const enc = hash(this.q);

    const forbiddenTable = await (await fetch('data/forbidden.json')).json();
    const hit = Object.values(forbiddenTable).find(f => f.keywords.includes(enc));
    if (hit) {               // State 3: forbidden — full-page reskin (background/title/logo/footer)
      this.forbidden = hit;
      this.state = 'forbidden';
      document.body.classList.add('body-forbidden');
      document.querySelector('.progress').textContent = 'ex/36';
      return;
    }

    const map = await (await fetch('data/keywords.json')).json();
    this.results = map[enc] ?? [];
    this.state = this.results.length ? 'hit' : 'miss';
  },
}));
```

```html
<!-- search.html -->
<main id="results" x-data="search" x-cloak>
  <template x-if="state === 'forbidden'">
    <span :class="forbidden.hidden ? 'hidden-text' : 'visible-text'" x-text="forbidden.text"></span>
    <!-- .hidden-text{color:#000;background:#000} ::selection{color:#f00} → visible only when selected -->
  </template>
  <template x-if="state === 'hit'">
    <div>
      <p><b x-text="results.length"></b> results found:</p>
      <template x-for="r in results" :key="r.url">
        <a :href="r.url" target="_blank" x-text="r.title"></a><!-- new tab preserves the "normal world" -->
      </template>
    </div>
  </template>
  <template x-if="state === 'miss'"><p>Sorry, no results for "<b x-text="q"></b>".</p></template>
  <template x-if="state === 'empty'"><p>Enter a search keyword.</p></template>
</main>
```

Desktop-container Spotlight variant: a `desk` component keeps a plaintext `FILE_DATABASE = {keyword: {file, label, color}}`, matches on `@keyup` against `x-model` state, and renders each result with its danger-classification color.

## 5. Password Gate (`gate` Component)

```js
// Usage:
// <form x-data="gate" @submit.prevent="submit" data-user-hash="…" data-pass-hash="…"
//       data-next="../secret/s22.html" data-fail-hint="Login failed: wrong password 🎂">
//   <input name="user" x-model="user"> <input name="pass" type="password" x-model="pass">
//   <p class="gate-error" x-show="error" x-text="error"></p>
//   <button type="submit">Sign in</button>
// </form>                                   ← failure hints must carry narrative clues
Alpine.data('gate', () => ({
  user: '', pass: '', error: '',
  submit() {
    const el = this.$el;
    const ok = hash(this.user) === el.dataset.userHash && hash(this.pass) === el.dataset.passHash;
    if (ok) return void (location.href = el.dataset.next);
    this.error = el.dataset.failHint;      // inline red text; a bare alert breaks the facade
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], 300);
  },
}));
```

`hash()` is the shared helper from §4. When designing a gate, enforce the **credential triad**: the account is hidden on page A, the password clue on page B (requiring inference: zodiac year → 1977, child-photo date → 20201125), and the gate on page C. Multi-field gates (four-tuple / two-factor) = multiple hash attributes in parallel. Hashing keeps plaintext out of casual view in the source. The honor agreement on the entry page carries the rest.

## 6. Staging Components (Lifecycle-Managed)

All timers and observers are registered in `init()` and released in `destroy()`, so staged effects survive or die with their component.

```js
// "The system has noticed you": delayed blackout after unlock; optional `next` navigates on 5s later
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

// Delete the element's original text character by character, then retype newText — ceremonial effect
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

// Scroll reveal: IntersectionObserver owned by the component, controlling reading pace
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

## 7. Skin Switching (base.css Conventions)

```css
/* Top bar: fixed to the viewport top, does not scroll with the page; background must be opaque so body text does not show through */
header { position:sticky; top:0; z-index:10; background:inherit; }
[x-cloak] { display:none !important; }                           /* hide Alpine components until they initialize */
/* Surface */ body { background:#f9ebde; color:#555; }  a { color:#d15c20; }
/* Secret: secret/ pages link secret.css directly */
body.secret { background:#1a1a1c; color:#9e9e9e; } body.secret h2 { color:#db1400; }
.handwrite { font-family:'Caveat',cursive; color:#d20a0a; }      /* hand-copied red text */
.spacer { height:180px; }                                        /* whitespace as pacing */
.hidden-text { background:#000; color:#000; user-select:text; }
.hidden-text::selection { color:#f00; background:#333; }         /* black-on-black text revealed by selection */
.blurred { filter:blur(6px); user-select:none; }                 /* redaction is itself a clue */
```

## 8. Optional: Collection Progress (`progress` Component)

```js
// This paradigm has no save by default (progress lives in the player's head). If added: record only visited
// page numbers; gates stay one-way and untracked. Mount on the shared footer so it runs on every page.
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

## 9. Pre-Deployment Self-Check

```bash
node tools/build-keywords.mjs          # regenerate the hash table
node tools/check-links.mjs             # walk all href/src against the file tree; report dead links
grep -rn "keywords.src" --include=*.html .   # confirm no page references the plaintext table
grep -rL "alpine.min.js" --include=*.html .  # list pages missing the vendored Alpine runtime
grep -rn "placeholder=" --include=*.html .    # every value names its field; none states or restates an answer
# Register check: read each pages/surface/ and pages/platform/ page as a document of that organization —
#   no line addresses the player, mentions the plot, or hints at a credential
# Link provenance: every <a> under pages/ resolves to nav / index / sitemap / footer / related document
# Manual walkthrough: play through index.html following the GDD page map; record the source page for every credential
# Console check: the entry page and one secret page show zero errors and zero 404s (Alpine runtime included)
```
