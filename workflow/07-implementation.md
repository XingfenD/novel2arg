# Step 7 — Implementation

**Input:** the scaffolded tree plus all `docs/` artifacts. **Output:** the finished site. One subagent per phase, in this order.

| Phase | Work | Dispatch |
|---|---|---|
| 1 | Surface skin and realistic document pages | subagent |
| 2 | Search engine and password gates — complete one shortest playable path end to end | subagent |
| 3 | Secret pages and reskinning | subagent |
| 4 | Images, seals, scans, photos, and mock documents — land **every** asset the GDD asset manifest (§0.1) declares, and wire each `<img src>` / download link into the pages that reference it | subagent |
| 5 | Staging modules: countdown blackout, typewriter, scroll reveal | subagent |
| 6 | Endings and fourth-wall close | subagent |
| 7 | Entry ritual page: rules, hardware requirements, honor agreement | subagent |

Phase 7 lands last because its copy has to describe the game that now exists. Phase 4 is its own phase, not a
detail of phases 1–3: a declared emblem / seal / scan / photo that no phase owns is exactly what gets dropped,
and neither checker catches it (an `<img>` that was never written has no `src` to resolve — base.md §10 item 9).

Each phase subagent receives the file paths of `docs/gdd.md`, `docs/reachability.md`, `docs/puzzle-audit.md`, both reference files, and the list of pages it owns. It returns the changed file list plus unresolved questions.

## Standing rules for every phase

- **Public pages stay neutral.** Write each one as a document of that organization. A roster entry carries name, title, tenure, duties. The plot stays out of it.
- **Links come from the reachability table and stay within their layer.** A link absent from that table does not get written; depth is crossed by search, a gate, or account login — never by a "related files / archives / pages" link.
- **System pages open only to their named accounts.** A protected page carries `data-access` (references/structure/form-system.md §1); an admin account never inherits a colleague's private document; only the initial account is printed — every other login is inferred from clues, never copied from a page.
- **A derived/composite credential is proved by parts, never printed.** Author `data/credentials.src.json` (value + rule + public-page components + kind per gate field) and run `node tools/check-credentials.mjs` + `node tools/check-reachability.mjs`. Do not print an account to make `check-solvable.mjs` green — that leaks it to every visitor and kills the puzzle (references/structure/base.md §5, §9–§10).
- **One login box, session cookie.** A single box serving several roles uses `data-grants` (account→identity map), not two forms on the page; access state lives in a session cookie so a result opened `target="_blank"` stays unlocked (references/structure/form-system.md §2, §6).
- **Documents carry their format.** Issuing body, document number, date, addressee, body, signature and seal, distribution list.
- **Inputs name the field.** `placeholder="工号"`, `placeholder="站内搜索…"`. The gate page may post the account format; the password derivation stays off it.
- **Copy is declarative.** See references/design-paradigms.md §3.14 before writing any sentence.
- **Keywords get hashed.** Run `node tools/build-keywords.mjs` after any change to either `data/keywords.<layer>.src.json`.
- **Shared entities stay identical.** A person name, ID, account, page title, or date that appears on more than one page is copied from the GDD entity registry (workflow/03), never re-typed; the registry is the single source of truth.

At the end of each phase, re-run the leak scan from workflow/05-puzzle-audit.md Q4 over the files that phase touched.

Baseline-test traps for this step: references/common-mistakes.md §7 — check them before returning the artifact.
