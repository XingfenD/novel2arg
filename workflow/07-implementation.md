# Step 7 — Implementation

**Input:** the scaffolded tree plus all `docs/` artifacts. **Output:** the finished site. One subagent per phase, in this order.

| Phase | Work | Dispatch |
|---|---|---|
| 1 | Surface skin and realistic document pages | subagent |
| 2 | Search engine and password gates — complete one shortest playable path end to end | subagent |
| 3 | Secret pages and reskinning | subagent |
| 4 | Staging modules: countdown blackout, typewriter, scroll reveal | subagent |
| 5 | Endings and fourth-wall close | subagent |
| 6 | Entry ritual page: rules, hardware requirements, honor agreement | subagent |

Phase 6 lands last because its copy has to describe the game that now exists.

Each phase subagent receives the file paths of `docs/gdd.md`, `docs/reachability.md`, `docs/puzzle-audit.md`, both reference files, and the list of pages it owns. It returns the changed file list plus unresolved questions.

## Standing rules for every phase

- **Public pages stay neutral.** Write each one as a document of that organization. A roster entry carries name, title, tenure, duties. The plot stays out of it.
- **Links come from the reachability table and stay within their layer.** A link absent from that table does not get written; depth is crossed by search, a gate, or account login — never by a "related files / archives / pages" link.
- **System pages open only to their named accounts.** A protected page carries `data-access` (references/structure/form-system.md §1); an admin account never inherits a colleague's private document; only the initial account is printed — every other login is inferred from clues, never copied from a page.
- **Documents carry their format.** Issuing body, document number, date, addressee, body, signature and seal, distribution list.
- **Inputs name the field.** `placeholder="工号"`, `placeholder="站内搜索…"`. The gate page may post the account format; the password derivation stays off it.
- **Copy is declarative.** See references/design-paradigms.md §3.14 before writing any sentence.
- **Keywords get hashed.** Run `node tools/build-keywords.mjs` after any change to either `data/keywords.<layer>.src.json`.

At the end of each phase, re-run the leak scan from workflow/05-puzzle-audit.md Q4 over the files that phase touched.

Baseline-test traps for this step: references/common-mistakes.md §7 — check them before returning the artifact.
