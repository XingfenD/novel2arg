# Six-Dimension Design Paradigm for Web Puzzle Games (Prescriptive)

> Companion to SKILL.md and project-structure.md: use as a checklist when writing the GDD.

## 1. Flow Design

- **Master formula**: entry ritual page → disguised container → core loop (read → extract proper nouns → search/enter → unlock hidden page) → surface crack → five-stage escalation into the secret layer → central twist page → finale staging → two-way ending choice → fourth-wall close + sequel hook.
- **Entry ritual page** is separate from the game proper: disclaimer + role assignment ("You are X; your brother has gone missing" / "You play yourself") + rules (search limits / wear headphones / no-F12 honor agreement) + start button.
- **Single navigation hub**: one search box carries hidden-page discovery, layered on the site's own navigation (nav bar, index/listing pages, sitemap); keywords can only be "copied" from page copy, which naturally forms a page reference graph. A link exists because that organization would publish it; the reachability audit in workflow/04-reachability.md checks every one. Search uses exact matching (synonym aliases allowed) to force close reading.
- **Five-act pacing**: (1) safe-zone tutorial (3–8 surface pages teaching the core loop; the first page must return search results) (2) first crack (an unanswered distress post / a deleted folder / a discontinued announcement) (3) secret layer revealed (full-site reskin after login) (4) central twist page (4–5 side hooks released in one page) (5) finale ritual + choice.
- **Progress numbering**: static `NN/total` in each page footer; secret easter-egg pages use anomalous numbers such as `ex/total` or `?/total` as a meta-signal that the player has crossed into the other side. Numbers only suggest the ideal order; they do not lock progression. The actual gating is password gates.
- **Extra atmosphere pages** are explicitly declared "non-progression" in the entry rules, preventing players from exhausting their patience in dead ends.
- **Dual endings**: ending options reuse knowledge the player has just learned from documents (two variants of the ritual / two answers on the questionnaire) — the final puzzle is whether the player understood the story. After the ending, link the author's real social account, dropping the player from immersion back to reality.

## 2. Puzzle Taxonomy (13 types; choose 5–10 as a set)

**Iron rule: a password is character inference.** Every credential is a character's life trace (birth year derived from a zodiac year, child's birthday, initials, license plate, employee ID). The process of finding a password is the process of understanding a character.

| Type | Mechanism |
|---|---|
| A Keyword search gate | Literal term → hash lookup → hidden page; synonym/alias tolerance; one keyword can return multiple results |
| B Cross-page credential delivery | **Three elements: account on page A, password clue on page B, gate on page C** — the minimum puzzle unit |
| C Password hidden in URL | Filename/path is the credential (`passwordisXXX.html`); the address bar becomes a narrative prop; use sparingly — it spoils the reveal |
| D Classical cryptography | Polybius square, Morse (audio dots/dashes at 1:3), book cipher (page-line); the puzzle is presented on the page, verified client-side |
| E Sensory puzzles | Stereo channel separation (headphone requirement must be declared on the entry page), click counting, flashlight mask (radial-gradient + cursor tracking) |
| F Visual concealment | Black-on-black text revealed by selection (`::selection` color change), CSS blur redaction (the redaction itself is a clue), same-color invisible links, text hidden inside images |
| G Document contradiction inference | Make documents contradict each other: a compliance conclusion vs. red-flagged line items, stated purpose vs. itinerary endpoint, commendation text vs. later identity, multiple pages interlocked by the same date. The page states both figures and leaves the contradiction to the reader |
| H Credential combination login | Multi-field validation (campus + name + department + bed number), URL whitelist (the fake Wayback Machine accepts only one domain) |
| I Knowledge-search tutorial | On a wrong answer, prompt "search the web for it" — teaches players to use an external search engine (a core ARG skill) |
| J Emotional/narrative puzzles | Psychological questionnaires, branching dialogue; no right or wrong, only choices; the finale may ask the player for the real-world time |
| K Forbidden-word trigger | A specific word triggers a full-page horror reskin; the search box becomes Russian roulette |
| L Staging type | Post-unlock countdown blackout ("the system has noticed you"), typewriter deletion and retyping, scroll-to-bottom pseudo-navigation ("depart now") |
| M Meta-game easter eggs | `ex` page collection (the author page reveals the total), invisible links rewarding DOM inspectors, external links to real sites that break the fiction/reality boundary |

