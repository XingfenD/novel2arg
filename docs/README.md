# novel2arg

[English](README.md) | [中文](README_zh.md)

An agent skill that adapts mystery/suspense novels into multi-page static web puzzle games disguised as real websites (ARG-lite).

## Installation

Send the repository URL to your agent (Claude Code / opencode / Codex, etc.) and say:

> Install this skill: https://github.com/XingfenD/novel2arg

The agent will place the repository in the appropriate skills directory.

## Usage

Tell your agent:

> Using this mystery novel ("..."), generate an interactive web puzzle game with the novel2arg skill.

## Contents

- `SKILL.md` — workflow router, project-root convention, and the six-item dispatch contract
- `workflow/` — eight step files: novel deconstruction → container choice + system assembly → GDD → reachability chain analysis → puzzle design audit → scaffolding → implementation → self-check
- `references/guardrails.md` — four constraints, canonical rules R1–R12 (the single home of every duplicated rule), prohibited forms, baseline rationalizations, red flags, exclusions
- `references/design-playbook.md` — step-2 module catalog (13 selectable design modules), core loop, 13-type puzzle taxonomy, copy rules
- `references/structure/base.md` — shared multi-file front-end base: module-marked directory tree + page skeleton
- `references/structure/components.md` — Alpine.js component reference implementations (keyword hash build, search engine, password gates, staging, reskin, progress)
- `references/structure/tooling.md` — check cadence, shared `tools/config.mjs` knobs, and the manual methods no static checker replaces
- `references/structure/form-website.md` — container A: fake official website (search hub, audience-scoped indexes, gates)
- `references/structure/form-system.md` — containers B/C/D: system fictions (account login, per-account access, desktop / simulated-internet / archive shells)
- `references/common-mistakes.md` — baseline-test traps grouped by workflow step; each step file cites its section
- `examples/` — artifact-shape excerpts for steps 1/3/4/5 + a filled dispatch-prompt sample
- `assets/tools/` — dependency-free Node files copied into each project: `config.mjs` (shared conventions every checker imports; the one file a renamed project edits), `hash.mjs`, `build-keywords.mjs`, `check-links.mjs`, `check-solvable.mjs`, `check-credentials.mjs` (composite/derived credentials: parts + rule + zero-plaintext), `check-reachability.mjs` (rehearsal reachability build), `vendor-alpine.mjs` — with `check-solvable.mjs --self-test` for the text matcher
- `scripts/check-docs.mjs` — repo self-check (paths, § citations, rule IDs, links, orphans), run by CI (`.github/workflows/ci.yml`)
- `docs/CHANGELOG.md` — change log (English + Chinese per entry)
- `LICENSE` / `LICENSE.docs` — dual license: MIT for code & tooling, CC BY-SA 4.0 for docs & prompt content
- `docs/USAGE.md` / `docs/USAGE_zh.md` — responsible-use notice in English and Chinese (adapting copyrighted novels, deception boundaries); a policy statement, not part of the licenses

## License

Dual-licensed:

- Code & tooling (executable files): [MIT](../LICENSE)
- Docs & prompt content: [CC BY-SA 4.0](../LICENSE.docs)

Outputs you generate with this skill are yours and are not covered by either license.
Before adapting a novel or publicly deploying a game, read [docs/USAGE.md](USAGE.md)
([中文版](USAGE_zh.md)):
adapting a copyrighted novel requires the rightsholder's permission, and outputs must
never be used for phishing, impersonation of real organizations, or defamation.
