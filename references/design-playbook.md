# Design Modules — Catalog & Assembly (Prescriptive)

> The step-2 menu. Select the modules the story actually needs, then assemble them into
> `docs/system-profile.md` (`workflow/02-container.md`). Default: the container's native reach model plus the
> entry page; every further module must earn its place in the fiction. Rule IDs `(Rn)` cite
> `references/guardrails.md`; section citations use the form `§N.M` = item M of section N. Component implementations:
> `references/structure/components.md`.

## 1. Core loop (always on)

- **Master formula**: entry ritual page → disguised container → core loop (read → extract → unlock) → surface
  crack → staged escalation into the secret layer → central twist page → finale → ending.
- **Five-stage escalation**: (1) in the name of service → (2) systemic evil → (3) human gray → (4) the player's
  guilt → (5) the cycle points at the player.
- **Order by discovery**: twist points follow player discovery order, not story chronology (`workflow/01-story-intake.md`);
  motive documents come last, reframing "defeat the monster" as "understand the monster".
- **The page can be a character** (highest-order device): the site is built in-world by a character (the
  killer's own official website / the missing person's final task) — browsing is itself plot.

## 2. Module catalog (pick with the user at step 2; record each pick in `docs/system-profile.md`)

| # | Module | What it gives | Select when | Reference |
|---|---|---|---|---|
| M1 | Search index | hashed keyword → hidden page, exact match with synonym aliases; catalog result titles (R9) | the organization would have a search surface; keyword discovery fits the story | `references/structure/components.md` §1–§2 |
| M2 | Password gates | credential triad (clue page A → clue page B → gate page C); verbatim or derived credentials | documents, rooms, or accounts are locked | `references/structure/components.md` §3 |
| M3 | Account login | session login + per-account access; the native reach model of containers B/C/D | the fiction really has identities and a login (intranet, case system, desktop) | `references/structure/form-system.md` |
| M4 | Address-bar props | hand-typed or obscure URLs as the route; the URL itself is a clue | era-flavored archaeology (container C) | — |
| M5 | Layer reskin | whole-page visual switch on crossing over: background, title, logo, footer | ask the user — the story may not want the impact; without it the layers differ by pages and copy only | `references/structure/components.md` §5 |
| M6 | Forbidden-word state | one term triggers a full-page shift | the fiction has a taboo word | `references/structure/components.md` §2 |
| M7 | Progress numbering | `NN/total` footer; anomalous `ex/total` on deep pages | the player needs a soft map of the site; numbers suggest order, never lock it | `references/structure/base.md` §2 |
| M8 | Collection carrier | notebook / evidence wall / map as an in-world page or app | the plot is a collection; keep the carrier inside the fiction (R1) | — |
| M9 | Entry ritual page | role assignment + start; rules only where the fiction needs them (headphones, external search) | any game with a role frame; keep the copy light, no implementation notes | — |
| M10 | Endings | dual moral-choice ending reusing just-read documents; fourth-wall close + author link | the story carries a dilemma; a single ending is fine otherwise | `workflow/03-gdd.md` |
| M11 | World texture | atmosphere pages off the critical path, an epigraph at the deepest point, easter eggs | the world needs texture; no need to label pages as carrying no progress | — |
| M12 | Interaction staging | countdown blackout, typewriter, scroll reveal, fake interactions; sensory puzzles with declared hardware | the system's reactions should carry weight | `references/structure/components.md` §4 |
| M13 | Telemetry | search terms + page-view counts | difficulty iteration on real friction data is wanted | — |

## 3. Puzzle types (choose 5–10 as a set)

**Iron rule: a password is character inference.** Every credential is a character's life trace (birth year
derived from a zodiac year, child's birthday, initials, license plate, employee ID). The process of finding a
password is the process of understanding a character.

