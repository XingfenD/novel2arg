# Step 2 — Select the World Container

Stays with the orchestrator: this step asks the user a question.

**Input:** `docs/deconstruction.md`. **Output:** a record on the GDD cover page.

Unless the user has already specified a format, guide them through the choice. Present the four containers below plus a recommendation based on the novel's traits, listed first and marked "(recommended)". If a question tool is available, ask once and wait for the decision; otherwise proceed with the recommendation and mark the GDD cover page "container is a recommendation pending confirmation."

| Container | Player fantasy | Central interaction | Routing conditions (novel traits) |
|---|---|---|---|
| **A Fake official website** | "I'm hacking into an organization's website." | Site-wide search box: keyword → hash lookup → hidden page | A single organization is the stage (restaurant / company / school / church); the secret hides in pages that should stay private; a missing-person or cover-up investigation |
| **B Fake computer desktop** | "I've obtained someone else's computer." | Desktop icons + Spotlight search + simulated app pages (chat / email / cloud drive / calendar) | A viewpoint character can plausibly access someone's device; clues scatter across multiple "apps"; progression depends on dense password/2FA gates |
| **C Simulated internet** | "I'm doing internet archaeology on a vanished person." | Multiple independent "websites" (forum / blog / Wayback Machine / intranet) cross-linked, with hand-typed URLs | A long time span (years of diaries / yearly blogs); clues spread across platforms; requires breaking the fourth wall (real social media / external links) |
| **D Archive system** | "I'm opening a sealed case file." | Query form (multiple fields: name / ID / date) → archive list → detail pages, unlocked by the account that owns the clearance (references/structure/form-system.md §1) | The novel is primarily document-driven (case files / medical records / interrogation transcripts / household registry); cold bureaucratic narration; the investigator is a police officer / journalist / lawyer |

**Routing order.**

1. What is the novel's primary information carrier? Chat logs and files → B. Documents and archives → D. Website pages → A. Cross-platform fragments → C.
2. Can the player's narrative role plausibly access that container? If not, add an entry ritual page explaining how it was obtained (borrowed / inherited / hacked / officially requested).
3. Mixing is allowed. The primary container sets the tone and one secondary container may nest inside it — a fake company site inside B's computer, a hospital intranet built as a type-D archive system inside C. Nesting depth is one level maximum.

Whichever container is chosen, its form doc is required reading for steps 3 and 6: `references/structure/form-website.md` (A) or `references/structure/form-system.md` (B/C/D).

**Record on the GDD cover page:** primary container, central interaction implementation (A/B: search engine in references/structure/base.md §4; C: cross-site hard links plus obfuscated directory names; D: §5 `gate.js` multi-field gate plus archive list page), secondary container and its nesting location.
