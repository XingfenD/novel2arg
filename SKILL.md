---
name: novel2arg
description: Use when adapting a mystery/suspense novel into an interactive web puzzle game (ARG-lite), or when the user asks for a web puzzle site, an interactive novel adaptation, a puzzle website, or a mystery-novel game adaptation. Also use when such a project drifts toward a single-file SPA, canvas scene engine, inventory-based adventure UI, generic puzzle framework, or random passwords, even when told to "keep it simple" or that an engine was already scaffolded.
---

# novel2arg: Mystery Novel → Interactive Web Puzzle Game

## Overview

Adapt a mystery/suspense novel into a multi-page static puzzle game disguised as a real website (ARG-lite).
Success criterion: the player feels they are infiltrating a real website and uncovering material meant to stay private.

Four constraints (violating any one departs from this paradigm):

1. **The site is the world**: each narrative location is a standalone HTML page — a document the player can open and select text in independently. The URL bar is a narrative device; long-form copy lives in real page text and canvas carries none.
2. **Two-layer narrative**: a surface layer (mundane, warm, realistic) and a secret layer (dark truth), with separate skins and copy per layer; the conflict is revealed through five escalating stages.
3. **Puzzles are character inference**: every password and keyword derives from a character's life traces (birthday, initials, license plate, in-group slang). Random strings are prohibited. The input UI names the field and stops there — `placeholder`, labels, help text, and empty states read `工号` / `站内搜索…`. Feedback stays oblique (`密码错误 🎂`). A gate page may post the account format, as real intranets do; the password derivation stays off the page.
4. **Diegetic neutrality**: every page is written for its in-world audience.
   - Public pages (staff roster, department page, menu, news list) publish what that organization publishes. A roster entry carries name, title, tenure, duties.
   - Navigation is the site's own information architecture: nav bar, index and listing pages, sitemap, footer. A link exists because that organization would put it there.
   - Formal documents (announcement, notice, contract, certificate, official reply, medical record) carry real-world format: issuing body, document number, date, addressee, body, signature and seal, distribution list. Player-facing instruction, hint, and commentary stay out of them.

**Prohibited forms of Constraint 1** (any one constitutes a structural departure):

- A single `index.html` shell with JS scene switching (a generic adventure engine); canvas scene rendering; hotspot maps
- Inventory / evidence tray / player notebook "game framework UI"
- A unified puzzle framework engine (a `register(type, panel)`-style puzzle registry)
- A build step that bundles the multi-page site back into a single-file dist
- Alpine.js (or any utility library) driving a single-page shell, `x-show` scene switching, or a puzzle registry engine — Alpine manages in-page component lifecycle only

## Rationalizations (observed in baseline tests; rationalization → counter)

| Rationalization | Counter |
|---|---|
| "We're short on time — one HTML file is enough." | Cut content volume (fewer pages and puzzles); structure stays. A single file falls outside the paradigm. |
| "Don't start over; the engine layer is frozen." | A generic game framework scaffold is not a fake website. Migrate the content layer as-is and replace the engine with multi-page plus search/gate. |
| "Well-known puzzle games use this architecture." | Popularity does not imply fit for this paradigm. Those games optimize mechanical puzzle feel; this paradigm optimizes fake-website immersion. The two architectures are not interchangeable. |
| "A single file is easier to distribute." | Static hosting (GitHub Pages) costs nothing; publish `src/` directly. |
| "Generate passwords randomly now; fix them later." | Password-as-character-inference is the puzzle quality itself; there is no "later." |
| "A hint in the placeholder helps stuck players." | The disguise is the product. A hint turns a real website into game UI; stuck players get an oblique failure hint. |
| "Real intranets post the initial-password rule." | Real ones do; this one carries the puzzle. Account format is fine, password derivation stays off the page. |
| "The roster has to say why this character matters." | A real roster says what they do. The player assembles relevance from the secret layer. |
| "One extra link saves the player a search." | Every link the organization would keep off its own site is a visible seam. Clues ride nav bars, index pages, and search. |
| "The document can carry one line of guidance." | A real announcement carries none. Guidance lives on the entry ritual page. |
| "Plain copy reads badly." | Plain copy reads like a real website. Decoration reads like a game. |
| "This page has no way in; I'll add a link in the body." | Add it to a listing the site would really keep, or make it search-only. workflow/04-reachability.md lists the four orphan fixes. |
| "The puzzle is already built; cutting it wastes work." | Step 5 asks what the guarded page gives the player. Atmosphere moves to the atmosphere list. |
| "Auditing before scaffolding is overhead." | Both audits cost less than re-writing pages. They gate step 6 for that reason. |

## Red Flags — stop and revise the GDD

