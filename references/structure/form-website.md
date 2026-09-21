# Form — Fake Official Website (Container A)

For games where the player infiltrates an organization's public website: the native reach model is
**search + gates** (modules M1/M2; rules R7–R9 in `references/guardrails.md`). Read
`references/structure/base.md` first; this file adds the website layer on top of the shared base.

## 1. Structure

The base tree, plus the website specifics:

- `search.html` — the hub (M1), mounted with the search component.
- Keyword tables named per audience: `data/keywords.surface.src.json` (public) and
  `data/keywords.secret.src.json` (deep) by default.
- Pages split by the fiction's own areas; the restricted area takes the fiction's word (`internal/`, `staff/`,
  `archive/`) — never a `secret/` directory. Point `CONFIG.secretUrl` at it (`references/structure/tooling.md` §2).

## 2. Access model

No accounts in this container (an intranet sub-area may nest the system form, §4). Every hidden page is reached
by keyword search (M1) or a gate (M2):

- Public pages mount the search component with `data-index="data/keywords.surface.json"`; deep pages point
  `data-index` at the deep table (`references/structure/components.md` §2). Audience scoping is required (R8) —
  one flat index turns the search box into a walkthrough.
- A public keyword routes to a public page or to a gate — never straight into a restricted document. A hit the
  visitor may not open resolves to its gate or a plain locked notice (R8).
- Gates are Shape A/B (`references/structure/components.md` §3); the credential triad applies (R3).

## 3. IA rules

Nav bar, index and listing pages, sitemap, and footer links carry clue delivery alongside search. Every link
exists because that organization would publish it (R7); no page carries a "related files / archives" link into a
deeper area (R7; `workflow/04-reachability.md` audits this). Result titles are catalog entries, not plot
summaries (R9).

## 4. Intranet sub-area

If the fiction includes a staff intranet or an admin area, that island uses the system-form pattern: account
login + per-account access (`references/structure/form-system.md`).
