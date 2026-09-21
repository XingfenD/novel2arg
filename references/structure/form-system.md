# Form — System Fiction (Containers B/C/D)

When the container is a machine — a computer desktop (B), a simulated internet / intranet (C), an archive
system (D) — the player is inside a system, and reach is differentiated by **account login + per-account
access**, not by page links. Read `references/structure/base.md` first; this file adds the system layer
on top of the shared base (tree, page skeleton, gate component, staging, skins, tools).

## 1. Reach model — accounts, not levels (RBAC-style)

- A **login gate** authenticates one account: `data-grant="chen"` + `data-next="apps/mail.html"` on the
  component root. Success records the account in a **session cookie** (cross-tab, cleared when the browser
  closes) — not per-tab `sessionStorage`, which a `target="_blank"` result opens in a fresh tab and loses
  (references/structure/base.md §4–§5). One login box may serve several roles through `data-grants` (§2).
- A **protected page or block** names the accounts allowed to read it: `data-access="chen"` (comma = any of
  them, `*` = any authenticated account). The block still opens with `x-show="unlocked"` so
  `tools/check-solvable.mjs` can model the boundary.
- **No privilege ladder.** A page opens only to the accounts it names; an admin account never inherits a
  colleague's private file. If the plot needs admin access to one, the page names it
  (`data-access="chen,admin"`) and the fiction justifies it.
- **Depth is crossed by search, a gate, or an account — never by a link.** A shallow page must not carry
  "related files / related archives / related pages" links into a deeper layer; workflow/04-reachability.md
  audits this. Each person's private document stays closed until their own account is found and used.
- **Accounts accumulate for the session** (a deliberate player-friendly simplification): once authenticated, an
  account stays available across tabs — no sign-out, no cross-session persistence. Closing the browser clears
  everything. Because results open `target="_blank"`, the state lives in a session cookie, not per-tab
  `sessionStorage`. Finding each account is itself a puzzle beat, so the roster of identities is part of the clue graph.
- **Accounts are inferred, not printed.** A publicly readable page carries no login string except the initial
  account — the one the player starts with. Every other account is a puzzle beat: the player assembles it
  from text clues (a name, a 工号, an entry year, an email in a signature) plus the account format the gate
  posts. A roster column or notice printing a colleague's login collapses the access matrix into one page of
  reading; workflow/05 Q4 scans for it.
- **A derived account is proved by parts, never by printing it.** `check-solvable.mjs` matches a credential
  only when its full string appears *verbatim* in a readable page, so an assembled account (pinyin initials +
  license-year) reads as STUCK there. Printing it to turn that check green leaks it to every visitor — a
  static site has no server auth, and client-side masking (`x-show`, a CSS class) is not privacy. Declare the
  value, its rule, and its public-page components in `data/credentials.src.json`; `check-credentials.mjs`
  proves it assembles and stays zero-plaintext, and `check-reachability.mjs` proves the graph unlocks once it
  is known (references/structure/base.md §5, §9–§10).

### Search / query results obey the access matrix

The retrieval system is just another reach path, so it resolves through the same matrix — and the keyword
index is **not** where access lives:

- One index per site (`data/keywords.json`), not one table per narrative layer: a system form has no
  "surface vs secret" JSON split to maintain.
- The target page enforces its own `data-access`: landing on a document the session accounts may not read
  shows the locked notice / login link, never the document.
- A fiction list (archive results, mailbox rows) may mark unreadable entries `[Access denied]` or route
  them to the login gate; it never links the document open.
- `tools/check-solvable.mjs` models this: a search edge opens a protected document only after an account it
  names is authenticated (the keyword must still have been read in a readable page first).

The website form keeps its per-layer tables (`references/structure/form-website.md`); in a system form the account
matrix replaces them.

## 2. Login page (`gate` + `data-grant` / `data-grants`)

One login box, one identity per credential. `data-grant` is the flat list of identities the gate can grant —
it is what `check-solvable.mjs` walks. When a single box serves several roles (an intern account and a
case-handler account on one portal), `data-grants` is a JSON map on the root that resolves the *typed account*
to its identity, its own password hash(es), and an optional reskin token; the runtime pairs account with
password per entry, so `intern + handler-pw` is rejected. **Do not split one login into two forms on the page
to give the checker "one form = one identity"** — that leaks the design intent in the second form's title and
reads as game UI. Keep one box; let `data-grants` carry the matrix.

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

The `gate` component reads `data-grants` first and falls back to `data-grant` when it is absent
(references/structure/base.md §5). The credential triad still applies (account clue on page A, password clue
on page B, gate on page C). The account string in `data-grant` / the `data-grants` keys is the identity other
pages match against; it is printed nowhere except the initial account (§1), and a derived account is proved
by `check-credentials.mjs`, not by printing it.

## 3. Protected page (`access` component)

```html
<main x-data="access" data-access="chen">
  <div x-show="!unlocked">请先登录。</div>
  <div x-show="unlocked" x-cloak>…chen 的私人文件与后续链接…</div>
</main>
```

