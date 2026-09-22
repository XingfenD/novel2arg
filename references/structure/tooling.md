# Tooling — Check Cadence, Shared Config, Manual Methods

> Companion to `references/structure/base.md` and `references/structure/components.md`. Required reading at
> step 8 (and at step 6, when copying `tools/` into a project).

## 1. Running the checks

The canonical pass/fail checklist — every command and every manual item — is **`workflow/08-self-check.md`**;
this section covers only the cadence and what the scripts automate.

```bash
node tools/build-keywords.mjs     # regenerate the hash table(s) after ANY edit to a data/keywords*.src.json
node tools/check-links.mjs        # dead links + public-index leaks; expect "0 dead · 0 layer leaks"
node tools/check-solvable.mjs     # cold-start walk; expect "fixpoint in N round(s) · gates 4/4 unlocked · pages 28/28 reachable"
node tools/check-credentials.mjs  # composite/derived credentials: parts + rule + zero-plaintext (run whenever data/credentials.src.json exists)
node tools/check-reachability.mjs # rehearsal build: inject the credentials into a throwaway copy, then prove gates unlock + pages reachable
node tools/site-graph.mjs       # writes docs/site-graph.json + docs/site-graph.html (reporting tool — exits 0 with problems)
```

`check-solvable.mjs` automates the credential-provenance half of the manual walkthrough **for verbatim credentials**, so the manual pass only judges tone and pacing. It exits non-zero when a clue is deleted, a password changes, a clue is misplaced inside a page's own post-unlock block, or a listing entry is cut — run it after every content edit, not just before deploy. It reads gate conventions from components.md §3 (`data-expect-hash`, `x-show="unlocked"` / `<template x-if="unlocked">`, `x-data="search"`); a project that renames those markers edits `tools/config.mjs` (§2), then re-checks the matcher with `node tools/check-solvable.mjs --self-test`.

A **derived/composite** credential (assembled from parts, never printed whole) is outside check-solvable's
verbatim model — it reports that gate STUCK. Do not print it to turn the check green (it leaks to every
visitor; no server auth on a static site). `check-credentials.mjs` proves it assembles zero-plaintext from
public-page components; `check-reachability.mjs` proves the graph still unlocks once it is known (§3 item 6).

`hash.mjs` is a design-time helper (step 3/5, when computing a gate's `data-expect-hash` values);
`vendor-alpine.mjs` runs once at scaffold time (step 6).

`site-graph.mjs` shares `site-model.mjs` with `check-solvable.mjs`, so the graph can never disagree with the walk. It reports the same defects the checkers gate on (unreachable pages, stuck gates, dead targets, layer leaks) plus design-surface signals the checkers do not model: M7 progress extraction and mismatches, step-4 closed-list route claims per edge, and negative progress deltas on non-chrome edges (back-jumps). It exits 0 with problems — gating stays with the checkers.

## 2. Shared config (tools/config.mjs)

The tools are written to an interface, not to one book. Every checker imports its assumptions from the
shared **`tools/config.mjs`**; a project that renames directories, layer names, or markers edits that one
file instead of rewriting a checker (a rewrite throws away the defects these checks were built from).

| Knob | Default | Used by |
|---|---|---|
| `dataDir` / `pagesDir` | `data` / `pages` | check-links, check-solvable, build-keywords |
| `surfaceTable` / `secretUrl` | `/surface/i` on the filename / `/^internal\//` | check-links |
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

Ten things no static checker can see. Each has a manual method or a companion tool; skipping it is the leak path.

1. **Runtime bindings** — `:href`, `x-bind`, DOM assembled in JS. Both link checkers resolve static `href`, static `<form action>`, and gate `data-next` targets only. The manual method is the keyword tables (search-result routes live there; `data-index` tells the checker which table a search page can reach) and modelling session state as `data-grant` / `data-access` (`references/structure/form-system.md` §5).
2. **Hubs that are their own database** — container B's plaintext `FILE_DATABASE`, container C's absolute cross-site links. Manual method: treat the hub as a listing page in the step-4 walk, then click every entry once during the step-8 chrome sweep.
3. **Un-skippability** — check-solvable proves a gate is solvable, never that it is unavoidable; the manual method is audience scoping (M1): per-audience tables, per-page `data-index`, check-links' leak guard (R8).
4. **Hash normalization is a four-way contract** — the in-page helper, `hash.mjs`, `build-keywords.mjs`, and `check-credentials.mjs` must agree byte-for-byte (`trim().toLowerCase()` → md5 → base64). Switching algorithms means editing all of them in one change, then grepping for tables generated under the old rule (R3).
5. **Multi-site layouts** — container C gives each site its own root; run the tools once per root (absolute cross-site urls are skipped by design, so the cross-site graph stays a step-4 artifact).
6. **Derived / composite credentials** — check-solvable matches a value only when it appears *verbatim*, so an account assembled from parts reads as STUCK. The fix is **not** printing it (R12): declare it and prove it with `check-credentials.mjs` (parts + rule + zero-plaintext) plus `check-reachability.mjs` (a rehearsal copy with the values injected).
7. **Per-tab session vs. new-tab results** — check-solvable models identities as one global set, so it cannot see that `sessionStorage` is per-tab while results open `target="_blank"` in a fresh tab; it reports green while the browser shows the document locked. Manual method: the step-8 cross-tab test; structural fix: a session cookie (components.md §2–§3, `references/structure/form-system.md` §6).
8. **Element-level permission masking** — a checker reads page *text*, not computed visibility; a credential hidden only by `x-show` / a CSS class / an element-level `data-access` is still in the HTML sent to every visitor, and client-side masking is not privacy (R12). Treat it as public: the step-8 chrome scan and `check-credentials`' zero-plaintext assertion catch it.
9. **GDD-declared assets that were never landed** — an emblem / seal / scan / photo / mock-doc the manifest lists but no page references has no `src` to resolve, so neither checker complains. Manual method: the step-8 asset-manifest reconciliation — every declared asset exists under `assets/` and is referenced by at least one page.
10. **Route claims and progress back-jumps** — `site-graph.mjs` classifies every edge with a step-4 closed-list route (`structural` where the machine can decide, `heuristic` for a body link read as a related-document reference) and flags non-chrome edges whose progress delta is negative. Confirm every `heuristic` claim and every back-jump against `docs/reachability.md` — the tool cannot judge whether the organization would really print the link.

The matcher reads *page text*, not the DOM, for the same reason the player does: it proves a string was
readable before the gate. A clue hidden in a `placeholder`, `title`, or JS string is invisible to both player
and checker — the step-8 chrome leak scan covers that class (R4).
