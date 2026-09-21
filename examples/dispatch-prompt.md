# Example — Filled Dispatch Prompt (Step 4)

A sample of the orchestrator's prompt for one subagent, showing all six contract items from SKILL.md.
Slot values in «guillemets» change per project; everything else is copied verbatim.

```text
You are executing step 4 (Reachability chain analysis) of the novel2arg skill.

1. Novel text: «/path/to/novel.txt»
2. Project root: «/path/to/chunshui-lou-arg/» (all docs/ paths below are relative to it).
   Prior artifacts: docs/deconstruction.md, docs/gdd.md (approved by the user).
3. Deliverable: docs/reachability.md — one row per page:
   | 页面 | 触达方式（编号） | 来源页面 | 该来源为什么会放这个链接 | 从首页跳数 |
   plus the reverse check, depth check, access check, keyword solvability, layer check,
   badge check, and title check, each with a verdict. (Full definition: workflow/04-reachability.md.)
4. Read first: workflow/04-reachability.md, references/guardrails.md (R7–R10),
   references/common-mistakes.md §4, examples/reachability-excerpt.md.
5. Realism priority: realism outranks any check (references/guardrails.md R12). If realism forces
   breaking a rule, record the conflict — page, rule, what realism requires — as an unresolved
   question; do not resolve it silently.
6. Return the artifact plus unresolved questions; route questions back through the orchestrator.
   Do not converse with the user.
```

Step 7 prompts differ in two ways only: item 3 carries the phase's page-ownership list from
workflow/07-implementation.md, and item 4 carries the full reference set that file names.
