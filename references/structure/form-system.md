# Form — System Fiction (Containers B/C/D)

When the container is a machine — desktop (B), simulated internet / intranet (C), archive system (D) — reach is
differentiated by **account login + per-account access** (R10), not by page links. Read
`references/structure/base.md` first; this file adds the system layer on top (gate / staging / reskin
components: `references/structure/components.md`; tools: `references/structure/tooling.md`). Select the M3
module only where the fiction really has identities and a login — reach follows the container.

## 1. Reach model — accounts, not levels (RBAC-style)

- A **login gate** authenticates one account: `data-grant="chen"` + `data-next="apps/mail.html"` on the
  component root. Success records the account in a **session cookie** (cross-tab, cleared when the browser
  closes) — not per-tab `sessionStorage`, which a `target="_blank"` result opens in a fresh tab and loses
  (`references/structure/components.md` §2–§3). One box may serve several roles via `data-grants` (§2).
- A **protected page or block** names the accounts allowed to read it: `data-access="chen"` (comma = any,
  `*` = any authenticated). It still opens with `x-show="unlocked"` so `check-solvable.mjs` can model the boundary.
- **No privilege ladder (R10).** A page opens only to the accounts it names; an admin account never inherits a
  colleague's private file. If the plot needs admin access to one, the page names it and the fiction justifies it.
- **Depth is crossed by search, a gate, or an account — never by a link (R7).** A shallow page carries no
  "related files / archives / pages" links into a deeper area (`workflow/04-reachability.md` audits this); each
  private document stays closed until its own account is found and used.
- **Accounts accumulate for the session** (deliberate simplification): authenticated once, available across
  tabs; closing the browser clears everything. Finding each account is itself a puzzle beat.
- **Accounts are inferred, not printed (R10).** Only the initial account may be printed; every other account is
  assembled from text clues (a name, a 工号, an entry year, a signature email) plus the gate's posted account
  format. A printed colleague login collapses the access matrix; `workflow/05-puzzle-audit.md` Q4 scans for it.
- **A derived account is proved by parts, never printed.** `check-solvable.mjs` only matches verbatim strings,
  so an assembled account reads STUCK — printing it to turn that green leaks it to every visitor (a static site
  has no server auth; client-side masking is not privacy). Declare value + rule + components in
  `data/credentials.src.json`; `check-credentials.mjs` and `check-reachability.mjs` prove it (`tooling.md` §3 item 6).

### Search / query results obey the access matrix

The retrieval system is another reach path, so it resolves through the same matrix — the keyword index is
**not** where access lives:

- One index per site (`data/keywords.json`); a system form has no per-layer JSON split.
- The target page enforces its own `data-access`: a document the session accounts may not read shows the locked
  notice / login link, never the document.
- A fiction list (archive results, mailbox rows) shows an unreadable entry as a plain locked notice or routes it
  to the login gate; it never links the document open.
- `check-solvable.mjs` models this: a search edge opens a protected document only after an account it names is
  authenticated (the keyword must have been read in a readable page first).

The website form keeps its per-audience tables (`references/structure/form-website.md`); here the account matrix
replaces them.

## 2. Login page (`gate` + `data-grant` / `data-grants`)

One login box, one identity per credential. `data-grant` is the flat list of identities the gate can grant — what
`check-solvable.mjs` walks. `data-grants` is a JSON map on the root resolving the *typed account* to its
identity, its own password hash(es), and an optional reskin token; the runtime pairs account with password per
entry, so `intern + handler-pw` is rejected. **Do not split one login into two forms to give the checker
"one form = one identity"** — the second form's title leaks the design intent and reads as game UI.

