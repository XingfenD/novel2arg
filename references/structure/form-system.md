# Form — System Fiction (Containers B/C/D)

When the container is a machine — a computer desktop (B), a simulated internet / intranet (C), an archive
system (D) — the player is inside a system, and reach is differentiated by **account login + per-account
access**, not by page links. Read `references/structure/base.md` first; this file adds the system layer
on top of the shared base (tree, page skeleton, gate component, staging, skins, tools).

## 1. Reach model — accounts, not levels (RBAC-style)

- A **login gate** authenticates one account: `data-grant="chen"` + `data-next="apps/mail.html"` on the
  component root. Success records the account in `sessionStorage` for this tab only.
- A **protected page or block** names the accounts allowed to read it: `data-access="chen"` (comma = any of
  them, `*` = any authenticated account). The block still opens with `x-show="unlocked"` so
  `tools/check-solvable.mjs` can model the boundary.
- **No privilege ladder.** A page opens only to the accounts it names; an admin account never inherits a
  colleague's private file. If the plot needs admin access to one, the page names it
  (`data-access="chen,admin"`) and the fiction justifies it.
- **Depth is crossed by search, a gate, or an account — never by a link.** A shallow page must not carry
  "related files / related archives / related pages" links into a deeper layer; workflow/04-reachability.md
  audits this. Each person's private document stays closed until their own account is found and used.
- **Accounts accumulate in the tab** (a deliberate player-friendly simplification): once authenticated, an
  account stays available — no sign-out, no cross-visit persistence. Closing the tab clears everything.
  Finding each account is itself a puzzle beat, so the roster of identities is part of the clue graph.

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

## 2. Login page (`gate` + `data-grant`)

```html
<main x-data="gate" data-grant="chen" data-next="apps/mail.html" data-fail-hint="密码错误">
  <form class="gate" @submit.prevent="submit">
    <label for="u">账号</label><input id="u" type="text" placeholder="工号" data-expect-hash="…">
    <label for="p">密码</label><input id="p" type="password" placeholder="密码" data-expect-hash="…">
    <p class="gate-error" x-show="error" x-text="error" x-cloak></p>
    <button type="submit">登录</button>
  </form>
</main>
```

The credential triad still applies (account clue on page A, password clue on page B, gate on page C). The
account string in `data-grant` is the identity other pages will match against; it is not printed anywhere.

## 3. Protected page (`access` component)

```html
<main x-data="access" data-access="chen">
  <div x-show="!unlocked">请先登录。</div>
  <div x-show="unlocked" x-cloak>…chen 的私人文件与后续链接…</div>
</main>
```

```js
Alpine.data('access', () => ({
  unlocked: false,
  init() {
    const held = JSON.parse(sessionStorage.getItem('access') || '[]');
    const need = (this.$el.dataset.access || '').split(',').map((s) => s.trim()).filter(Boolean);
    this.unlocked = need.some((r) => (r === '*' ? held.length > 0 : held.includes(r)));
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

- Login gate: `data-grant` + `data-next`. `check-links.mjs` resolves `data-next` like a link;
  `check-solvable.mjs` follows it as the post-unlock edge.
- Protected page/block: `data-access` + `x-show="unlocked"`. The block's text and links stay unreadable to
  the walk until an authenticated account is named; the walk prints `· accounts chen` when any were used.
- A page whose `data-access` names an account that no login gate ever grants is reported stuck/unreachable
  — that is a broken clue graph, not a checker error.
- If the page root is not `pages/` (e.g. `apps/`), set `pagesDir` in both checkers' CONFIG; they warn when
  the directory is missing.
- State held only in JS with no attribute stays invisible to both checkers — model it with `data-grant` /
  `data-access` or verify manually (§10 item 1).

## 6. Honor agreement

State the truth: access lives in `sessionStorage` for this tab and disappears when it closes; nothing is
persisted and no progress is saved. Never use `localStorage` for access state.

## 7. Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Numeric clearance ladder ("level 3 reads levels 1–2") | A ladder is not per-person access: every private document leaks to the highest account, and the login stops being a puzzle |
| An admin / root account that opens everything | Same leak; the fiction rarely supports it, and workflow/04's tier check calls it a defect |
| A shallow page's "related archives / files" link into a deep layer | Crosses depth with a link; reach must go through search, a gate, or an account |
| `data-access` naming an account no gate grants | Dead private page; check-solvable reports it unreachable |
| Access state in `localStorage` | Breaks the honor agreement and the session fiction |
