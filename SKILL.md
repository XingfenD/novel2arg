---
name: novel2arg
description: Use when adapting a mystery/suspense novel into an interactive web puzzle game (ARG-lite), or when the user asks for a web puzzle site, an interactive novel adaptation, a puzzle website, or a mystery-novel game adaptation. Also use when such a project drifts toward a single-file SPA, canvas scene engine, inventory-based adventure UI, generic puzzle framework, or random passwords, even when told to "keep it simple" or that an engine was already scaffolded.
---

# novel2arg: Mystery Novel → Interactive Web Puzzle Game

## Overview

Adapt a mystery/suspense novel into a multi-page static puzzle game disguised as a real website (ARG-lite).
Success criterion: the player feels they are infiltrating a real website and uncovering material they are not supposed to see, rather than playing a game.

Three constraints (violating any one departs from this paradigm):

1. **The site is the world**: each narrative location is a standalone HTML page — a document the player can open and select text in independently. The URL bar is a narrative device; long-form copy lives in real page text, not in canvas.
2. **Two-layer narrative**: a surface layer (mundane, warm, realistic) and a secret layer (dark truth), with separate skins and copy per layer; the conflict is revealed through five escalating stages.
3. **Puzzles are character inference**: every password/keyword must be derivable from a character's life traces (birthday, initials, license plate, in-group slang). Random strings are prohibited.

**Prohibited forms of Constraint 1** (any one constitutes a structural departure):

- A single `index.html` shell with JS scene switching (a generic adventure engine); canvas scene rendering; hotspot maps
- Inventory / evidence tray / player notebook "game framework UI"
- A unified puzzle framework engine (a `register(type, panel)`-style puzzle registry)
- A build step that bundles the multi-page site back into a single-file dist
- Alpine.js (or any utility library) driving a single-page shell, `x-show` scene switching, or a puzzle registry engine — Alpine manages in-page component lifecycle only

## Rationalizations (observed in baseline tests; rationalization → counter)

| Rationalization | Counter |
|---|---|
| "We're short on time — one HTML file is enough." | Cut content volume (fewer pages/puzzles), not structure. A single file falls outside the paradigm. |
| "Don't start over; the engine layer is frozen." | A generic game framework scaffold is not a fake website. Migrate the content layer as-is and replace the engine with multi-page + search/gate. |
| "Well-known puzzle games use this architecture." | Popularity does not imply fit for this paradigm. Those games optimize mechanical puzzle feel; this paradigm optimizes fake-website immersion. The two architectures are not interchangeable. |
| "A single file is easier to distribute." | Static hosting (GitHub Pages) costs nothing; publish `src/` directly. |
| "Generate passwords randomly now; fix them later." | Password-as-character-inference is the puzzle quality itself; there is no "later." |

## Red Flags — stop and revise the GDD

- Only one HTML file exists in the project
- Canvas scene rendering, an inventory, or a puzzle registry engine appears
- Passwords are random strings with no derivable source in page copy
- Only one visual theme exists
- "Let's get a demo running first"

## When not to use

- Non-mystery, non-horror premises (the "mundane surface vs. dark secret layer" contrast is a prerequisite)
- Non-web delivery (Unity / mobile game / visual novel engine)
- Pure interactive fiction without puzzles (no puzzle system required)

## Workflow

Execute the steps in order; complete each step before starting the next.

### 1. Deconstruct the novel

Extract five tables: **character network** (per character: surface identity / secret identity / life traces), **timeline** (story order vs. player discovery order; the two must differ), **evidence document inventory** (documents that can be realistically mocked: diaries, medical records, contracts, bank statements, chat logs, court rulings), **surface/secret contrast matrix** (the secret-layer reversal for each surface entity), and **twist ordering** (in player discovery order, marking the central twist page).

### 2. Select the world container (guided routing)

**Unless the user has already specified a format, guide the user through the choice**: present the four containers below plus your recommendation based on the novel's traits (listed first, marked "(recommended)"). If a question tool is available, ask once and wait for the user's decision; otherwise proceed with the recommendation and mark the GDD cover page "container is a recommendation pending confirmation."

