# Guardrails — Mystery Novel → Interactive Web Puzzle Game

Adapt a mystery/suspense novel into a multi-page static puzzle game disguised as a real system (ARG-lite).
Success criterion: the player feels they are inside a real site, uncovering material meant to stay private.

**Priority — realism outranks the checks (R12).** The simulated system behaves the way the real one would, even
where that breaks a check rule. The constraints below define the paradigm, not checks; the break is never
silent: record the conflict — page, rule, what realism requires — and ask the user through the orchestrator.

Four constraints (violating any one departs from this paradigm):

1. **The site is the world**: each narrative location is a standalone HTML page the player can open and select
   text in independently; the URL bar is a narrative device. A notebook or evidence wall belongs to the fiction
   as its own page or app; a game-UI layer wrapped around the site does not.
2. **Two-layer narrative**: the surface layer (mundane) and the secret layer (the dark truth) are story logic,
   revealed in escalating stages. A visual reskin on crossing over is a module choice
   (`references/design-playbook.md` §2), not a requirement — some systems never show a seam.
3. **Puzzles are character inference**: every password and keyword derives from a character's life traces
   (birthday, initials, license plate, in-group slang); random strings are prohibited. The input UI names the
   field and stops there, feedback stays oblique (`密码错误 🎂`), and a gate page may post the account format
   (as real intranets do) but never the password derivation.
4. **Diegetic neutrality**: every page is written for its in-world audience. Public pages publish what that
   organization publishes (a roster entry: name, title, tenure, duties). Navigation is the site's own IA — nav
   bar, index and listing pages, sitemap, footer; depth is crossed by a reach module (search / gate / account /
   hand-typed URL — `references/design-playbook.md` §2), never by a "related files / archives / pages" link.
   Formal documents carry real-world format (issuing body, number, date, addressee, body, seal, distribution
   list), and the system shows only what such a system would show: no implementation talk, no game meta, no
   clearance theater. A locked entry says plainly that it is not open to this visitor yet.

**Prohibited forms of Constraint 1** (any one is a structural departure): a single `index.html` shell with JS
scene switching (a generic adventure engine) or canvas scene rendering; an inventory / evidence tray / player
notebook rendered as chrome around the site; a `register(type, panel)`-style puzzle registry engine; a build
step that bundles the site back into a single-file dist; Alpine driving a single-page shell or a puzzle engine
(in-page component lifecycle only).

## Canonical rules (R1–R12)

Every rule that more than one file states has exactly one canonical home: this table. Other files cite the
rule by ID — a one-line restatement plus `(Rn)` — and where a citation and this table disagree, this table
wins. `scripts/check-docs.mjs` verifies that every cited ID exists here.