| Type | Mechanism |
|---|---|
| A Keyword search gate | Literal term → hash lookup → hidden page; synonym/alias tolerance; one keyword can return multiple results. A hit the visitor may not open resolves to its gate or a locked notice (M1/M2), never the document |
| B Cross-page credential delivery | **Three elements: account on page A, password clue on page B, gate on page C** — the minimum puzzle unit. The credential may be *derived* (account = pinyin initials + license-year, password = entry year), assembled from parts rather than printed whole; prove it with `tools/check-credentials.mjs`, never by printing it (`references/structure/components.md` §3) |
| C Password hidden in URL | Filename/path is the credential (`passwordisXXX.html`); the address bar becomes a narrative prop; use sparingly — it spoils the reveal |
| D Classical cryptography | Polybius square, Morse (audio dots/dashes at 1:3), book cipher (page-line); presented on the page, verified client-side |
| E Sensory puzzles | Stereo channel separation (headphone requirement declared on the entry page), click counting, flashlight mask (radial-gradient + cursor tracking) |
| F Visual concealment | Black-on-black text revealed by selection (`::selection` color change), CSS blur redaction (the redaction itself is a clue), same-color invisible links, text hidden inside images |
| G Document contradiction inference | Make documents contradict each other: a compliance conclusion vs. red-flagged line items, stated purpose vs. itinerary endpoint, commendation text vs. later identity, pages interlocked by the same date. The page states both figures and leaves the contradiction to the reader |
| H Credential combination login | Multi-field validation (campus + name + department + bed number), URL whitelist (the fake Wayback Machine accepts only one domain) |
| I Knowledge-search tutorial | On a wrong answer, prompt "search the web for it" — teaches the player an external search engine (a core ARG skill) |
| J Emotional/narrative puzzles | Psychological questionnaires, branching dialogue; no right or wrong, only choices; the finale may ask the player for the real-world time |
| K Forbidden-word trigger | A specific word triggers a full-page horror shift (M6); the search box becomes Russian roulette |
| L Staging type | Post-unlock countdown blackout ("the system has noticed you"), typewriter deletion and retyping, scroll-to-bottom pseudo-navigation ("depart now") (M12) |
| M Meta-game easter eggs | `ex` page collection (the author page reveals the total), invisible links rewarding DOM inspectors, external links that break the fiction/reality boundary (M11) |

**Difficulty is paced by copy hints.** Client-side puzzles are always bypassable; mitigate with a hashed
keyword table (blocks winning by reading source) and non-spoiling filenames. The disguise, not the lock, is the
product (R4).

## 4. Copy rules (core)

1. **Surface layer: aggressively mundane** — warm, bureaucratic, or marketing register; mundanity is the disguise.
2. **Secret layer: zero adjectives, cold documents** — a murder recorded as a ledger (name | date | note: confirmed by X); a tragedy recorded as a medical chart (chief complaint / history / dosage). Horror comes from the bureaucratic register.
3. **Repetition visualizes obsession** — one sentence hand-copied 21 times; 67 repetitions of a prayer forming a wall; one name appearing 10 times in transaction records.
4. **Jargon lexicon**: the secret layer has its own terminology (offering = sacrifice, pilgrim = prey); learning the jargon is itself the hidden progress bar.
5. **Dual-phrasing contrast**: the same fact stated two ways, one per layer; the player assembles the reveal.
6. **Everyday life carries the puzzles**: password material must first be a genuine life trace (a child-photo post date = password; a "my zodiac year" message = birth-year inference) (R3).
7. **Absence is more frightening than presence**: a thread frozen at "Hi, are you still there?"; `[This content has been deleted]`; a dead-man's-switch email.
8. **Simulated noise**: spam mail, error JSON, `report_FINAL_v2_actually_final.pdf`, low-effort replies ("bump") — useless information builds human texture.
9. **Failure messages are copy slots**: `密码错误 🎂` hints at the source and stops; a bare "error" is prohibited (R4).
10. **A compact epigram states the theme**: one epigrammatic couplet summing up the story's causal logic, placed at the deepest point.
11. **Two voices**: in-world text (pages, documents, notices, error copy) is written for the site's own audience. Guidance text (entry page, hardware requirements) addresses the player in plain declarative sentences, carries no answer and no implementation notes.
12. **Neutral surface pages**: pages carrying no clue are written in full anyway. A staff roster lists every employee with title, tenure, and duties, including the ones who matter; nothing on a public page acknowledges the plot (R5).
13. **Document format is the realism**: an announcement reads as an announcement — issuing body, document number, date, addressee, body, signature and seal, distribution list. A contract carries parties, clauses, amounts, dates, seals (R6).
14. **Declarative sentences**: copy states what is there, once. Contrast frames (是…不是… / 是…而是… / 不能…只能… / 并非…而是…) and personification read as essay voice, thin out the document register, and are a recognizable machine-writing tell. Where a page needs to exclude something, exclude it in its own plain sentence.
    - Before: 这里没有随机密码，每一把钥匙都是某个人一生留下的痕迹。
    - After: 每一个密码都出自站内某个人留下的生活痕迹：生肖、工号、纪念日。
    - Before: 春水楼不会消失，它只是深吸一口气。
    - After: 2020 年春季恢复营业，具体时间另行公告。
