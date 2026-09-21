# Changelog

Higher versions on top. Each entry: English line, then Chinese line.

## 2026-09-21

Harden the skill against the defects found in the wuxiafusi owner review: ship `check-credentials.mjs` (composite/derived credential provenance: parts + rule + zero-plaintext) and `check-reachability.mjs` (rehearsal build) so a derived account is never printed just to turn `check-solvable` green; move system-container access state from per-tab `sessionStorage` to a cross-tab session cookie so a `target="_blank"` result stays unlocked; add `data-grants` so one login box serves several roles instead of two forms on a page; give images an owned step-7 phase plus a step-8 asset-manifest reconciliation; add a GDD asset manifest + entity registry with a self-consistency scan, and step-8 cross-page consistency, example-must-satisfy-rule, zero-jump, and cross-tab session checks.
针对 wuxiafusi 项目审查暴露的缺陷加固本 skill：新增 `check-credentials.mjs`（组合 / 派生凭据溯源：部件 + 规则 + 零明文）与 `check-reachability.mjs`（演算副本），使派生账号不再为了 `check-solvable` 变绿而被印到公开页；系统容器的登录态由按标签页的 `sessionStorage` 改为跨标签页会话 Cookie，使 `target="_blank"` 打开的卷宗仍保持解锁；新增 `data-grants`，让单个登录框服务多身份而非在页面上摆两个表单；图片在步骤 7 有专属 phase 并在步骤 8 与 GDD 资产清单对账；GDD 增加资产清单 + 实体登记表与自洽扫描，步骤 8 增加跨页一致性、样例须满足规则、零跳通关、跨标签页会话等检查。
