# Front-End Base Structure (Shared Across Containers; a Single index.html Is Prohibited)

> Pure static, no build step: HTML + CSS + Alpine.js v3 core (vendored locally; no plugins, no runtime CDN). The Node tools are optional, dependency-free, and run on built-ins (§1, §10). Runs on any static host (GitHub Pages preferred).

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
│   ├── keywords.surface.src.json # Plaintext surface index (development only; excluded from the deploy directory after build)
│   ├── keywords.secret.src.json  # Plaintext secret index (development only; excluded from the deploy directory after build)
│   ├── keywords.surface.json     # Surface hash table — must contain no pages/secret/ URL (deploy artifact)
│   ├── keywords.secret.json      # Secret hash table, fetched only by secret-layer pages (deploy artifact)
│   ├── forbidden.json            # Forbidden word table (hashes + forbidden-state copy)
│   └── credentials.src.json      # Composite-credential provenance manifest (development only; plaintext values, excluded from deploy like the keyword .src tables)
├── tools/                        # copy these six from the skill's assets/tools/ at scaffold time
│   ├── hash.mjs                  # md5+base64 for a plaintext value → a gate's data-expect-hash
│   ├── build-keywords.mjs        # plaintext table(s) → hash table(s)
│   ├── check-links.mjs           # dead-link checker + surface-index layer-leak guard
│   ├── check-solvable.mjs        # cold-start solvability walk (reachable + solvable + search earned)
│   ├── check-credentials.mjs     # composite/derived credential provenance (parts + rule + zero-plaintext) — the half check-solvable cannot model
│   └── check-reachability.mjs    # rehearsal build: inject the credentials into a throwaway copy, then run check-solvable for reachability
└── README.md                     # How to run + GDD link + player notes
```

The six tools are shipped with this skill under `assets/tools/`; scaffold copies them into `tools/` so the
project stays self-contained and re-runnable. They run on Node built-ins only (`node:crypto`, `node:fs`,
`node:path`, `node:child_process`) — no dependencies, no install step. The keyword checkers auto-discover
the tables, so both the per-layer convention above and a single-table project work with zero configuration.
Re-run the checks before every deploy — see §9: `build-keywords` (when a table changes), `check-links`,
`check-solvable`, and — for any project with derived/composite credentials or a system container —
`check-credentials` plus `check-reachability`. Each checker keeps its project assumptions in a `CONFIG`
block at the top of the file; §10 lists the configurable knobs and the review steps no static checker can
replace.

Vendor the Alpine runtime once at scaffold time (the pinned version is in the URL; the file is then committed with the game):

```bash
mkdir -p assets/js/vendor
curl -o assets/js/vendor/alpine.min.js https://cdn.jsdelivr.net/npm/alpinejs@3.17.3/dist/cdn.min.js
```

The tree above is the shared base; the form docs adapt the hub and the page directories:

- **Container A — fake official website**: `references/structure/form-website.md` — search hub, layer-scoped indexes, gates as the only access.
- **Containers B/C/D — system fictions**: `references/structure/form-system.md` — account login, per-account access (RBAC-style), and the desktop / simulated-internet / archive shells. A system project's page root may be `apps/` instead of `pages/`; set `pagesDir` in the CONFIG of `check-links.mjs` and `check-solvable.mjs` (§10).

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

One plaintext source per layer, hashed to one table per layer. The surface table is fetched by surface/platform pages and **must never contain a `pages/secret/` URL**; the secret table is fetched only by secret-layer pages. A `title` is the catalog entry the archive would print (issuing body + document type + number/date) — never a summary of the document's content. This is the website form's convention (references/structure/form-website.md); a system form keeps a single index and lets the account matrix decide what a hit opens (references/structure/form-system.md §1) — access is never maintained in the JSON.

The canonical implementation ships as **`assets/tools/build-keywords.mjs`** (copy it to `tools/`). Its contract:

- Discovers every `data/keywords*.src.json` and writes the matching `data/keywords*.json` beside it, so both the per-layer convention (`keywords.surface.src.json` → `keywords.surface.json`) and a single-table project (`keywords.src.json` → `keywords.json`) work with no configuration.
- Keys support `|`-separated synonym aliases. Values are `"url|title"`; the url is relative to `pages/`.
- Normalizes with `String(w).trim().toLowerCase()` → md5 → base64. This **must be byte-identical** to `tools/hash.mjs` and to the in-page `hash()` helper from §4; if you ever switch to async WebCrypto SHA-256, change all three sides together.
- De-duplicates by url within a hash bucket, so two aliases that normalize to the same hash never list a page twice.

Example source shape:

```json
{
  "前台|营业时间": ["surface/news.html|焰溪镇供销社 营业时间公告"],
  "Margaret Holt": ["secret/s23-file.html|刑事侦查卷宗 087-J-03 · 询问笔录"]
}
```

At deployment, **do not ship the `.src.json` files** (add `data/*.src.json` to .gitignore or delete them after the build). `tools/check-links.mjs` also fails the deploy if a table whose name marks it as the surface index (`data/keywords.surface*.json`) carries a `secret/` url.

## 4. Search Engine (`search` Component) — Three-State Feedback

Registered in `components.js`; mounted by search.html as `<main x-data="search" data-index="data/keywords.surface.json">` (secret-layer search pages point `data-index` at the secret table).

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

    const map = await (await fetch(this.$el.dataset.index)).json();
    this.results = map[enc] ?? [];
    this.state = this.results.length ? 'hit' : 'miss';
  },
}));
```

**Layer scoping (required).** The component queries the index of the layer whose page mounts it: surface and platform pages carry `data-index="data/keywords.surface.json"`; secret-layer pages carry `data-index="data/keywords.secret.json"`. A surface keyword routes to a surface or platform page, or to a gate — never straight into a secret document. If the container's fiction exposes classified entries in results (container D's archive list), each one either shows `[Access denied]` or resolves to its clearance gate; it never opens the document. Result titles are catalog entries, written the way the issuing body files the document. System forms do not split indexes by layer; they keep one index and resolve each hit through the account matrix (references/structure/form-system.md §1).

```html
<!-- search.html (a secret-layer search page carries data/keywords.secret.json instead) -->
<main id="results" x-data="search" data-index="data/keywords.surface.json" x-cloak>
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

System containers replace this search hub with their own shells — desktop Spotlight `FILE_DATABASE`, the archive query form, cross-site links; see `references/structure/form-system.md` §4.

**New tabs vs. session state (required reading for system containers).** `target="_blank"` opens each result in a fresh tab, and a fresh tab gets a fresh `sessionStorage` — so a `data-access`-protected document opened this way reads as locked even though the player is "logged in" on the original tab. Any container that crosses an account login with new-tab results (container D's `query → results → archive` chain) must hold session state in a **session cookie** (shared across tabs, cleared when the browser closes), not per-tab `sessionStorage`; see §5 and `references/structure/form-system.md` §6. `check-solvable.mjs` models identities as one global set and cannot see per-tab isolation, so it reports green while the real browser fails — the step-8 cross-tab manual test is the only thing that catches this.

## 5. Password Gate (`gate` Component)

One component, three shapes. `data-expect-hash` sits on **each `<input>`** (comma-separated values = synonyms
accepted for that field, so a Chinese name and its pinyin both open the same lock); the rest of the
configuration sits on the **component root** (`<main>`), not on the `<form>`.

```js
// Shape A — navigate away on success:
// <main x-data="gate" data-next="../secret/s22.html" data-fail-hint="Login failed 🎂">
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
// Shape B — unlock in place, no navigation. The post-gate block MUST open with x-show="unlocked"
// (or <template x-if="unlocked">): tools/check-solvable.mjs keys on that marker to know which text
// is readable before the gate and which only becomes readable after it.
// <main x-data="gate" data-success-text="Decrypting…" data-success-hold="2400">
//   <div class="blackout" x-show="busy" x-text="successText" x-cloak x-transition></div>
//   <div class="sheet narrow" x-show="!unlocked"> …the form above… </div>
//   <div x-show="unlocked" x-cloak> …the guarded document… </div>
// </main>
//
// Shape C — session login + per-account access (system containers B/C/D): data-grant on the login gate,
// data-access on the protected page, no privilege ladder. The full pattern, the `access` component, and
// the RBAC rules live in references/structure/form-system.md.
//
// Cross-tab session store. Access state MUST survive a result opened in a new tab (target="_blank", §4);
// per-tab sessionStorage does not, so hold it in a session cookie (no max-age/expires → cleared when the
// browser closes, matching the "signed out after this session" honor agreement). sessionStorage is the
// fallback for private mode where cookies are blocked. Rename ACCESS_KEY per project.
const ACCESS_KEY = 'access', SKIN_KEY = 'skin';
const session = {
  _read(key) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    if (m) { try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { /* fall through */ } }
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; }
  },
  _write(key, val) {
    const v = encodeURIComponent(JSON.stringify(val));
    document.cookie = `${key}=${v}; path=/; SameSite=Lax`;            // session cookie: deliberately no expiry
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  },
  access() { return this._read(ACCESS_KEY) || []; },
  grant(ids) { this._write(ACCESS_KEY, [...new Set([...this.access(), ...ids])]); },
  reskin(name) { if (name) this._write(SKIN_KEY, name); },            // optional: a skin token secret/system pages apply
  skin() { return this._read(SKIN_KEY); },
};
Alpine.data('gate', () => ({
  error: '', busy: false, unlocked: false, successText: '', _t: null,
  init() { this.successText = this.$el.dataset.successText || ''; },
  submit() {
    const el = this.$root;          // data-* live on the component root; the submit event's target is the <form>
    const inputs = Array.from(el.querySelectorAll('input[data-expect-hash]'));
    // Single-box multi-identity (Shape C). data-grants is a JSON map on the root:
    //   { "<account-hash>": { "id": "intern", "pw": ["<pw-hash>", …], "reskin": "secret" }, … }
    // It resolves WHICH identity the typed account grants and validates the password against that identity,
    // so one login box can serve several roles without splitting into several forms on the page. data-grant
    // stays on the root as the flat list of identities check-solvable walks; data-grants is the runtime truth.
    let ok, grantIds = [];
    if (el.dataset.grants) {
      const map = JSON.parse(el.dataset.grants);
      const acc = inputs.find((i) => i.type !== 'password');
      const pw = inputs.find((i) => i.type === 'password');
      const entry = acc ? map[hash(acc.value || '')] : null;
      ok = !!entry && (!pw || (entry.pw || []).includes(hash(pw.value || '')));   // account+password are paired
      if (ok) { grantIds = entry.id ? [entry.id] : []; session.reskin(entry.reskin); }
    } else {
      // Legacy / multi-field gates: every data-expect-hash input must match; data-grant is unconditional.
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
    this.error = el.dataset.failHint || 'Verification failed.';   // inline red text; a bare alert breaks the facade
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
                { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], 320);
  },
  destroy() { clearTimeout(this._t); },
}));
```

`hash()` is the shared helper from §4. When designing a gate, enforce the **credential triad**: the account is hidden on page A, the password clue on page B (requiring inference: zodiac year → 1977, child-photo date → 20201125), and the gate on page C. Hashing keeps plaintext out of casual view in the source.

A credential may be **derived/composite** — an account assembled from parts (pinyin initials + license-year), never printed whole. `check-solvable.mjs` only matches a value that appears *verbatim* in a readable page, so it cannot prove a derived credential solvable and will report the gate STUCK. **Never print the credential to turn it green** — that leaks it to every visitor (a static site has no server auth; client-side masking is not privacy) and collapses the puzzle. Declare the value, its composition rule, and its public-page components in `data/credentials.src.json` and prove it with `tools/check-credentials.mjs` (parts + rule + zero-plaintext); prove reachability-given-the-credential with `tools/check-reachability.mjs`. See §9–§10 and `references/structure/form-system.md` §1.

Gate design rules:

- **Failure hints point at the source obliquely and stop.** `密码错误 🎂` passes; anything naming a page,
  restating the derivation rule, or spelling the field's content fails. The hint is a copy slot, not an
  error string — a bare "error" is prohibited.
- **Inputs name the field only.** `placeholder="Employee ID"` / `工号` / `就诊年份` pass; `placeholder="e.g. 1977"`
  leaks. The derivation rule stays off the gate page — posting the *account format* on a gate page is fine
  and realistic, but the password rule lives only in the source document's own copy.
- **Multi-field gates** (four-tuple / two-factor) are just several `data-expect-hash` inputs; all must match.
- **A gate page's own body is unreadable until the gate passes.** Do not park a clue inside the page's own
  `x-show="unlocked"` block and expect check-solvable to count it before unlock — that is exactly the
  boundary the check models.
- **Keep the entry page's honor agreement honest.** It may claim the source hides nothing only if the keyword
  tables and gate hashes really are hashed; system containers keep the authenticated accounts in a **session
  cookie** (cross-tab, cleared when the browser closes — not per-tab `sessionStorage`, which a `target="_blank"`
  result leaves behind) and say exactly that — no unlock state or progress is persisted across sessions
  (references/structure/form-system.md §6).

The honor agreement on the entry page carries the rest.

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
// page numbers; gates stay one-way and untracked, and a system container's authenticated accounts live in a
// session cookie, never localStorage (references/structure/form-system.md §6). Mount on the shared footer so
// it runs on every page.
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
node tools/build-keywords.mjs          # regenerate the hash table(s)
node tools/check-links.mjs             # walk all href/src/action/data-next against the file tree; report dead links + layer leaks
node tools/check-solvable.mjs          # cold-start walk: expect "fixpoint in N round(s) · gates 4/4 unlocked · pages 28/28 reachable"
node tools/check-credentials.mjs       # composite/derived credentials: parts + rule + zero-plaintext (run whenever data/credentials.src.json exists)
node tools/check-reachability.mjs      # rehearsal build: inject the credentials into a throwaway copy, then prove gates unlock + pages reachable
grep -rn "keywords.*src\|credentials.*src" --include=*.html .   # confirm no page references a plaintext source table
grep -o '"secret/[^"]*"' data/keywords.surface.json   # must return nothing: the surface index never carries a secret URL
grep -rL "alpine.min.js" --include=*.html .  # list pages missing the vendored Alpine runtime
grep -rn "placeholder=" --include=*.html .    # every value names its field; none states or restates an answer
grep -rn "gate-hint\|data-fail-hint" --include=*.html .   # hints point at the source obliquely; no page names, no rules
# Asset manifest: every asset the GDD §0.1 declares (emblem / seals / scans / photos / mock docs) exists under
#   assets/ AND is referenced by at least one page. check-links only resolves an <img src> that was written;
#   a declared-but-never-landed asset has no src to resolve, so reconcile the GDD list by hand:
#   for each declared asset, grep -rn "<asset-filename>" --include=*.html . must return ≥1 hit, and the file must exist.
# Chrome sweep: load every page at desktop and phone width; console errors 0, requestfailed 0 (incl. every <img>), no horizontal overflow
# Cross-tab session (system containers): log in, open a search/result link (target="_blank") in the new tab —
#   the protected document must be unlocked there too; close the browser, reopen — signed out. Per-tab
#   sessionStorage fails this; a session cookie passes (check-solvable cannot see the difference — §10).
# Register check: read each pages/surface/ and pages/platform/ page as a document of that organization —
#   no line addresses the player, mentions the plot, or hints at a credential
# Link provenance: every <a> under pages/ resolves to nav / index / sitemap / footer / related document
# Manual walkthrough: play through index.html following the GDD page map; record the source page for every credential
# Console check: the entry page and one secret page show zero errors and zero 404s (Alpine runtime included)
```

