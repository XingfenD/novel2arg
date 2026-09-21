# Alpine Component Reference Implementations

> Companion to `references/structure/base.md` (tree + skeleton). This file carries the copy-adaptable
> implementations: keyword hash build (§1), search (§2), gates (§3), staging (§4), skins (§5), progress (§6).
> Required reading at steps 6 and 7. Rule IDs `(Rn)` cite references/guardrails.md.

## 1. Keyword Hash Build (tools/build-keywords.mjs)

One plaintext source per layer, hashed to one table per layer (R3). The surface table is fetched by surface/platform pages and **must never contain a `pages/secret/` URL** (R8); the secret table is fetched only by secret-layer pages. A `title` is the catalog entry the archive would print (issuing body + document type + number/date) — never a summary of the document's content (R9). This is the website form's convention (references/structure/form-website.md); a system form keeps a single index and lets the account matrix decide what a hit opens (references/structure/form-system.md §1) — access is never maintained in the JSON (R10).

The canonical implementation ships as **`assets/tools/build-keywords.mjs`** (copy it to `tools/`). Its contract:

- Discovers every `data/keywords*.src.json` and writes the matching `data/keywords*.json` beside it, so both the per-layer convention (`keywords.surface.src.json` → `keywords.surface.json`) and a single-table project (`keywords.src.json` → `keywords.json`) work with no configuration.
- Keys support `|`-separated synonym aliases. Values are `"url|title"`; the url is relative to `pages/`.
- Normalizes with `String(w).trim().toLowerCase()` → md5 → base64. This **must be byte-identical** to `tools/hash.mjs` and to the in-page `hash()` helper from §2; if you ever switch to async WebCrypto SHA-256, change all three sides together.
- De-duplicates by url within a hash bucket, so two aliases that normalize to the same hash never list a page twice.

Example source shape:

```json
{
  "前台|营业时间": ["surface/news.html|焰溪镇供销社 营业时间公告"],
  "Margaret Holt": ["secret/s23-file.html|刑事侦查卷宗 087-J-03 · 询问笔录"]
}
```

At deployment, **do not ship the `.src.json` files** (add `data/*.src.json` to .gitignore or delete them after the build) (R3). `tools/check-links.mjs` also fails the deploy if a table whose name marks it as the surface index (`data/keywords.surface*.json`) carries a `secret/` url (R8).

## 2. Search Engine (`search` Component) — Three-State Feedback

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

**Layer scoping (required, R8).** The component queries the index of the layer whose page mounts it: surface and platform pages carry `data-index="data/keywords.surface.json"`; secret-layer pages carry `data-index="data/keywords.secret.json"`. A surface keyword routes to a surface or platform page, or to a gate — never straight into a secret document. If the container's fiction exposes classified entries in results (container D's archive list), each one either shows `[Access denied]` or resolves to its clearance gate; it never opens the document. Result titles are catalog entries, written the way the issuing body files the document (R9). System forms do not split indexes by layer; they keep one index and resolve each hit through the account matrix (references/structure/form-system.md §1, R10).

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

**New tabs vs. session state (required reading for system containers).** `target="_blank"` opens each result in a fresh tab, and a fresh tab gets a fresh `sessionStorage` — so a `data-access`-protected document opened this way reads as locked even though the player is "logged in" on the original tab. Any container that crosses an account login with new-tab results (container D's `query → results → archive` chain) must hold session state in a **session cookie** (shared across tabs, cleared when the browser closes), not per-tab `sessionStorage`; see §3 and `references/structure/form-system.md` §6. `check-solvable.mjs` models identities as one global set and cannot see per-tab isolation, so it reports green while the real browser fails — the step-8 cross-tab manual test is the only thing that catches this (tooling.md §3 item 7).

## 3. Password Gate (`gate` Component)

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
// data-access on the protected page, no privilege ladder (R10). The full pattern, the `access` component,
// and the RBAC rules live in references/structure/form-system.md.
//
// Cross-tab session store. Access state MUST survive a result opened in a new tab (target="_blank", §2);
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

`hash()` is the shared helper from §2. When designing a gate, enforce the **credential triad**: the account is hidden on page A, the password clue on page B (requiring inference: zodiac year → 1977, child-photo date → 20201125), and the gate on page C. Hashing keeps plaintext out of casual view in the source (R3).

A credential may be **derived/composite** — an account assembled from parts (pinyin initials + license-year), never printed whole. `check-solvable.mjs` only matches a value that appears *verbatim* in a readable page, so it cannot prove a derived credential solvable and will report the gate STUCK. **Never print the credential to turn it green** — that leaks it to every visitor (a static site has no server auth; client-side masking is not privacy, R12) and collapses the puzzle. Declare the value, its composition rule, and its public-page components in `data/credentials.src.json` and prove it with `tools/check-credentials.mjs` (parts + rule + zero-plaintext); prove reachability-given-the-credential with `tools/check-reachability.mjs`. See tooling.md §1 and §3.

Gate design rules:

- **Failure hints point at the source obliquely and stop (R4).** `密码错误 🎂` passes; anything naming a page,
  restating the derivation rule, or spelling the field's content fails. The hint is a copy slot, not an
  error string — a bare "error" is prohibited.
- **Inputs name the field only (R4).** `placeholder="Employee ID"` / `工号` / `就诊年份` pass; `placeholder="e.g. 1977"`
  leaks. The derivation rule stays off the gate page — posting the *account format* on a gate page is fine
  and realistic, but the password rule lives only in the source document's own copy.
- **Multi-field gates** (four-tuple / two-factor) are just several `data-expect-hash` inputs; all must match.
- **A gate page's own body is unreadable until the gate passes.** Do not park a clue inside the page's own
  `x-show="unlocked"` block and expect check-solvable to count it before unlock — that is exactly the
  boundary the check models.
- **Keep the entry page's honor agreement honest.** It may claim the source hides nothing only if the keyword
  tables and gate hashes really are hashed (R3); system containers keep the authenticated accounts in a
  **session cookie** (cross-tab, cleared when the browser closes — not per-tab `sessionStorage`, which a
  `target="_blank"` result leaves behind) and say exactly that — no unlock state or progress is persisted
  across sessions (references/structure/form-system.md §6).

The honor agreement on the entry page carries the rest.

## 4. Staging Components (Lifecycle-Managed)

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

## 5. Skin Switching (base.css Conventions)

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

## 6. Optional: Collection Progress (`progress` Component)

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
