![novel2arg — turn a novel into a puzzle website](assets/banner.webp)

# novel2arg

[English](README.md) | [中文](README_zh.md)

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
- `workflow/` — the eight step files
- `references/guardrails.md` — four constraints, canonical rules R1–R12, prohibited forms, red flags
- `references/design-playbook.md` — six-dimension design paradigm + 13-type puzzle taxonomy
- `references/structure/` — the shared front-end base, Alpine component implementations, container forms, and tooling conventions
- `references/common-mistakes.md` — baseline-test traps grouped by workflow step
- `examples/` — artifact-shape excerpts for steps 1/3/4/5 + a filled dispatch-prompt sample
- `assets/tools/` — dependency-free Node checkers copied into every generated project
- `scripts/check-docs.mjs` — this repo's own docs self-check, wired into CI
- `docs/` — full documentation, changelog, and the responsible-use notice

## Requirements

Node.js 20+ runs the checker tools. The generated game itself is plain static HTML/CSS/JS with a vendored, sha256-verified Alpine.js — no build step; host it as-is (GitHub Pages works).

## License and responsible use

Dual-licensed: code and tooling under [MIT](LICENSE), docs and prompt content under [CC BY-SA 4.0](LICENSE.docs). Outputs you generate with this skill are yours.

Before adapting a copyrighted novel or deploying a game publicly, read [docs/USAGE.md](docs/USAGE.md) ([中文](docs/USAGE_zh.md)): adapting a copyrighted novel requires the rightsholder's permission, and outputs must never be used for phishing, impersonation of real organizations, or defamation.

## Documentation

- Full documentation: [docs/README.md](docs/README.md) ([中文](docs/README_zh.md))
- Changelog: [docs/CHANGELOG.md](docs/CHANGELOG.md)
- Responsible use: [docs/USAGE.md](docs/USAGE.md) ([中文](docs/USAGE_zh.md))