- Only one HTML file exists in the project
- Canvas scene rendering, an inventory, or a puzzle registry engine appears
- Passwords are random strings with no derivable source in page copy
- Only one visual theme exists
- A public page mentions the plot
- A page carries a link absent from the reachability table
- An input's `placeholder`, label, or help text carries the answer or restates it
- An announcement or contract reads as game copy
- Guidance text uses metaphor, personification, or adjectives piled for effect
- Site copy uses contrast frames (是…不是… / 是…而是… / 不能…只能…)
- "Let's get a demo running first"

## When not to use

- Non-mystery, non-horror premises (the "mundane surface vs. dark secret layer" contrast is a prerequisite)
- Non-web delivery (Unity / mobile game / visual novel engine)
- Pure interactive fiction without puzzles (no puzzle system required)

## Workflow

Eight steps in order. Each step body lives in `workflow/`; this section routes.

| Step | File | Deliverable | Dispatch |
|---|---|---|---|
| 1 Deconstruct the novel | workflow/01-deconstruct.md | five tables | subagent |
| 2 Select the world container | workflow/02-container.md | GDD cover-page record | orchestrator (asks the user) |
| 3 Write the GDD | workflow/03-gdd.md | `docs/gdd.md`, eight sections | subagent |
| 4 Reachability chain analysis 触达链分析 | workflow/04-reachability.md | `docs/reachability.md` | subagent |
| 5 Puzzle design audit 谜题设计分析 | workflow/05-puzzle-audit.md | `docs/puzzle-audit.md` with dispositions | subagent |
| 6 Scaffold | workflow/06-scaffold.md | file tree, every page skeletoned | subagent |
| 7 Implementation | workflow/07-implementation.md | finished site | one subagent per phase |
| 8 Self-check | workflow/08-self-check.md | `docs/self-check.md`, pass/fail per item | subagent |

Steps 4 and 5 are gates. A GDD that fails either returns to step 3 before scaffolding starts.

**Dispatch contract.** The orchestrator writes the prompt, reads the returned artifact, then dispatches the next step. It performs step 2 itself and delegates the rest. Every prompt carries: the novel text path, file paths of prior artifacts, that step's deliverable definition copied from its workflow file, both reference file paths, and the closing line "return the artifact plus unresolved questions; route questions back through the orchestrator." Subagents hold no conversation with the user.

## Common Mistakes (observed in baseline tests; avoid each)

| Mistake | Correct approach |
|---|---|
| Building a SPA adventure engine (canvas scenes, inventory, generic puzzle framework) | Multi-page fake website; each page is an independently openable "document" |
| Puzzles detached from characters (abstract mechanisms, random passwords) | Password = character inference; finding the password = understanding a character |
| Horror delivered through adjectives and jump-scare copy | Horror delivered through bureaucratic ledgers, repetition (one sentence copied 21 times), absence (unanswered posts, `[deleted]`) |
| A single visual theme | Light/dark dual skins; instant full-page reskin on entering the secret layer |
| Story chronology only | Twist points reordered by player discovery; the central twist page releases multiple side hooks in one page |
| No progress feedback | `NN/total` in each page footer; secret pages use anomalous numbering such as `ex/total` |
| A single ending, or an ending that is a score | A two-option moral dilemma ending + a fourth-wall close + a sequel hook |
| Keywords stored in plaintext JSON | Build script hashes them into a table, preventing "read the source to win" |
| Plot stated on a public page ("head chef — and the man who vanished in 2019") | Public pages publish what that organization publishes; the player assembles the plot from the secret layer |
| Links planted to chain clue → clue | Clue delivery rides the site's own IA: nav bar, index and listing pages, sitemap, search |
| Orphan pages nobody can reach | Step 4 audits the graph before scaffolding; step 8 re-walks it after |
| The answer in a `placeholder` or help text | Field names only; oblique failure hints carry the feedback |
| A gate kept because it is already written | Step 5 necessity question; a blank justification means 删除 |
| Announcements written as game hints | Real document format: issuer, number, date, addressee, body, seal, distribution list |
| Guidance copy decorated with metaphor and personification | Plain declarative sentences |
| Contrast frames in site copy (是…不是… / 是…而是…) | One positive clause per sentence; references/design-paradigms.md §3.14 |
| Orchestrator writes the pages itself | One subagent per workflow step; the orchestrator dispatches and reviews |

## References

- **references/design-paradigms.md**: six-dimension design paradigm (flow / puzzles / copy / typography / conflict / interaction) + 13-type puzzle taxonomy. Required reading at step 3.
- **references/project-structure.md**: multi-file front-end project structure + reference implementations for the search engine / password gates / skins / staging modules. Required reading at step 6.