```js
// Reads the cross-tab session cookie set by the gate (base.md §5 `session` helper), falling back to
// sessionStorage in private mode. A protected document opened in a new tab (target="_blank") must still
// unlock — per-tab sessionStorage would not, which is exactly the defect this avoids.
Alpine.data('access', () => ({
  unlocked: false,
  init() {
    const held = session.access();          // base.md §5 helper: cookie-first, sessionStorage fallback
    const need = (this.$el.dataset.access || '').split(',').map((s) => s.trim()).filter(Boolean);
    this.unlocked = need.some((r) => (r === '*' ? held.length > 0 : held.includes(r)));
    const skin = session.skin();            // optional reskin token granted at login
    if (skin) document.body.classList.add(skin);
  },
}));
```

A page may be protected *and* gated (a vault): the gate form sits inside the locked part, so the walk
authenticates the account first, then solves the gate.

## 4. Per-container shells

- **B desktop**: `desk.html` (icon grid + Dock + top menu bar); one page per app (`chat.html`,
  `mailbox.html`, `cloud-drive.html`…), each replicating the wallpaper and menu bar. The Spotlight
  `FILE_DATABASE` is plaintext JS, invisible to `check-solvable` — mirror its entries in a keyword table or
  verify the search edges by hand (§10 item 2). The OS account is the login.
- **C simulated internet**: each site gets a top-level directory (`sites/forum/`, `sites/blog-2009/`…) with
  absolute cross-site links; the intranet login is the account system. Run the tools once per site root
  (§10 item 5).
- **D archive system**: `query.html` (multi-field gate: name / ID / date) → `pages/results.html` (catalog
  entries; unauthorized rows show `[Access denied]` or resolve to their clearance gate) → `pages/archive/`
  detail pages, each carrying `data-access` for the accounts allowed to open it. "Clearance" is an account,
  never a number.
- **A fake official website** may borrow this pattern for an intranet sub-area; its public pages follow
  `references/structure/form-website.md`.

## 5. Checker conventions (`assets/tools/`)

- Login gate: `data-grant` (+ `data-grants` for a single-box multi-role login) + `data-next`. `check-links.mjs`
  resolves `data-next` like a link; `check-solvable.mjs` follows it as the post-unlock edge and walks the flat
  `data-grant` list.
- Protected page/block: `data-access` + `x-show="unlocked"`. The block's text and links stay unreadable to
  the walk until an authenticated account is named; the walk prints `· accounts chen` when any were used.
- A page whose `data-access` names an account that no login gate ever grants is reported stuck/unreachable
  — that is a broken clue graph, not a checker error.
- A **derived/composite** account is outside `check-solvable`'s verbatim model: declare it in
  `data/credentials.src.json` and run `check-credentials.mjs` (parts + rule + zero-plaintext) plus
  `check-reachability.mjs` (rehearsal copy with the values injected). Never print the account to make
  `check-solvable` green (§1).
- If the page root is not `pages/` (e.g. `apps/`), set `pagesDir` in the checkers' CONFIG; they warn when
  the directory is missing.
- State held only in JS with no attribute stays invisible to the checkers — model it with `data-grant` /
  `data-access` or verify manually (§10 item 1). Per-tab vs cross-tab session storage is likewise invisible
  to `check-solvable` (it models identities as one global set): verify the new-tab unlock by hand (§10 item 7).

## 6. Honor agreement

State the truth: access lives in a **session cookie**, shared across the tabs the player opens and cleared
when the browser closes; nothing survives the session and no progress is saved. Never use `localStorage` for
access state, and never per-tab `sessionStorage` where a result opens `target="_blank"` (the new tab would
read as logged out). The entry page's wording must match what the code stores (workflow/08 greps for it).

## 7. Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Numeric clearance ladder ("level 3 reads levels 1–2") | A ladder is not per-person access: every private document leaks to the highest account, and the login stops being a puzzle |
| An admin / root account that opens everything | Same leak; the fiction rarely supports it, and workflow/04's tier check calls it a defect |
| A shallow page's "related archives / files" link into a deep layer | Crosses depth with a link; reach must go through search, a gate, or an account |
| `data-access` naming an account no gate grants | Dead private page; check-solvable reports it unreachable |
| Access state in `localStorage`, or in per-tab `sessionStorage` behind a `target="_blank"` result | localStorage breaks the honor agreement and the session fiction; per-tab sessionStorage reads as logged out in the new tab the result opens — use a session cookie |
| Printing a derived account on a public page to make `check-solvable` green | check-solvable only matches verbatim strings; printing the credential leaks it to every visitor (no server auth) and collapses the puzzle. Prove it with `check-credentials.mjs` instead |
| Splitting one login into two forms so each is "one identity" | Leaks the design intent in the second form's title and reads as game UI; one box + `data-grants` carries the matrix (§2) |
| A public page prints a colleague's login (`账号：chen.gd` in the roster) | Only the initial account may be printed; every other login is inferred from clues (workflow/05 Q4 scans for it) |
