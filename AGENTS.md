# AGENTS.md

## Safety Rules
- Dev branch naming: `{feat|fix|docs|chore}/{branch-name}` (e.g. `feat/file-tag-done`, `fix/tree-render`).
- Before `git commit`: run `git branch --show-current`. If on `master`, do NOT commit — ask user for a branch name (suggest one based on the changes, e.g. `docs/simplify-branch-workflow`), create it, commit there.
- General changes → `docs/CHANGELOG.md`; Higher versions on top.
ANGELOG entry format: same entry has English line then Chinese line on consecutive lines (no blank line between them); different entries are separated by a blank line.
- Docs prose (README, USAGE, …): one language per file, Chinese. The README and USAGE live in `docs/` (`docs/README.md`, `docs/USAGE.md`) — never at the repo root. No bilingual duplication inside a paragraph.

## Repo self-checks
- After editing any file in this repo, run `node scripts/check-docs.mjs` (file paths, `§N` citations, rule IDs, markdown links, orphan docs). CI (`.github/workflows/ci.yml`) runs it together with `node assets/tools/check-solvable.mjs --self-test`.