```html
<!-- Single box, two roles. data-grant = static list for the walk; data-grants = runtime account→identity map. -->
<main x-data="gate" data-grant="intern,handler" data-next="query.html" data-fail-hint="账号或密码有误"
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

The `gate` component reads `data-grants` first and falls back to `data-grant` (`references/structure/components.md` §3).
The credential triad still applies (account clue on page A, password clue on page B, gate on page C). The account
string is the identity other pages match against; it is printed nowhere except the initial account (§1).

## 3. Protected page (`access` component)

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

A page may be protected *and* gated (a vault): the gate form sits inside the locked part, so the walk
authenticates the account first, then solves the gate.

## 4. Per-container shells

- **B desktop**: `desk.html` (icon grid + Dock + menu bar); one page per app (`chat.html`, `mailbox.html`,
  `cloud-drive.html`…). The Spotlight `FILE_DATABASE` is plaintext JS, invisible to `check-solvable` — mirror
  its entries in a keyword table or verify by hand (`tooling.md` §3 item 2). The OS account is the login.
- **C simulated internet**: each site gets a top-level directory (`sites/forum/`, `sites/blog-2009/`…) with
  absolute cross-site links; the intranet login is the account system. Run the tools once per site root
  (`tooling.md` §3 item 5).
- **D archive system**: `query.html` (multi-field gate: name / ID / date) → `results.html` (catalog entries;
  unreadable rows show a plain locked notice or resolve to their login gate) → archive detail pages, each
  carrying `data-access`. Access is an account, never a rank.
- **A fake official website** may borrow this pattern for an intranet sub-area; its public pages follow
  `references/structure/form-website.md`.

## 5. Checker conventions (`assets/tools/`)

- Login gate: `data-grant` (+ `data-grants`) + `data-next`. `check-links.mjs` resolves `data-next` like a link;
  `check-solvable.mjs` follows it as the post-unlock edge and walks the flat `data-grant` list.
- Protected page/block: `data-access` + `x-show="unlocked"`. The block stays unreadable to the walk until an
  authenticated account is named; a `data-access` naming an account no gate grants is reported unreachable —
  a broken clue graph, not a checker error.
- A derived/composite account is outside the verbatim model: declare it in `data/credentials.src.json` and run
  `check-credentials.mjs` + `check-reachability.mjs`; never print it to make `check-solvable` green (§1).
- If the page root is not `pages/` (e.g. `apps/`), set `pagesDir` in `tools/config.mjs` (`tooling.md` §2). State
  held only in JS, or per-tab vs cross-tab session storage, is invisible to the checkers — model it with
  `data-grant` / `data-access` or verify by hand (`tooling.md` §3 items 1 and 7).

## 6. Session state

Access lives in a **session cookie** (cross-tab, cleared when the browser closes); nothing survives the session
and no progress is saved. Never `localStorage`, never per-tab `sessionStorage` behind a `target="_blank"`
result. An implementation requirement, not player-facing copy.

## 7. Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Numeric privilege ladder, or an admin account that opens everything (R10) | Not per-person access: private documents leak to the highest account and the login stops being a puzzle; workflow/04's access check calls it a defect |
| A shallow page's "related archives / files" link into a deep area (R7) | Crosses depth with a link; reach must go through search, a gate, or an account |
| `data-access` naming an account no gate grants | Dead private page; check-solvable reports it unreachable |
| Access state in `localStorage`, or in per-tab `sessionStorage` behind a `target="_blank"` result | localStorage breaks the session fiction; per-tab sessionStorage reads as logged out in the new tab the result opens — use a session cookie |
| Printing a derived account on a public page to make `check-solvable` green | check-solvable only matches verbatim strings; printing the credential leaks it to every visitor (no server auth) and collapses the puzzle. Prove it with `check-credentials.mjs` instead |
| Splitting one login into two forms so each is "one identity" | Leaks the design intent in the second form's title and reads as game UI; one box + `data-grants` carries the matrix (§2) |
| A public page prints a colleague's login (`账号：chen.gd` in the roster) | Only the initial account may be printed; every other login is inferred from clues (workflow/05 Q4 scans for it) |
