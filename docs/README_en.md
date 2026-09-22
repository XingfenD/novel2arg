![novel2arg — turn a novel into a puzzle website](../assets/banner.webp)

# novel2arg

[English](README_en.md) | [中文](README.md)

An agent skill that adapts mystery/suspense novels into multi-page static web puzzle games disguised as real websites (ARG-lite).

The player never sees a game. They open what looks like a real organization's website — a company intranet, an archive, a login portal — read its documents, search its index, and find the passwords hidden in its people's life traces. Realism is the product; every rule in this skill exists to protect it.

## What you get

- **A multi-page site, not an SPA.** Every narrative location is an independently openable HTML document, and the URL bar is part of the fiction. Single-file shells, canvas scenes, inventory UIs, and bundle-to-dist steps are prohibited by design (R1).
- **Puzzles that are character inference.** Every credential derives from a character's life traces — a zodiac year, an employee ID, an anniversary. Random strings are prohibited, and gate hashes ship without plaintext (R3).
- **A two-layer narrative.** A mundane surface layer and a dark secret layer with separate skins and copy; crossing over reskins the whole page (R2).
- **Pages written for their in-world audience.** Public pages publish only what that organization would publish; no page addresses the player or mentions the plot (R5, R6).
- **Proof before delivery.** Dependency-free Node checkers prove cold-start solvability, zero dead links, no layer leaks, credential provenance, and a full rehearsal playthrough.

## Install

Send the repository URL to your agent (Claude Code / opencode / Codex, etc.):

> Install this skill: https://github.com/XingfenD/novel2arg

The agent places the repository in the appropriate skills directory.

## Use

> Using this mystery novel ("..."), generate an interactive web puzzle game with the novel2arg skill.

The skill runs an eight-step workflow. Steps 4 and 5 gate scaffolding, and step 3 pauses for your review:

| # | Step | Deliverable |
|---|---|---|
| 1 | Deconstruct the novel | five tables |
| 2 | Select the world container (the skill asks you) | GDD cover-page record |
| 3 | Write the GDD | `docs/gdd.md` — your review checkpoint |
| 4 | Reachability chain analysis | `docs/reachability.md` — gate |
| 5 | Puzzle design audit | `docs/puzzle-audit.md` — gate |
| 6 | Scaffold | framework + every page skeletoned |
| 7 | Implement | the finished site |
| 8 | Self-check | `docs/self-check.md` |

## Repository map

- `SKILL.md` — workflow router, project-root convention, and the six-item dispatch contract
- `workflow/` — eight step files: novel deconstruction → world container selection → GDD → reachability chain analysis → puzzle design audit → scaffolding → implementation → self-check
- `references/guardrails.md` — four constraints, canonical rules R1–R12 (the single home of every duplicated rule), prohibited forms, baseline rationalizations, red flags, exclusions
- `references/design-playbook.md` — six-dimension design paradigm (flow / puzzles / copy / typography / conflict / interaction) + 13-type puzzle taxonomy
- `references/structure/base.md` — shared multi-file front-end base: directory tree + page skeleton
- `references/structure/components.md` — Alpine.js component reference implementations (keyword hash build, search engine, password gates, staging, skins, progress)
- `references/structure/tooling.md` — check cadence, shared `tools/config.mjs` knobs, and the manual methods no static checker replaces
- `references/structure/form-website.md` — container A: fake official website (search hub, layer-scoped indexes, gates)
- `references/structure/form-system.md` — containers B/C/D: system fictions (account login, per-account access, desktop / simulated-internet / archive shells)
- `references/common-mistakes.md` — baseline-test traps grouped by workflow step; each step file cites its section
- `examples/` — artifact-shape excerpts for steps 1/3/4/5 + a filled dispatch-prompt sample
- `assets/tools/` — dependency-free Node files copied into each project: `config.mjs` (shared conventions every checker imports; the one file a renamed project edits), `hash.mjs`, `build-keywords.mjs`, `check-links.mjs`, `check-solvable.mjs`, `check-credentials.mjs` (composite/derived credentials: parts + rule + zero-plaintext), `check-reachability.mjs` (rehearsal reachability build), `vendor-alpine.mjs` — with `check-solvable.mjs --self-test` for the text matcher
- `scripts/check-docs.mjs` — repo self-check (paths, section citations, rule IDs, links, orphans), run by CI (`.github/workflows/ci.yml`)
- `docs/CHANGELOG.md` — change log (English + Chinese per entry)
- `LICENSE` / `LICENSE.docs` — dual license: MIT for code & tooling, CC BY-SA 4.0 for docs & prompt content
- `docs/USAGE.md` / `docs/USAGE_en.md` — responsible-use notice, Chinese by default with an English translation (adapting copyrighted novels, deception boundaries); a policy statement, not part of the licenses

## Requirements

Node.js 20+ runs the checker tools. The generated game itself is plain static HTML/CSS/JS with a vendored, sha256-verified Alpine.js — no build step; host it as-is (GitHub Pages works).

## License and responsible use

Dual-licensed: code and tooling under [MIT](../LICENSE), docs and prompt content under [CC BY-SA 4.0](../LICENSE.docs). Outputs you generate with this skill are yours and are not covered by either license.

Before adapting a copyrighted novel or deploying a game publicly, read [USAGE_en.md](USAGE_en.md) ([中文](USAGE.md)): adapting a copyrighted novel requires the rightsholder's permission, and outputs must never be used for phishing, impersonation of real organizations, or defamation.

## Documentation

- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Responsible use: [USAGE_en.md](USAGE_en.md) ([中文](USAGE.md))