`check-solvable.mjs` automates the credential-provenance half of the manual walkthrough **for verbatim credentials**, so the manual pass only has to judge tone and pacing. It exits non-zero when a clue is deleted, a password changes, a clue is misplaced inside a page's own post-unlock block, or a listing entry is cut — run it after every content edit, not just before deploy. It reads gate configuration through the conventions in §5 (`data-expect-hash` on each input, post-gate block opening with `x-show="unlocked"` or `<template x-if="unlocked">`, search mounted by `x-data="search"`); a project that renames those markers edits the `CONFIG` block at the top of the script (§10), and `node tools/check-solvable.mjs --self-test` re-checks the matcher after an edit. A **derived/composite** credential is outside its model: `check-credentials.mjs` proves it assembles from public parts and stays zero-plaintext, and `check-reachability.mjs` proves the graph still unlocks once it is known (§10).

## 10. Tool Interface — Configurable Knobs and What Stays Manual

The tools are written to an interface, not to one book. Each checker carries its assumptions in a `CONFIG`
block at the top of the file; a project that renames directories, layer names, or markers edits CONFIG
instead of rewriting the checker (a rewrite throws away the defects these checks were built from).

| CONFIG knob | Default | Used by |
|---|---|---|
| `dataDir` / `pagesDir` | `data` / `pages` | check-links, check-solvable |
| `surfaceTable` / `secretUrl` | `/surface/i` on the filename / `secret/` prefix | check-links |
| `entry` | `index.html` | check-solvable, check-reachability |
| `gateHashAttr` / `indexAttr` | `data-expect-hash` / `data-index` | check-solvable, check-credentials |
| `grantAttr` / `accessAttr` / `nextAttr` | `data-grant` / `data-access` / `data-next` | check-solvable (system-form accounts) |
| `unlockMarkers` / `unlockEnd` | `x-show="unlocked"` … `</main>` | check-solvable, check-reachability |
| `searchMount` | `x-data="search"` | check-solvable |
| `maxTokenLen` / `maxPhraseWords` / `maxPhraseLen` | 8 / 4 / 48 | check-solvable matcher |
| `credTable` | `data/credentials.src.json` | check-credentials, check-reachability |
| `derivedKinds` / `zeroPlaintextKinds` | `['account','secret']` / `['account']` | check-credentials |
| `skipDirs` | `.git node_modules docs tools deploy` | check-credentials |
| `solver` | `tools/check-solvable.mjs` | check-reachability |