| ID | Rule (canonical statement) | Elaborated in |
|---|---|---|
| R1 | The deliverable is a multi-page tree of independently openable HTML documents; single-file shells, canvas scenes, puzzle-registry engines, and bundle-to-dist steps are prohibited; game-UI carriers live inside the fiction, never around it | this file: Constraint 1 + Prohibited forms; `references/structure/base.md` §1 |
| R2 | Two-layer narrative is story logic: surface + secret layers, revealed in stages; any reskin or visual switch is a selected module, never a requirement | Constraint 2; `references/design-playbook.md` §2 |
| R3 | Every credential and keyword derives from a character's life traces; random strings are prohibited; keyword tables and gate hashes ship hashed and the plaintext `.src.json` never reaches the deployed tree | Constraint 3; `references/structure/components.md` §1 |
| R4 | Input UI names the field only (`placeholder` / label / help text / empty state); failure hints point at the source obliquely and stop there; a gate page may post the account format, never the password derivation | Constraint 3; `references/design-playbook.md` §4; `references/structure/components.md` §3 |
| R5 | Public pages publish what that organization publishes; no public page mentions the plot; no in-world page addresses the player | Constraint 4; `references/design-playbook.md` §4 |
| R6 | Formal documents carry real-world format: issuing body, document number, date, addressee, body, signature and seal, distribution list | Constraint 4; `references/design-playbook.md` §4 |
| R7 | Every link exists because that organization would publish it; depth is crossed by a reach module, never by a "related files / archives / pages" link into a deeper area | Constraint 4; `workflow/04-reachability.md` |
| R8 | Search (M1): each search surface returns only what its audience may see; the public index carries no restricted-area URL; a hit the visitor may not open resolves to its gate or a plain locked notice, never the document. A system form keeps one index, resolved through the account matrix | Constraint 4; `references/structure/form-website.md` §2 |
| R9 | Search-result titles are catalog entries — issuing body + document type + number/date — never plot summaries | Constraint 4; `references/structure/components.md` §1 |
| R10 | System containers use per-account access: a page opens only to the accounts it names (`data-access`), granted only by a login gate (`data-grant`); no numeric ladder, no admin-opens-all; only the initial account may be printed, every other login is inferred from clues | `references/structure/form-system.md` §1 |
| R11 | Copy is plain and declarative: contrast frames (是…不是… / 是…而是… / 不能…只能… / 并非…而是…), metaphor, personification, and adjectives piled for effect stay out of site and guidance copy | `references/design-playbook.md` §4 |
| R12 | Realism outranks any check; a conflict is recorded — page, rule, what realism requires — and routed to the user through the orchestrator, never resolved silently | this file: Priority |

## Rationalizations (observed in baseline tests; rationalization → counter)

| Rationalization | Counter |
|---|---|
| "We're short on time — one HTML file is enough." | Cut content volume (fewer pages and puzzles); structure stays. A single file falls outside the paradigm (R1). |
| "Don't start over; the engine layer is frozen." | A generic game framework scaffold is not a fake system. Migrate the content layer as-is and replace the engine with multi-page plus reach modules (R1). |
| "Generate passwords randomly now; fix them later." | Password-as-character-inference is the puzzle quality itself; there is no "later" (R3). |
| "Every story needs an account system." | Reach follows the container: a public website differentiates by search and gates, a system fiction by accounts. Add accounts only where the fiction really has identities and logins (`workflow/02-container.md`). |
| "Turn on every module so it feels like a game." | Modules are selected for the fiction at step 2, with the user. A search box nobody needs, a reskin nothing uses, or a clearance badge reads as game scaffolding. |
| "A hint in the placeholder helps stuck players." | The disguise is the product. A hint turns a real system into game UI; stuck players get an oblique failure hint (R4). |
| "One extra link saves the player a search." | Every link the organization would keep off its own site is a visible seam. Clues ride nav bars, index pages, and the selected reach modules (R7). |
| "This page has no way in; I'll add a link in the body." | Add it to a listing the site would really keep, or make it search-only. `workflow/04-reachability.md` lists the orphan fixes (R7). |
| "Search is the hub; it should index everything." | A search surface returns only what its audience may see; deep pages open by their own access path. One flat index turns the search box into a walkthrough (R8). |

## Red Flags — stop and revise the system profile or GDD

- Only one HTML file exists in the project (R1)
- Canvas scene rendering or a puzzle registry engine appears (R1)
- Passwords are random strings with no derivable source in page copy (R3)
- A public page mentions the plot (R5); a page carries a link absent from the reachability table (R7)
- A search surface returns a page beyond its audience, or an unopenable result opens its document (R8)
- An input's `placeholder`, label, or help text carries the answer or restates it (R4)
- An announcement or contract reads as game copy (R6)
- Guidance or site copy uses metaphor, personification, piled adjectives, or contrast frames (R11)
- A module selected in `docs/system-profile.md` is missing from the built site, or an unselected one appears
- A check is broken, or realism bent, without the conflict going to the user (R12)
- "Let's get a demo running first"

## When not to use

- Non-mystery, non-horror premises (the "mundane surface vs. dark secret layer" contrast is a prerequisite)
- Non-web delivery (Unity / mobile game / visual novel engine); pure interactive fiction without puzzles
