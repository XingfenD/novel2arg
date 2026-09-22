# Changelog

Higher versions on top. Each entry: English line, then Chinese line; entries separated by a blank line.

## Unreleased

- Add the site-graph tool: `assets/tools/site-graph.mjs` builds `docs/site-graph.json` — vertices are the site's HTML files, edges are the jump relations between them, each carrying its guard (password / keyword / account) and the provenance of the credential (which pages supply it, verbatim or derived-as-rule-plus-components) — and injects that JSON into the new `assets/viewer/graph-viewer.html` framework to render a self-contained `docs/site-graph.html` (layered SVG, edge styles per kind, provenance panel, problems panel). The shared parsing + walk core moves into `assets/tools/site-model.mjs`, imported by both this tool and `check-solvable.mjs` (behavior-preserving); edges also carry M7 progress, step-4 closed-list route claims, and negative-delta back-jump flags. Ships with `assets/tools/fixtures/mini-site/`, the fixture both self-tests run against.
- 新增站点图工具：`assets/tools/site-graph.mjs` 生成 `docs/site-graph.json`——顶点为站点的 HTML 文件，边为页面间跳转关系，每条边携带其守卫（密码 / 关键词 / 账号）与凭据溯源（哪些页提供、逐字还是派生即规则加部件）——并把该 JSON 注入新的 `assets/viewer/graph-viewer.html` 渲染框架，产出自包含的 `docs/site-graph.html`（分层 SVG、按边型着色、溯源面板、问题面板）。共享的解析与走图核心移入 `assets/tools/site-model.mjs`，由本工具与 `check-solvable.mjs` 共同导入（行为保持）；边还携带 M7 进度、第 4 步闭合清单的 route 声明与负进度跳变标记。随附 `assets/tools/fixtures/mini-site/`，两个自测都跑在这份微型站点上。

