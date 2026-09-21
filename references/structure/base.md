# Front-End Base Structure (Shared Across Containers; a Single index.html Is Prohibited)

> Pure static, no build step: HTML + CSS + Alpine.js v3 core (vendored locally; no plugins, no runtime CDN). The Node tools are optional, dependency-free, and run on built-ins. Runs on any static host (GitHub Pages preferred).
>
> This file covers the directory tree (§1) and the page skeleton (§2). The Alpine component reference
> implementations (search / gate / staging / skins / progress) live in `references/structure/components.md`;
> the check cadence, the shared tool CONFIG, and the manual methods live in `references/structure/tooling.md`.

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
│   │       └── alpine.min.js     # Alpine v3 core, pinned (vendored once via tools/vendor-alpine.mjs; never edited; no plugins)
│   ├── img/  audio/  docs/       # Images, audio puzzles, downloadable mock documents (pdf/xlsx)
├── data/
│   ├── keywords.surface.src.json # Plaintext surface index (development only; excluded from the deploy directory after build)
│   ├── keywords.secret.src.json  # Plaintext secret index (development only; excluded from the deploy directory after build)
│   ├── keywords.surface.json     # Surface hash table — must contain no pages/secret/ URL (deploy artifact)
│   ├── keywords.secret.json      # Secret hash table, fetched only by secret-layer pages (deploy artifact)
│   └── forbidden.json            # Forbidden word table (hashes + forbidden-state copy)
├── tools/                        # copy these six from the skill's assets/tools/ at scaffold time
│   ├── config.mjs                # shared project conventions — the single file to edit for a renamed project
│   ├── hash.mjs                  # md5+base64 for a plaintext value → a gate's data-expect-hash
│   ├── build-keywords.mjs        # plaintext table(s) → hash table(s)
│   ├── check-links.mjs           # dead-link checker + surface-index layer-leak guard
│   ├── check-solvable.mjs        # cold-start solvability walk (reachable + solvable + search earned)
│   └── vendor-alpine.mjs         # downloads the pinned Alpine runtime and verifies its sha256
└── README.md                     # How to run + GDD link + player notes
```

The tools ship with this skill under `assets/tools/`; scaffold copies them into `tools/` so the project stays
self-contained and re-runnable. They run on Node built-ins only (`node:crypto`, `node:fs`, `node:path`) — no
dependencies, no install step. Both checkers import their assumptions from the shared `tools/config.mjs`
(edit that one file when the project renames directories or markers; references/structure/tooling.md §2
lists the knobs and references/structure/tooling.md §3 the manual methods that remain). The keyword tables are auto-discovered, so both the
per-layer convention above and a single-table project work with zero configuration. Re-run the checks after
every content edit, not just before deploy — the canonical pass/fail checklist is `workflow/08-self-check.md`.

Vendor the Alpine runtime once at scaffold time (the script pins the version and verifies the sha256 before writing the file, which is then committed with the game):

```bash
node tools/vendor-alpine.mjs      # writes assets/js/vendor/alpine.min.js (alpinejs@3.17.3, checksum-verified)
```

The tree above is the shared base; the form docs adapt the hub and the page directories:

- **Container A — fake official website**: `references/structure/form-website.md` — search hub, layer-scoped indexes, gates as the only access.
- **Containers B/C/D — system fictions**: `references/structure/form-system.md` — account login, per-account access (RBAC-style), and the desktop / simulated-internet / archive shells. A system project's page root may be `apps/` instead of `pages/`; set `pagesDir` once in `tools/config.mjs` (tooling.md §2).

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
  <!-- secret pages may add easter eggs: invisible links, black-on-black selectable text, hand-copied red text (see references/design-playbook.md §4.5) -->
</body>
</html>
```

Rules: **persistent top bar** — every page's header (same for container B's top menu bar) is fixed to the top of the viewport and does not leave view on long pages (base.css gives `position: sticky; top: 0` + an opaque background site-wide; secret/ pages included); the header carries that organization's own nav links (nav bar / index / sitemap), which together with the search box and the footer's own links are the only cross-page links a public page carries (R7); every `<input>` placeholder names its field (`Search...`, `Employee ID`) (R4); every page loads the same two scripts in the same order (`components.js` before the Alpine runtime) and carries no inline behavior wiring — behavior lives in `x-data` components; secret/ page footers may use anomalous numbers such as `ex/36` or `?/36`; the `[This content has been deleted]` placeholder is a valid narrative element.
