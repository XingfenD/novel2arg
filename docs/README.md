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

- `SKILL.md` — workflow router and dispatch contract
- `workflow/` — eight step files: novel deconstruction → world container selection → GDD → reachability chain analysis → puzzle design audit → scaffolding → implementation → self-check
- `references/paradigm.md` — four constraints, prohibited forms, baseline rationalizations, red flags, exclusions
- `references/design-paradigms.md` — six-dimension design paradigm (flow / puzzles / copy / typography / conflict / interaction) + 13-type puzzle taxonomy
- `references/structure/base.md` — shared multi-file front-end base + Alpine.js component reference implementations (search engine, password gates, staging, progress)
- `references/structure/form-website.md` — container A: fake official website (search hub, layer-scoped indexes, gates)
- `references/structure/form-system.md` — containers B/C/D: system fictions (account login, per-account access, desktop / simulated-internet / archive shells)
- `references/common-mistakes.md` — baseline-test traps grouped by workflow step; each step file cites its section
- `assets/tools/` — four dependency-free Node scripts copied into each project: `hash.mjs`, `build-keywords.mjs`, `check-links.mjs`, `check-solvable.mjs` — CONFIG-driven for renamed projects, with `check-solvable.mjs --self-test` for the text matcher
- `LICENSE` / `LICENSE.docs` — dual license: MIT for code & tooling, CC BY-SA 4.0 for docs & prompt content
- `docs/USAGE.md` — responsible-use notice (adapting copyrighted novels, deception boundaries); a policy statement, not part of the licenses

## License

Dual-licensed / 双许可：

- Code & tooling (executable files) / 代码与工具：[MIT](../LICENSE)
- Docs & prompt content / 文档与提示词内容：[CC BY-SA 4.0](../LICENSE.docs)

Outputs you generate with this skill are yours and are not covered by either license.
Before adapting a novel or publicly deploying a game, read [docs/USAGE.md](USAGE.md):
adapting a copyrighted novel requires the rightsholder's permission, and outputs must
never be used for phishing, impersonation of real organizations, or defamation.