- Restructure the skill around a selectable design-module catalog: optional mechanics (search, account login, layer reskin, progress numbering, collection carriers, staging) move out of the mandatory guardrails into `references/design-playbook.md` §2, step 2 now assembles the chosen modules into `docs/system-profile.md` with the user, and the GDD plus later steps adapt to that selection. Removes the honor-agreement copy, the mandatory clearance / `[Access denied]` search conventions, and the mandatory dual-skin and `secret/` directory naming (the restricted area takes the fiction's own word, e.g. `internal/`, via the `secretUrl` CONFIG knob); in-fiction carriers such as a notebook or evidence wall are no longer treated as a prohibited form.
- 以可选设计模块目录重构本 skill：把可选机制（搜索、账号登录、换肤、进度编号、收集载体、分阶段演出）从强制护栏移入 `references/design-playbook.md` §2；步骤 2 与用户一起把选定模块组装成 `docs/system-profile.md`，GDD 与后续步骤按选择适配。移除 honor agreement 文案、强制的密级 / `[Access denied]` 搜索约定，以及强制的双皮肤与 `secret/` 目录命名（受限区域改用虚构自身的词，如 `internal/`，由 `secretUrl` 配置项指向）；虚构内的笔记本 / 证据墙等载体不再视为禁止形态。

- Normalize the Step-5 workflow section headings to English-only — `Q1 Necessity`, `Q2 Obtainability`, `Q3 Intuitiveness`, `Q4 Leak scan` — removing the last inline Chinese/English duplication from `workflow/05-puzzle-audit.md`.
- 将步骤 5 工作流的小节标题统一为纯英文（`Q1 Necessity`、`Q2 Obtainability`、`Q3 Intuitiveness`、`Q4 Leak scan`），移除 `workflow/05-puzzle-audit.md` 中残留的中英并置。

- Split `docs/USAGE.md` into an English file plus `docs/USAGE_zh.md`, and remove the inline English/Chinese duplication from `docs/README.md` and the root `README.md`: each document now carries one language, and translations live in `_zh` sibling files.
- 将 `docs/USAGE.md` 拆为英文版与 `docs/USAGE_zh.md`，并移除 `docs/README.md` 与根 `README.md` 的段内中英双语：每份文档只保留一种语言，译文放在 `_zh` 同名单文件。

- Harden the skill against the defects found in the wuxiafusi owner review: ship `check-credentials.mjs` (composite/derived credential provenance: parts + rule + zero-plaintext) and `check-reachability.mjs` (rehearsal build) so a derived account is never printed just to turn `check-solvable` green; move system-container access state from per-tab `sessionStorage` to a cross-tab session cookie so a `target="_blank"` result stays unlocked; add `data-grants` so one login box serves several roles instead of two forms on a page; give images an owned step-7 phase plus a step-8 asset-manifest reconciliation; add a GDD asset manifest + entity registry with a self-consistency scan, and step-8 cross-page consistency, example-must-satisfy-rule, zero-jump, and cross-tab session checks. The two new checkers import the shared `tools/config.mjs`, and their citations point at the split `components.md` / `tooling.md`.
- 针对 wuxiafusi 项目审查暴露的缺陷加固本 skill：新增 `check-credentials.mjs`（组合 / 派生凭据溯源：部件 + 规则 + 零明文）与 `check-reachability.mjs`（演算副本），使派生账号不再为了 `check-solvable` 变绿而被印到公开页；系统容器的登录态由按标签页的 `sessionStorage` 改为跨标签页会话 Cookie，使 `target="_blank"` 打开的卷宗仍保持解锁；新增 `data-grants`，让单个登录框服务多身份而非在页面上摆两个表单；图片在步骤 7 有专属 phase 并在步骤 8 与 GDD 资产清单对账；GDD 增加资产清单 + 实体登记表与自洽扫描，步骤 8 增加跨页一致性、样例须满足规则、零跳通关、跨标签页会话等检查。两个新检查器导入共享的 `tools/config.mjs`，引用指向拆分后的 `components.md` / `tooling.md`。

- Merge the plot-blind / plot-aware scaffold split and the dual-license / USAGE notices into the restructured docs; the conflict resolution keeps both sides and updates every citation to the renamed reference files.
- 将脚手架 6a/6b 拆分与双许可 / USAGE 说明并入重构后的文档；冲突解决保留双方内容，并将所有引用更新为改名后的 reference 文件。

- Restructure references: rename `paradigm.md` → `guardrails.md` and `design-paradigms.md` → `design-playbook.md`; split `structure/base.md` into `base.md` (directory tree + page skeleton), `components.md` (Alpine component reference implementations), and `tooling.md` (check cadence, shared config, manual methods).
- 重构 references：`paradigm.md` 改名 `guardrails.md`、`design-paradigms.md` 改名 `design-playbook.md`；`structure/base.md` 拆分为 `base.md`（目录树+页面骨架）、`components.md`（Alpine 组件参考实现）、`tooling.md`（检查节奏、共享配置、人工方法）。

- Add canonical rule IDs R1–R12 in `guardrails.md` as the single home of every duplicated rule; workflow, reference, and example files now cite `(Rn)` instead of restating rules freely, and `workflow/08-self-check.md` becomes the single canonical deploy checklist (the duplicate list carried by the pre-split base.md is removed).
- 在 `guardrails.md` 增加权威规则编号 R1–R12，作为所有重复规则的唯一出处；workflow、reference、example 文件改为引用 `(Rn)`；`workflow/08-self-check.md` 成为唯一权威部署清单（删除拆分前 base.md 里的重复清单）。

- Add repo self-checks: `scripts/check-docs.mjs` (validates file paths, `§N`/`§N.M` citations, rule IDs, markdown links, orphan docs) wired into `.github/workflows/ci.yml` together with `check-solvable.mjs --self-test`.
- 新增仓库自检：`scripts/check-docs.mjs`（校验文件路径、`§N`/`§N.M` 引用、规则编号、markdown 链接、孤儿文档），与 `check-solvable.mjs --self-test` 一起接入 `.github/workflows/ci.yml`。

- Tools: extract the shared conventions into `assets/tools/config.mjs` (imported by every checker and build-keywords, so a renamed project edits one file); add `assets/tools/vendor-alpine.mjs` (downloads the pinned Alpine runtime and verifies its sha256).
- 工具：共享约定抽到 `assets/tools/config.mjs`（所有检查器与 build-keywords 共同导入，项目改名只需改一处）；新增 `assets/tools/vendor-alpine.mjs`（下载固定版本 Alpine 运行时并校验 sha256）。

- Add `examples/` with artifact-shape excerpts for steps 1/3/4/5 plus a filled dispatch-prompt sample; SKILL.md turns the dispatch contract into a six-item checklist and records the output project-root convention.
- 新增 `examples/`：步骤 1/3/4/5 的产物形状示例与一份填好的派发 prompt 样例；SKILL.md 将派发契约改为六项清单，并记录产出项目根目录约定。

- Add a root `README.md` pointing at `docs/README*.md`; note in `common-mistakes.md` why the Step-2 section is intentionally absent.
- 新增根 `README.md` 指向 `docs/README*.md`；`common-mistakes.md` 说明步骤 2 小节为何刻意缺省。
