# Step 2 — Choose the Container and Assemble the System

Stays with the orchestrator: this step asks the user, then writes `docs/system-profile.md`.

**Input:** `docs/deconstruction.md`. **Output:** `docs/system-profile.md` — the assembly record every later
step reads. It carries no plot.

## 1. Pick the primary container

Unless the user has already specified a format, guide them through the four containers below plus a
recommendation based on the novel's traits, listed first and marked "(recommended)". If a question tool is
available, ask once and wait for the decision; otherwise proceed with the recommendation and mark the profile
"container is a recommendation pending confirmation."

| Container | Player fantasy | Central interaction | Routing conditions (novel traits) |
|---|---|---|---|
| **A Fake official website** | "I'm hacking into an organization's website." | The site's own IA plus the modules selected below | A single organization is the stage (restaurant / company / school / church); the secret hides in pages that should stay private; a missing-person or cover-up investigation |
| **B Fake computer desktop** | "I've obtained someone else's computer." | Desktop icons + app pages (chat / email / cloud drive / calendar) | A viewpoint character can plausibly access someone's device; clues scatter across multiple "apps"; progression depends on dense password gates |
| **C Simulated internet** | "I'm doing internet archaeology on a vanished person." | Multiple independent "websites" (forum / blog / Wayback Machine / intranet) cross-linked, with hand-typed URLs | A long time span (years of diaries / yearly blogs); clues spread across platforms; the fiction can break the fourth wall |
| **D Archive system** | "I'm opening a sealed case file." | Query form (name / ID / date) → archive list → detail pages, each opening only to the account it names | The novel is primarily document-driven (case files / medical records / interrogation transcripts / household registry); cold bureaucratic narration; the investigator is a police officer / journalist / lawyer |

**Routing order.** Primary information carrier: chat logs and files → B; documents and archives → D; website
pages → A; cross-platform fragments → C. The player's narrative role must plausibly access the container — if
not, add an entry page explaining how it was obtained (borrowed / inherited / hacked / officially requested).
Mixing is allowed: one secondary container may nest inside the primary; nesting depth is one level.

## 2. Select the design modules

The container fixes the native reach model (A: search + gates; B/C/D: account login + per-account access);
every further mechanic is a module from `references/design-playbook.md` §2 — reskin, forbidden-word state,
progress numbering, collection carrier, endings, staging, telemetry. Select with the user, recommendation
first; do not enable a module the fiction does not use, and do not ship account furniture in a story without
identities. Ask explicitly about the reskin (M5): does the story want a visible impact when the player crosses
into the secret layer, or does the system never show a seam? Either answer is valid — record it, and only offer
a dramatic access-level restyle if the fiction supports it. Sensory requirements (M12) are declared only when
the site really implements them (headphones, mouse, light).

## 3. Write `docs/system-profile.md`

```text
# System Profile
- Container: A/B/C/D (+ nested secondary) and why
- Fiction: system type, organization, era, language, register
- Reach model: selected modules (M1…M13) and what crosses depth (search / gate / account / typed URL)
- Presentation: reskin, forbidden state, numbering, collection carrier — each yes/no
- Wrappers: entry page, endings, fourth-wall close, world texture — each yes/no
- Interaction: staged effects, fake interactions, sensory, telemetry — each yes/no
- Shell IA: top bar items, directory layout, page root, site roots (C); base pages every such system has
- Index/access convention: per-audience tables (A) or one index + the account matrix (B/C/D)
- Infrastructure: base.md sections, components.js, vendored Alpine, tools/, checker CONFIG knobs
- Open questions for the user
```

Whichever container is chosen, its form doc is required reading for steps 3 and 6:
`references/structure/form-website.md` (A) or `references/structure/form-system.md` (B/C/D).

Baseline-test traps for this step: `references/common-mistakes.md` §2 — check them before returning the artifact.
