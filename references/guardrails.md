# Guardrails — Mystery Novel → Interactive Web Puzzle Game

Adapt a mystery/suspense novel into a multi-page static puzzle game disguised as a real website (ARG-lite).
Success criterion: the player feels they are infiltrating a real website and uncovering material meant to stay private.

**Priority — realism outranks the checks (R12).** The simulated system behaves the way the real one would, even where that breaks a check rule (reachability, access, leak scan, a checker script). The four constraints below are not checks; they define the paradigm. The break is never silent: record the conflict — page, rule, what realism requires — and ask the user through the orchestrator. Silent rule-breaking and silent realism-bending are both defects.

Four constraints (violating any one departs from this paradigm):

1. **The site is the world**: each narrative location is a standalone HTML page — a document the player can open and select text in independently. The URL bar is a narrative device; long-form copy lives in real page text and canvas carries none.
2. **Two-layer narrative**: a surface layer (mundane, warm, realistic) and a secret layer (dark truth), with separate skins and copy per layer; the conflict is revealed through five escalating stages.
3. **Puzzles are character inference**: every password and keyword derives from a character's life traces (birthday, initials, license plate, in-group slang). Random strings are prohibited. The input UI names the field and stops there — `placeholder`, labels, help text, and empty states read `工号` / `站内搜索…`. Feedback stays oblique (`密码错误 🎂`). A gate page may post the account format, as real intranets do; the password derivation stays off the page.
4. **Diegetic neutrality**: every page is written for its in-world audience.
   - Public pages (staff roster, department page, menu, news list) publish what that organization publishes. A roster entry carries name, title, tenure, duties.
   - Navigation is the site's own information architecture: nav bar, index and listing pages, sitemap, footer. A link exists because that organization would put it there, and it stays within its layer — depth is crossed by search, a gate, or a system container's account login (references/structure/form-system.md), never by a "related files / related archives / related pages" link.
   - Formal documents (announcement, notice, contract, certificate, official reply, medical record) carry real-world format: issuing body, document number, date, addressee, body, signature and seal, distribution list. Player-facing instruction, hint, and commentary stay out of them.
   - Search follows publication rules: a search surface queries only the index of the layer it is served on. A surface-level result never points under `pages/secret/`; a result marked classified shows `[Access denied]` or resolves to its clearance gate, never to the document; result titles are catalog entries (issuing body + document type + number/date), not plot summaries. A system container does not split the index by layer: one index, and a hit opens only to an account its target document names (`data-access`).

**Prohibited forms of Constraint 1** (any one constitutes a structural departure):

- A single `index.html` shell with JS scene switching (a generic adventure engine); canvas scene rendering; hotspot maps
- Inventory / evidence tray / player notebook "game framework UI"
- A unified puzzle framework engine (a `register(type, panel)`-style puzzle registry)
- A build step that bundles the multi-page site back into a single-file dist
- Alpine.js (or any utility library) driving a single-page shell, `x-show` scene switching, or a puzzle registry engine — Alpine manages in-page component lifecycle only

## Canonical rules (R1–R12)

Every rule that more than one file states has exactly one canonical home: this table. Other files cite the
rule by ID — a one-line restatement plus `(Rn)` — and where a citation and this table disagree, this table
wins. `scripts/check-docs.mjs` verifies that every cited ID exists here.

| ID | Rule (canonical statement) | Elaborated in |
|---|---|---|
| R1 | The deliverable is a multi-page tree of independently openable HTML documents; single-file SPA shells, canvas scenes, inventory trays, puzzle-registry engines, and bundle-to-dist steps are prohibited; Alpine manages in-page component lifecycle only | this file: Constraint 1 + Prohibited forms; references/structure/base.md §1 |
| R2 | Two-layer narrative: separate skins and copy per layer; entering the secret layer reskins the whole page in four signals — background, title, logo, footer | Constraint 2; references/design-playbook.md §4.1 |
| R3 | Every credential and keyword derives from a character's life traces; random strings are prohibited; keyword tables and gate hashes ship hashed and the plaintext `.src.json` never reaches the deployed tree | Constraint 3; references/structure/components.md §1 |
| R4 | Input UI names the field only (`placeholder` / label / help text / empty state); failure hints point at the source obliquely and stop there; a gate page may post the account format, never the password derivation | Constraint 3; references/design-playbook.md §6.9; references/structure/components.md §3 |
| R5 | Public pages publish what that organization publishes; no public page mentions the plot; no in-world page addresses the player | Constraint 4; references/design-playbook.md §3.12 |
| R6 | Formal documents carry real-world format: issuing body, document number, date, addressee, body, signature and seal, distribution list | Constraint 4; references/design-playbook.md §3.13 |
| R7 | Every link exists because that organization would publish it — nav bar, index and listing pages, sitemap, footer, same-layer related documents; depth is crossed by search, a gate, or an account login, never by a "related files / archives / pages" link into a deeper layer | Constraint 4; workflow/04-reachability.md |
| R8 | Search is layer-scoped (website form): each search surface queries only the index of the layer it is served on; the surface index carries no `secret/` URL; a result marked classified shows `[Access denied]` or resolves to its clearance gate, never to the document | Constraint 4; references/structure/form-website.md §2 |
| R9 | Search-result titles are catalog entries — issuing body + document type + number/date — never plot summaries | Constraint 4; references/structure/components.md §1 |
| R10 | System forms use per-account access: a page opens only to the accounts it names (`data-access`), granted only by a login gate (`data-grant`); no numeric clearance ladder, no admin-opens-all; only the initial account may be printed, every other login is inferred from clues | references/structure/form-system.md §1 |
| R11 | Copy is plain and declarative: contrast frames (是…不是… / 是…而是… / 不能…只能… / 并非…而是…), metaphor, personification, and adjectives piled for effect stay out of site and guidance copy | references/design-playbook.md §3.14 |
| R12 | Realism outranks any check; a conflict is recorded — page, rule, what realism requires — and routed to the user through the orchestrator, never resolved silently | this file: Priority |

