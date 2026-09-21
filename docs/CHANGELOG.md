# Changelog

Higher versions on top. Each entry: English line, then Chinese line; entries separated by a blank line.

## Unreleased

- Merge the plot-blind / plot-aware scaffold split and the dual-license / USAGE notices into the restructured docs; the conflict resolution keeps both sides and updates every citation to the renamed reference files.
- 将脚手架 6a/6b 拆分与双许可 / USAGE 说明并入重构后的文档；冲突解决保留双方内容，并将所有引用更新为改名后的 reference 文件。

- Restructure references: rename `paradigm.md` → `guardrails.md` and `design-paradigms.md` → `design-playbook.md`; split `structure/base.md` into `base.md` (directory tree + page skeleton), `components.md` (Alpine component reference implementations), and `tooling.md` (check cadence, shared config, manual methods).
- 重构 references：`paradigm.md` 改名 `guardrails.md`、`design-paradigms.md` 改名 `design-playbook.md`；`structure/base.md` 拆分为 `base.md`（目录树+页面骨架）、`components.md`（Alpine 组件参考实现）、`tooling.md`（检查节奏、共享配置、人工方法）。

- Add canonical rule IDs R1–R12 in `guardrails.md` as the single home of every duplicated rule; workflow, reference, and example files now cite `(Rn)` instead of restating rules freely, and `workflow/08-self-check.md` becomes the single canonical deploy checklist (the duplicate list carried by the pre-split base.md is removed).
- 在 `guardrails.md` 增加权威规则编号 R1–R12，作为所有重复规则的唯一出处；workflow、reference、example 文件改为引用 `(Rn)`；`workflow/08-self-check.md` 成为唯一权威部署清单（删除拆分前 base.md 里的重复清单）。

- Add repo self-checks: `scripts/check-docs.mjs` (validates file paths, `§N`/`§N.M` citations, rule IDs, markdown links, orphan docs) wired into `.github/workflows/ci.yml` together with `check-solvable.mjs --self-test`.
- 新增仓库自检：`scripts/check-docs.mjs`（校验文件路径、`§N`/`§N.M` 引用、规则编号、markdown 链接、孤儿文档），与 `check-solvable.mjs --self-test` 一起接入 `.github/workflows/ci.yml`。

- Tools: extract the shared conventions into `assets/tools/config.mjs` (imported by both checkers and build-keywords, so a renamed project edits one file); add `assets/tools/vendor-alpine.mjs` (downloads the pinned Alpine runtime and verifies its sha256).
- 工具：共享约定抽到 `assets/tools/config.mjs`（两个检查器与 build-keywords 共同导入，项目改名只需改一处）；新增 `assets/tools/vendor-alpine.mjs`（下载固定版本 Alpine 运行时并校验 sha256）。

- Add `examples/` with artifact-shape excerpts for steps 1/3/4/5 plus a filled dispatch-prompt sample; SKILL.md turns the dispatch contract into a six-item checklist and records the output project-root convention.
- 新增 `examples/`：步骤 1/3/4/5 的产物形状示例与一份填好的派发 prompt 样例；SKILL.md 将派发契约改为六项清单，并记录产出项目根目录约定。

- Add a root `README.md` pointing at `docs/README*.md`; note in `common-mistakes.md` why the Step-2 section is intentionally absent.
- 新增根 `README.md` 指向 `docs/README*.md`；`common-mistakes.md` 说明步骤 2 小节为何刻意缺省。
