# Tooling — Check Cadence, Shared Config, Manual Methods

> Companion to `references/structure/base.md` and `references/structure/components.md`. Required reading at
> step 8 (and at step 6, when copying `tools/` into a project).

## 1. Running the checks

The canonical pass/fail checklist — every command and every manual item — is **`workflow/08-self-check.md`**.
This section covers only the cadence and what the scripts automate; it does not restate the checklist.

```bash
node tools/build-keywords.mjs     # regenerate the hash table(s) after ANY edit to a data/keywords*.src.json
node tools/check-links.mjs        # dead links + surface-index layer leaks; expect "0 dead · 0 layer leaks"
node tools/check-solvable.mjs     # cold-start walk; expect "fixpoint in N round(s) · gates 4/4 unlocked · pages 28/28 reachable"
node tools/check-credentials.mjs  # composite/derived credentials: parts + rule + zero-plaintext (run whenever data/credentials.src.json exists)
node tools/check-reachability.mjs # rehearsal build: inject the credentials into a throwaway copy, then prove gates unlock + pages reachable
```

`check-solvable.mjs` automates the credential-provenance half of the manual walkthrough **for verbatim credentials**, so the manual pass only has to judge tone and pacing. It exits non-zero when a clue is deleted, a password changes, a clue is misplaced inside a page's own post-unlock block, or a listing entry is cut — run it after every content edit, not just before deploy. It reads gate configuration through the conventions in components.md §3
(`data-expect-hash` on each input, post-gate block opening with `x-show="unlocked"` or
`<template x-if="unlocked">`, search mounted by `x-data="search"`); a project that renames those markers
edits `tools/config.mjs` (§2), and `node tools/check-solvable.mjs --self-test` re-checks the matcher after an edit.

A **derived/composite** credential (an account assembled from parts, never printed whole) is outside check-solvable's verbatim model — it reports such a gate STUCK. Do not print the credential to turn it green (that leaks it to every visitor; a static site has no server auth). `check-credentials.mjs` proves it assembles from public-page components and stays zero-plaintext; `check-reachability.mjs` proves the graph still unlocks once it is known (§3 item 6).

`hash.mjs` is a design-time helper (step 3/5, when computing a gate's `data-expect-hash` values);
`vendor-alpine.mjs` runs once at scaffold time (step 6).

## 2. Shared config (tools/config.mjs)

The tools are written to an interface, not to one book. Every checker imports its assumptions from the
shared **`tools/config.mjs`**; a project that renames directories, layer names, or markers edits that one
file instead of rewriting a checker (a rewrite throws away the defects these checks were built from) or
editing several CONFIG blocks in sync.

| Knob | Default | Used by |
|---|---|---|
| `dataDir` / `pagesDir` | `data` / `pages` | check-links, check-solvable, build-keywords |
| `surfaceTable` / `secretUrl` | `/surface/i` on the filename / `secret/` prefix | check-links |
| `entry` | `index.html` | check-solvable, check-reachability |
| `gateHashAttr` / `indexAttr` | `data-expect-hash` / `data-index` | check-solvable, check-credentials |
| `grantAttr` / `accessAttr` / `nextAttr` | `data-grant` / `data-access` / `data-next` | check-solvable (system-form accounts) |
| `unlockMarkers` / `unlockEnd` | `x-show="unlocked"` … `</main>` | check-solvable, check-reachability |
| `searchMount` | `x-data="search"` | check-solvable |
| `maxTokenLen` / `maxPhraseWords` / `maxPhraseLen` | 8 / 4 / 48 | check-solvable matcher |
| `credTable` | `data/credentials.src.json` | check-credentials, check-reachability |
| `derivedKinds` / `zeroPlaintextKinds` | `['account','secret']` / `['account']` | check-credentials |
| `credSkipDirs` | `.git node_modules docs tools deploy` | check-credentials |
| `solver` | `tools/check-solvable.mjs` | check-reachability |

`node tools/check-solvable.mjs --self-test` verifies the matcher (multi-word, long-word, HTML entity, CJK)
after a config edit.

## 3. What stays manual

Nine things no static checker can see. Each has a manual method or a companion tool; skipping it is the leak path.

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
   method is layer scoping: per-layer keyword tables, per-layer `data-index`, and check-links' leak guard (R8).
4. **Hash normalization is a four-way contract** — the in-page helper, `hash.mjs`, `build-keywords.mjs`, and
   `check-credentials.mjs` must agree byte-for-byte (`trim().toLowerCase()` → md5 → base64). Switching
   algorithms means editing all of them in one change, then grepping the tree for tables generated under the
   old rule (R3).
5. **Multi-site layouts** — container C gives each site its own root or repo. Run the tools once per root;
   absolute cross-site urls are skipped by design, so the cross-site graph stays a step-4 artifact.
6. **Derived / composite credentials** — check-solvable matches a value only when it appears *verbatim* in a
   readable page, so an account assembled from parts (pinyin initials + license-year) reads as STUCK. The
   fix is **not** to print it (that leaks it to every visitor and kills the puzzle, R12); it is
   `check-credentials.mjs` (parts + rule + zero-plaintext over `data/credentials.src.json`) plus
   `check-reachability.mjs` (a rehearsal copy with the values injected, proving the graph still unlocks).
7. **Per-tab session vs. new-tab results** — check-solvable models authenticated identities as one global
   set, so it cannot see that `sessionStorage` is per-tab while search results open `target="_blank"` in a
   fresh tab. It reports green while the real browser shows the protected document locked. The manual method
   is the step-8 cross-tab test; the structural fix is a session cookie (components.md §2–§3,
   references/structure/form-system.md §6).
8. **Element-level permission masking** — a checker reads page *text*, not computed visibility. A credential
   or answer hidden only by `x-show` / a CSS class / an element-level `data-access` mask is still in the HTML
   sent to every visitor; on a static site with no server auth, client-side masking is not privacy (R12).
   Treat anything so masked as public: the step-8 chrome leak scan and `check-credentials`' zero-plaintext
   assertion are what catch it.
9. **GDD-declared assets that were never landed** — check-links resolves an `<img src>` only if the tag was
   written; an emblem / seal / scan / photo / mock-doc the GDD asset manifest lists but no page
   references has no src to resolve, so neither checker complains. The manual method is the step-8
   asset-manifest reconciliation: every declared asset exists under `assets/` and is referenced by at least
   one page.

The matcher reads *page text*, not the DOM, for the same reason the player does: it proves a string was
readable before the gate. A clue hidden in a `placeholder`, `title`, or JS string is invisible to both the
player and the checker — the step-8 chrome leak scan covers that class (R4).