**Difficulty is paced by copy hints.** Client-side puzzles are always bypassable; mitigate with an honor agreement ("no F12 needed") + a hashed keyword table (blocks winning by reading source) + non-enumerable filenames.

## 3. Copy Design

1. **Surface layer: aggressively mundane** — warm, bureaucratic, or marketing register; mundanity is the disguise.
2. **Secret layer: zero adjectives, cold documents** — a murder recorded as a ledger (name | date | note: confirmed by X); a tragedy recorded as a medical chart (chief complaint / history / dosage). Horror comes from the bureaucratic register.
3. **Repetition visualizes obsession** — one sentence hand-copied 21 times; 67 repetitions of a prayer forming a wall; one name appearing 10 times in transaction records.
4. **Jargon lexicon**: the secret layer has its own terminology (offering = sacrifice, pilgrim = prey). Learning the jargon means descending into the secret layer; the lexicon itself functions as a hidden progress bar.
5. **Dual-phrasing contrast**: the same fact stated two ways, one per layer; the player assembles the reveal.
6. **Everyday life carries the puzzles**: password material must first be a genuine life trace (a child-photo post date = password; a "my zodiac year" message = birth-year inference).
7. **Absence is more frightening than presence**: a thread frozen at "Hi, are you still there?"; `[This content has been deleted]`; a dead-man's-switch scheduled email ("if this fired, you have already taken my place").
8. **Simulated noise**: spam mail, error JSON, `report_FINAL_v2_actually_final.pdf`, low-effort replies ("bump") — useless information builds a human texture.
9. **Failure messages are copy slots**: `Wrong password 🎂` (hints birthday), `- Use it wisely` (echoes a signature earlier); a bare "error" is prohibited. The hint points at the source and stops there.
10. **A compact epigram states the theme**: one epigrammatic couplet summing up the novel's causal logic, placed at the deepest point.
11. **Two voices**: in-world text (pages, documents, notices, error copy) is written for the site's own audience and stays inside that frame. Guidance text (entry ritual page, rules, hardware requirements, honor agreement) addresses the player in plain declarative sentences, carries no answer, and drops adjectives piled for effect, metaphor, and personification.
12. **Neutral surface pages**: pages carrying no clue are written in full anyway. A staff roster lists every employee with title, tenure, and duties, including the ones who matter; nothing on a public page acknowledges the plot.
13. **Document format is the realism**: an announcement reads as an announcement — issuing body, document number, date, addressee, body, signature and seal, distribution list. A contract carries parties, clauses, amounts, dates, seals. Format completeness carries the realism that adjectives claim to.
14. **Declarative sentences**: copy states what is there, once. Contrast frames (是…不是… / 是…而是… / 不能…只能… / 并非…而是…) read as essay voice, thin out the document register, and are a recognizable machine-writing tell. Where a page needs to exclude something, exclude it in its own plain sentence.
    - Before: 这里没有随机密码，每一把钥匙都是某个人一生留下的痕迹。
    - After: 每一个密码都出自站内某个人留下的生活痕迹：生肖、工号、纪念日。
    - Before: 春水楼不会消失，它只是深吸一口气。
    - After: 2020 年春季恢复营业，具体时间另行公告。
    - Before: 答案不在这一页，它在员工风采里。
    - After: 账号规则见行政办公室通知。

## 4. Typography Design

