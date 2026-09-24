# Step 7 — Implementation

**Input:** the scaffolded tree plus all `docs/` artifacts. **Output:** the finished site. One subagent per phase. Phases 1→2→3 are a chain; the rest overlap: 4a dispatches with 1, 4b after 3, 5 beside 3, 6 after 3, 7 last.

| Phase | Work | Dispatch |
|---|---|---|
| 1 | Public pages and realistic documents | subagent |
| 2 | Search engine and password gates — complete one shortest playable path end to end | subagent |
| 3 | Restricted-area pages (and reskinning when M5 is selected) | subagent |
| 4a | Images, seals, scans, photos, and mock documents — write **every** asset the GDD asset manifest declares, under `assets/`; no page wiring yet | subagent — dispatch with phase 1 |
| 4b | Wire each 4a asset into the pages that reference it — `<img src>` / download links — once those pages exist | subagent — after phase 3 |
| 5 | Staging modules: countdown blackout, typewriter, scroll reveal (when M12 is selected) | subagent — may dispatch with phase 3 |
| 6 | Endings and fourth-wall close (when M10 is selected) | subagent |
| 7 | Entry page: role assignment, start button, declared requirements | subagent |

Phase 7 lands last because its copy has to describe the game that now exists. Asset work is its own phase, not a detail of phases 1–3: a declared emblem / seal / scan / photo that no phase owns is exactly what gets dropped, and neither checker catches it (an `<img>` that was never written has no `src` to resolve — references/structure/tooling.md §3 item 9). 4a dispatches with phase 1, and 4b wires them once the referencing pages exist. Phase 5 may run beside phase 3.

Each phase subagent receives only the artifact sections and references its row names — never a whole file where sections are listed — plus the list of pages it owns. It returns the changed file list plus unresolved questions. Component behavior comes from the project's own `components.js` (written by 6a); `references/structure/components.md` is step-6a reading, not step-7 reading.

| Phase | Artifact sections | References |
|---|---|---|
| 1 Public pages and realistic documents | gdd sections 1, 2, 8; `docs/registry.md` | `references/guardrails.md` (R5, R6, R12), `references/design-playbook.md` §4, `references/structure/base.md`, form doc |
| 2 Search engine and password gates | gdd sections 4, 5; reachability rows for owned pages | project `components.js` (search, gate), `references/guardrails.md` (R3, R4, R8, R9), form doc |
| 3 Restricted-area pages (+ reskin when M5) | gdd section 4; reachability rows for owned pages | project `components.js` (access, reskin), form doc, `references/guardrails.md` (R10, R12) |
| 4a Generate assets | gdd front matter (asset manifest) | `references/structure/tooling.md` §3 item 9 (asset reconciliation) |
| 4b Wire assets into pages | gdd front matter (asset manifest); the page set from phases 1–3 | `references/structure/tooling.md` §3 item 9 (asset reconciliation) |
| 5 Staging modules (when M12) | gdd section 5 (sensory rows) | project `components.js` (staging) |
| 6 Endings and fourth-wall close (when M10) | gdd sections 3, 6 | `references/design-playbook.md` §4, `references/guardrails.md` (R11, R12) |
| 7 Entry page | gdd sections 3, 6; `docs/system-profile.md` | `references/design-playbook.md` §4, `references/guardrails.md` (R12) |

## Standing rules for every phase

- **The framework is fixed.** Step 6a set the shell, skins, components, and tools; phases fill page copy and content — they do not rebuild or restyle the framework.
- **Selected modules only.** Write the modules `docs/system-profile.md` selects; a disabled module leaves no furniture behind (no unused search table, skin, gate, or account page).
- **Public pages stay neutral (R5).** Write each one as a document of that organization. A roster entry carries name, title, tenure, duties. The plot stays out of it.
- **Links come from the reachability table and stay within their area (R7).** A link absent from that table does not get written; depth is crossed by a reach module — never by a "related files / archives / pages" link.
- **System pages open only to their named accounts when M3 is selected (R10).** A protected page carries `data-access` (`references/structure/form-system.md` §1); an admin account never inherits a colleague's private document; only the initial account is printed — every other login is inferred from clues, never copied from a page.
- **A derived/composite credential is proved by parts, never printed (R3, R12).** Author `data/credentials.src.json` (value + rule + public-page components + kind per gate field) and run `node tools/check-credentials.mjs` + `node tools/check-reachability.mjs`. Do not print an account to make `check-solvable.mjs` green — that leaks it to every visitor and kills the puzzle (`references/structure/components.md` §3; `references/structure/tooling.md` §3 item 6).
- **One login box, session cookie, when M3 is selected (R10).** A single box serving several roles uses `data-grants` (account→identity map), not two forms on the page; access state lives in a session cookie so a result opened `target="_blank"` stays unlocked (`references/structure/form-system.md` §2; `references/structure/components.md` §3).
- **Documents carry their format (R6).** Issuing body, document number, date, addressee, body, signature and seal, distribution list.
- **Inputs name the field (R4).** `placeholder="工号"`, `placeholder="站内搜索…"`. The gate page may post the account format; the password derivation stays off it.
- **Copy is declarative (R11).** See references/design-playbook.md §4.14 before writing any sentence.
- **Keywords get hashed (R3).** Run `node tools/build-keywords.mjs` after any change to either `data/keywords.<layer>.src.json`.
- **Shared entities stay identical.** A person name, ID, account, page title, or date that appears on more than one page is copied from `docs/registry.md` (written at step 3), never re-typed; the registry is the single source of truth.

At the end of each phase, re-run the leak scan from workflow/05-puzzle-audit.md Q4 over the files that phase touched.

Baseline-test traps for this step: references/common-mistakes.md §7 — check them before returning the artifact.
