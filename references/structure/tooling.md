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
```

`check-solvable.mjs` automates the credential-provenance half of the manual walkthrough, so the manual pass
only has to judge tone and pacing. It exits non-zero when a clue is deleted, a password changes, a clue is
misplaced inside a page's own post-unlock block, or a listing entry is cut — run it after every content edit,
not just before deploy. It reads gate configuration through the conventions in components.md §3
(`data-expect-hash` on each input, post-gate block opening with `x-show="unlocked"` or
`<template x-if="unlocked">`, search mounted by `x-data="search"`); a project that renames those markers
edits `tools/config.mjs` (§2), and `node tools/check-solvable.mjs --self-test` re-checks the matcher after an edit.

`hash.mjs` is a design-time helper (step 3/5, when computing a gate's `data-expect-hash` values);
`vendor-alpine.mjs` runs once at scaffold time (step 6).

## 2. Shared config (tools/config.mjs)

The tools are written to an interface, not to one book. Both checkers import their assumptions from the
shared **`tools/config.mjs`**; a project that renames directories, layer names, or markers edits that one
file instead of rewriting a checker (a rewrite throws away the defects these checks were built from) or
editing two CONFIG blocks in sync.

| Knob | Default | Used by |
|---|---|---|
| `dataDir` / `pagesDir` | `data` / `pages` | both checkers + build-keywords |
| `surfaceTable` / `secretUrl` | `/surface/i` on the filename / `secret/` prefix | check-links |
| `entry` | `index.html` | check-solvable |
| `gateHashAttr` / `indexAttr` | `data-expect-hash` / `data-index` | check-solvable |
| `grantAttr` / `accessAttr` / `nextAttr` | `data-grant` / `data-access` / `data-next` | check-solvable (system-form accounts) |
| `unlockMarkers` / `unlockEnd` | `x-show="unlocked"` … `</main>` | check-solvable |
| `searchMount` | `x-data="search"` | check-solvable |
| `maxTokenLen` / `maxPhraseWords` / `maxPhraseLen` | 8 / 4 / 48 | check-solvable matcher |

`node tools/check-solvable.mjs --self-test` verifies the matcher (multi-word, long-word, HTML entity, CJK)
after a config edit.

## 3. What stays manual

Five things no static checker can see. Each has a manual method; skipping it is the leak path.

1. **Runtime bindings** — `:href`, `x-bind`, DOM assembled in JS. Both checkers resolve static `href`,
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
4. **Hash normalization is a three-way contract** — the in-page helper, `hash.mjs`, and `build-keywords.mjs`
   must agree byte-for-byte (`trim().toLowerCase()` → md5 → base64). Switching algorithms means editing all
   three in one change, then grepping the tree for tables generated under the old rule (R3).
5. **Multi-site layouts** — container C gives each site its own root or repo. Run the tools once per root;
   absolute cross-site urls are skipped by design, so the cross-site graph stays a step-4 artifact.

The matcher reads *page text*, not the DOM, for the same reason the player does: it proves a string was
readable before the gate. A clue hidden in a `placeholder`, `title`, or JS string is invisible to both the
player and the checker — the step-8 chrome leak scan covers that class (R4).