`node tools/check-solvable.mjs --self-test` verifies the matcher (multi-word, long-word, HTML entity, CJK)
after a CONFIG edit.

Things no static checker can see. Each has a manual method or a companion tool; skipping it is the leak path:

1. **Runtime bindings** — `:href`, `x-bind`, DOM assembled in JS. Both link checkers resolve static `href`,
   static `<form action>`, and gate `data-next` targets only. The manual method is the keyword tables:
   search-result routes live there, and `data-index` tells the checker which table a search page can
   reach. Session login state is the same boundary: model it as `data-grant` / `data-access`
   (references/structure/form-system.md §5) so the walk sees the accounts, or verify by hand.
2. **Hubs that are their own database** — container B's plaintext `FILE_DATABASE` in desk.html, and
   container C's absolute cross-site links, expose no keyword table and no static href. Manual method:
   treat the hub as a listing page in the step-4 reachability walk, then click every entry once during the
   step-8 chrome sweep.
3. **Un-skippability** — check-solvable proves a gate is solvable, never that it is unavoidable. The manual
   method is layer scoping: per-layer keyword tables, per-layer `data-index`, and check-links' leak guard.
4. **Hash normalization is a three-way contract** — the in-page helper, `hash.mjs`, and `build-keywords.mjs`
   must agree byte-for-byte (`trim().toLowerCase()` → md5 → base64); `check-credentials.mjs` is a fourth
   side of the same contract. Switching algorithms means editing all of them in one change, then grepping
   the tree for tables generated under the old rule.
