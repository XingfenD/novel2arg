# novel2arg

An agent skill that adapts mystery/suspense novels into multi-page static web puzzle games disguised as real websites (ARG-lite).

## Installation

Send the repository URL to your agent (Claude Code / opencode / Codex, etc.) and say:

> Install this skill: https://github.com/XingfenD/novel2arg

The agent will place the repository in the appropriate skills directory.

## Usage

Tell your agent:

> Using this mystery novel ("..."), generate an interactive web puzzle game with the novel2arg skill.

## Contents

- `SKILL.md` — paradigm constraints, rationalizations, red flags, and the workflow router
- `workflow/` — eight step files: novel deconstruction → world container selection → GDD → reachability chain analysis → puzzle design audit → scaffolding → implementation → self-check
- `references/design-paradigms.md` — six-dimension design paradigm (flow / puzzles / copy / typography / conflict / interaction) + 13-type puzzle taxonomy
- `references/project-structure.md` — multi-file front-end project structure + Alpine.js component reference implementations (search engine, password gates, staging, progress)
- `assets/tools/` — four dependency-free Node scripts copied into each project: `hash.mjs`, `build-keywords.mjs`, `check-links.mjs`, `check-solvable.mjs` — CONFIG-driven for renamed projects, with `check-solvable.mjs --self-test` for the text matcher