| Container | Player fantasy | Central interaction | Routing conditions (novel traits) |
|---|---|---|---|
| **A Fake official website** | "I'm hacking into an organization's website." | Site-wide search box: keyword → hash lookup → hidden page | A single organization is the stage (restaurant / company / school / church); the secret hides in pages that should not be public; a missing-person or cover-up investigation |
| **B Fake computer desktop** | "I've obtained someone else's computer." | Desktop icons + Spotlight search + simulated app pages (chat / email / cloud drive / calendar) | A viewpoint character can plausibly access someone's device; clues are scattered across multiple "apps"; progression depends on dense password/2FA gates |
| **C Simulated internet** | "I'm doing internet archaeology on a vanished person." | Multiple independent "websites" (forum / blog / Wayback Machine / intranet) cross-linked, with hand-typed URLs | A long time span (years of diaries / yearly blogs); clues spread across platforms; requires breaking the fourth wall (real social media / external links) |
| **D Archive system** | "I'm opening a sealed case file." | Query form (multiple fields: name / ID / date) → archive list → detail pages, unlocked by clearance level | The novel is primarily document-driven (case files / medical records / interrogation transcripts / household registry); cold bureaucratic narration; the investigator is a police officer / journalist / lawyer |

Routing order: (1) What is the novel's primary information carrier? Chat logs + files → B; documents and archives → D; website pages → A; cross-platform fragments → C. (2) Can the player's narrative role plausibly access that container? If not → add an entry ritual page explaining how it was obtained (borrowed / inherited / hacked / officially requested). (3) Mixing is allowed: the primary container sets the tone, and one secondary container may be nested (e.g., a fake company site inside B's computer; a hospital intranet built as a type-D archive system inside C). Nesting depth is one level maximum.

After selection, record on the GDD cover page: primary container, central interaction implementation (A/B: search engine in references/project-structure.md §4; C: cross-site hard links + obfuscated directory names; D: §5 `gate.js` multi-field gate + archive list page), secondary container and its nesting location.

### 3. Write the GDD (Game Design Document)

Must include: **numbered page map** (each page gets an `NN/total` progress number + unlock source), **gate inventory** (each gate follows the "credential triad": account on page A, password clue on page B, gate on page C), **puzzle allocation table** (select 5–10 gates/puzzles from the 13 types in references/design-paradigms.md §2; sensory puzzles must declare hardware requirements in advance), **dual-ending plan** (ending copy reuses knowledge from documents the player has just read), and **extra atmosphere page list** (explicitly marked non-progression).

### 4. Scaffold

Create the multi-file project strictly according to references/project-structure.md. Minimum structure = entry ritual page + surface page directory + secret page directory + three skin CSS files + vendored Alpine runtime + `components.js` (search / gate / staging / progress components) + keyword hash build script + dual ending pages. Pages remain separate documents with real navigation; Alpine manages in-page component lifecycle (`init()` / `destroy()`) only, never routing or scene switching.

### 5. Implementation order

Surface skin and realistic document pages → search engine and password gates (first complete one shortest playable path) → secret pages and reskinning → staging modules (countdown blackout / typewriter / scroll reveal) → endings and fourth-wall close → entry ritual page (rules, hardware requirements, and honor agreement last, since they must reflect the actual gameplay).

### 6. Self-check (all items must pass)

- **Structure check**: `find . -name "*.html" | wc -l` should be 10+; the deliverable is a multi-HTML file tree, not a single-shell app
- **Alpine lifecycle**: every page loads the vendored runtime and `components.js`; interactive elements mount via `x-data`; timers/observers are released in `destroy()`; the console shows zero Alpine errors and zero 404s
- **Solvability walkthrough**: play from the entry page through the GDD page map manually; every keyword/password must be traceable to prior page copy
- **Dead-link check**: `grep -o 'href="[^"]*"' -r . | sort -u` verified against the file tree
- **Spoiler prevention**: the keyword table is hashed (not reversible from source); filenames are non-spoiling (passwords must not appear in filenames unless "URL as prop" is intentional)
- **Complete feedback**: search misses / wrong passwords return narrative-hinting copy; no bare `alert("error")`
- **Persistent top bar**: the header (or top menu bar) stays fixed to the viewport on long pages; body text scrolls beneath it
- **Mobile**: core interactions work at phone width; sensory puzzle hardware requirements are declared on the entry page

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

## References

- **references/design-paradigms.md**: six-dimension design paradigm (flow / puzzles / copy / typography / conflict / interaction) + 13-type puzzle taxonomy. Required reading when writing the GDD.
- **references/project-structure.md**: multi-file front-end project structure + reference implementations for the search engine / password gates / skins / staging modules. Required reading when scaffolding.
