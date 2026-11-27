# <Stage name: what we change and in which area>

Filling rules (delete before sending):
- Text in <angle brackets> is replaced with the content of the specific task.
- Blocks in [square brackets] are included only if the task touches them.
- The number of items in TASK is as many as needed; each item is self-contained: files, actions, and a readiness criterion.
- The prompt is written in English. Book text, markup examples and the report to the user are in Russian.
- The rules are not copied here. Language, philosophy, constraints, verification and response format live in
  [CLAUDE.md](../CLAUDE.md), which Claude Code loads by itself. The single source is that file.
- For a tool that does not load `CLAUDE.md`: paste its sections from "Language" to "Response format" after TASK, unchanged.

## RULES

Follow `CLAUDE.md` of the repository: language, philosophy, project constraints, task procedure, verification, response format.
Read the map of the affected area first: <docs/map/<area>.md>.
Requirements of this stage: `docs/SPEC.md`, sections <N, M>.
[If the task is on a per-frame path] Read `docs/OPTIMIZATION.md` and follow its procedure.
[If the task accepts external input, touches packs, keys, activation or locks] Read `docs/SECURITY.md` and follow its procedure.
[If the task changes a data format] Bump the version constant, add a migration and a test on an old file, update `docs/formats/`.

## CONTEXT

Task: <1–3 sentences: what to do and why>.
Stage: <0–8 from docs/SPEC.md section 12> and its completion criterion: <criterion>.

Known facts (from the code, with files and lines; line numbers are approximate, verify against the file):
1. <fact> — <file:line>.
2. <...>

[Files outside the map of the area — list only what the map does not already name]
<path>   <role in one line>

## TASK

One stage. Perform the items strictly in order.

### Item 1. <Short name>
Files: <paths>.
- <What to change, concretely: types, behaviour, where values come from>.
- <What NOT to change>.
- Done when: <observable result, test name or command output>.

### Item 2. <...>
Files: <...>.
- <...>

## BRANCH

Push to branch <branch name>.

## REPORT

In Russian: what works, measured budgets (device and method), decisions with links to `docs/decisions.md`, open risks.
