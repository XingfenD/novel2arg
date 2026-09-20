# Form — Fake Official Website (Container A)

For games where the player infiltrates an organization's public website: reach is differentiated by
**search + gates**, not by accounts. Read `references/structure/base.md` first; this file adds the
website layer on top of the shared base.

## 1. Structure

```
<game-name>/
├── index.html                    # Entry ritual page: disclaimer + role assignment + rules + start button
├── search.html                   # Search results page — the hub
├── pages/
│   ├── surface/                  # Surface pages (light skin, the facade)
│   ├── platform/                 # Mid-layer functional pages (login / posts / system pages; optional)
│   ├── secret/                   # Secret pages (dark skin; filenames must not spoil)
│   └── endings/
├── data/
│   ├── keywords.surface.src.json # Plaintext surface index (development only)
│   ├── keywords.secret.src.json  # Plaintext secret index (development only)
│   ├── keywords.surface.json     # Surface hash table — never contains a pages/secret/ url
│   ├── keywords.secret.json      # Secret hash table, fetched only by secret-layer pages
│   └── forbidden.json            # Forbidden word table (hashes + forbidden-state copy)
└── …
```

## 2. Access model

No accounts. Every hidden page is reached by keyword search or a gate:

- Surface and platform pages mount the search component with `data-index="data/keywords.surface.json"`;
  secret-layer pages point `data-index` at the secret table (references/structure/base.md §4). Layer scoping is
  required — one flat index turns the search box into a walkthrough.
- A surface keyword routes to a surface or platform page, or to a gate — never straight into a secret
  document. Classified results show `[Access denied]` or resolve to their clearance gate.
- Gates are Shape A/B (references/structure/base.md §5); the credential triad applies (account clue on page A,
  password clue on page B, gate on page C).

## 3. IA rules

Nav bar, index and listing pages, sitemap, and footer links carry clue delivery alongside search. Every
link exists because that organization would publish it; no page carries a "related files / archives" link
into a deeper layer (workflow/04-reachability.md audits this). Result titles are catalog entries, not plot
summaries.

## 4. Intranet sub-area

If the fiction includes a staff intranet or an admin area, that island uses the system-form pattern:
account login + per-account access (`references/structure/form-system.md`).