1. **Light/dark dual skins = narrative layering**: the surface is bright and realistic; the secret layer is near-black with blood-red accents; crossing into the secret layer reskins the whole page instantly (four signals: background, title, logo, footer).
2. **CSS domains**: `surface.css` / `platform.css` / `secret.css` mounted per directory, with no cross-pollution.
3. **Narrative palette**: the base color of the same container (e.g., a blog) fades as the plot progresses (fresh green → pink → gray → dull red); background color traces the character arc.
4. **Document realism kit**: A4 size (794×1123 px) + serif body + red letterhead and red stamp (`border:3px double #cc0000; rotate(-10deg); opacity:.8` overlay) + 2em first-line indent; handwritten signature = italic + negative letter-spacing + ink blue; photocopies get a rotated large watermark.
5. **Whitespace is pacing**: a `height:180px` spacer forces scrolling before the key red text appears — scroll = page turn = reveal; inview fade-ins let the player control reading speed.
6. **Skeuomorphic details**: frosted glass `backdrop-filter:blur()`, macOS traffic-light dots, Dock magnify easing `cubic-bezier(0.34,1.56,0.64,1)`; retro sites use gradient buttons + inset shadows + a visitor counter + serif type.
7. **Implicit result classification**: result item color encodes danger level (red = danger / blue = official / purple = private), unexplained.
8. **Micro-animations create unease**: an 8-second-cycle slight shake; dashed borders that look like torn paper; `blur(5px)` → unblurred after unlock.

## 5. Conflict Design

1. **Two-layer world matrix**: in the GDD, assign each surface entity a secret identity (philanthropist = demolition developer; model employee = money-laundering conduit) and specify a "bridging prop" (a contract / a photo together / a transaction record) that stitches the two layers.
2. **Five-stage escalation**: (1) in the name of service (cracks hide details) → (2) systemic evil (the post-reskin admin interface / deletion traces) → (3) human gray (the perpetrator was once saved; "love vs. the cost of love") → (4) the player's guilt (both finale options leave dirty hands or loss) → (5) the cycle points at the player ("will the next 404 be you?").
3. **Twist points follow player discovery order.** Story chronology stays in the deconstruction tables.
4. **Motive documents come last**: the diagnosis / diary sits in the final pages, reframing "defeat the monster" as "understand the monster."
5. **The page is a character** (highest-order device): the entire site is built in-world by a character (the killer's own official website / the final task left by a missing person) — the act of browsing is itself plot.

## 6. Interaction Design

1. **Three-state search feedback**: hit = link list (`target="_blank"`, opened in a new tab, preserving the "normal world" tab = dual reality); miss = a gentle apology maintaining the facade; forbidden word = full-page theme shift.
2. **Fake interactions block the direct path**: the front-door entrance pops "Temporarily closed"; the register button always alerts — rejection itself is guidance, forcing the player to find the search route.
3. **Read-only evidence scenes**: a settings page marked "locked" yet echoing the password in plaintext; fake pagination `javascript:void(0)`; `[deleted]` placeholders — unusable states are still narrative.
4. **Graded success feedback**: fade overlay / change `document.title` / unblur / redirect; vary per gate to avoid fatigue.
5. **Waiting is staging**: turn loading into a story beat (a 15-second countdown blackout after unlock; a 20-second character-by-character deletion and retyping).
6. **Enforced sensory mode**: the interaction method itself is a puzzle premise (headphones required, mouse movement required to light the scene); declare it on the entry page.
7. **Fourth-wall dial**: key credentials may point off-site (the author's real social account); the finale may ask the player for the real-world time; a "." character may link to real news — tune immersion depth by risk tolerance.
8. **Telemetry (optional)**: report search terms + page-view counts; iterate difficulty using real friction data.
9. **Inputs name the field**: `placeholder="Employee ID"`, `placeholder="Search the site"`. `placeholder="e.g. 1977"` and a help line under the box restating the clue both leak. Labels, placeholders, and empty states are the only UI copy the player reads while solving, so they stay descriptive. A gate page may post the account format ("account = full name in pinyin", as real intranets do); the password rule ("initial password = your birth year") stays off it.