5. **Multi-site layouts** — container C gives each site its own root or repo. Run the tools once per root;
   absolute cross-site urls are skipped by design, so the cross-site graph stays a step-4 artifact.
6. **Derived / composite credentials** — check-solvable matches a value only when it appears *verbatim* in a
   readable page, so an account assembled from parts (pinyin initials + license-year) reads as STUCK. The
   fix is **not** to print it (that leaks it to every visitor and kills the puzzle); it is
   `check-credentials.mjs` (parts + rule + zero-plaintext over `data/credentials.src.json`) plus
   `check-reachability.mjs` (a rehearsal copy with the values injected, proving the graph still unlocks).
7. **Per-tab session vs. new-tab results** — check-solvable models authenticated identities as one global
   set, so it cannot see that `sessionStorage` is per-tab while search results open `target="_blank"` in a
   fresh tab. It reports green while the real browser shows the protected document locked. The manual method
   is the step-8 cross-tab test; the structural fix is a session cookie (§4–§5,
   references/structure/form-system.md §6).
8. **Element-level permission masking** — a checker reads page *text*, not computed visibility. A credential
   or answer hidden only by `x-show` / a CSS class / an element-level `data-access` mask is still in the HTML
   sent to every visitor; on a static site with no server auth, client-side masking is not privacy. Treat
   anything so masked as public: the step-8 chrome leak scan and `check-credentials`' zero-plaintext
   assertion are what catch it.
9. **GDD-declared assets that were never landed** — check-links resolves an `<img src>` only if the tag was
   written; a emblem/seal/scan/photo/mock-doc the GDD §0.1 lists but no page references has no src to
   resolve, so neither checker complains. The manual method is the §9 asset-manifest reconciliation: every
   declared asset exists under `assets/` and is referenced by at least one page.

The matcher reads *page text*, not the DOM, for the same reason the player does: it proves a string was
readable before the gate. A clue hidden in a `placeholder`, `title`, or JS string is invisible to both the
player and the checker — the step-8 chrome leak scan covers that class.