## Rationalizations (observed in baseline tests; rationalization → counter)

| Rationalization | Counter |
|---|---|
| "We're short on time — one HTML file is enough." | Cut content volume (fewer pages and puzzles); structure stays. A single file falls outside the paradigm (R1). |
| "Don't start over; the engine layer is frozen." | A generic game framework scaffold is not a fake website. Migrate the content layer as-is and replace the engine with multi-page plus search/gate (R1). |
| "Well-known puzzle games use this architecture." | Popularity does not imply fit for this paradigm. Those games optimize mechanical puzzle feel; this paradigm optimizes fake-website immersion. The two architectures are not interchangeable. |
| "A single file is easier to distribute." | Static hosting (GitHub Pages) costs nothing; publish `src/` directly. |
| "Generate passwords randomly now; fix them later." | Password-as-character-inference is the puzzle quality itself; there is no "later" (R3). |
| "A hint in the placeholder helps stuck players." | The disguise is the product. A hint turns a real website into game UI; stuck players get an oblique failure hint (R4). |
| "Real intranets post the initial-password rule." | Real ones do; this one carries the puzzle. Account format is fine, password derivation stays off the page (R4). |
| "The roster has to say why this character matters." | A real roster says what they do. The player assembles relevance from the secret layer (R5). |
| "One extra link saves the player a search." | Every link the organization would keep off its own site is a visible seam. Clues ride nav bars, index pages, and search (R7). |
| "The document can carry one line of guidance." | A real announcement carries none. Guidance lives on the entry ritual page (R6). |
| "Plain copy reads badly." | Plain copy reads like a real website. Decoration reads like a game (R11). |
| "This page has no way in; I'll add a link in the body." | Add it to a listing the site would really keep, or make it search-only. workflow/04-reachability.md lists the four orphan fixes (R7). |
| "The puzzle is already built; cutting it wastes work." | Step 5 asks what the guarded page gives the player. Atmosphere moves to the atmosphere list. |
| "Auditing before scaffolding is overhead." | Both audits cost less than re-writing pages. They gate step 6 for that reason. |
| "Search is the hub; it should index everything." | The hub is layer-scoped: surface search returns what the organization publishes, the secret index opens after the reskin. One flat index turns the search box into a walkthrough (R8). |

## Red Flags — stop and revise the GDD

- Only one HTML file exists in the project (R1)
- Canvas scene rendering, an inventory, or a puzzle registry engine appears (R1)
- Passwords are random strings with no derivable source in page copy (R3)
- Only one visual theme exists (R2)
- A public page mentions the plot (R5)
- A page carries a link absent from the reachability table (R7)
- A surface-layer search returns a `secret/` page, or a result marked classified opens without a gate (R8)
- An input's `placeholder`, label, or help text carries the answer or restates it (R4)
- An announcement or contract reads as game copy (R6)
- Guidance text uses metaphor, personification, or adjectives piled for effect (R11)
- Site copy uses contrast frames (是…不是… / 是…而是… / 不能…只能…) (R11)
- A check is broken, or realism bent, without the conflict going to the user (R12)
- "Let's get a demo running first"

## When not to use

- Non-mystery, non-horror premises (the "mundane surface vs. dark secret layer" contrast is a prerequisite)
- Non-web delivery (Unity / mobile game / visual novel engine)
- Pure interactive fiction without puzzles (no puzzle system required)
