# Tools and CI
Root: `tools/`. Run with Node ≥ 22.18, which executes `.ts` directly. Tests: `tools/test/`. CI: `.github/workflows/ci.yml`.

## Commands

| Command | Script | Fails when |
|---|---|---|
| `pnpm check` | all below plus `tsc -b` and `vitest run` | any step fails |
| `pnpm check:docs` | `tools/docmap.ts check --strict` | missing path, link or name in docs; over budget; stale generated map |
| `pnpm docs:gen` | `tools/docmap.ts gen` | — writes `docs/map/INDEX.md`, `docs/map/LARGE_FILES.md` |
| `pnpm check:boundaries` | `tools/boundaries.ts` | import outside the allowlist; forbidden global; relative import into another package |
| `pnpm check:guard` | `tools/guard.ts` | comment in code; HTML sink; `eval`; `any`; clipboard write; `preventDefault` in a copy handler |
| `pnpm check:leaks` | `tools/leakcheck.ts` | a fragment of `book/notes/` or book text found in `dist/`, `.gz` included |
| `pnpm check:budget` | `tools/budget.ts` | gzip JS of `dist/pwa` over `tools/budgets.json` |

## Data

| File | Holds |
|---|---|
| `tools/boundaries.json` | Global groups and the per-package import allowlist |
| `tools/guard.json` | Forbidden patterns for code, CSS and HTML |
| `tools/docmap.json` | Doc budgets, checked files, external platform names |
| `tools/budgets.json` | Size budgets |

## Shared code

- `tools/lib/repo.ts`: repository root, walking, `codeFiles`, `report`.
- `tools/lib/lex.ts`: `lex` splits TypeScript into code without strings, code with strings, comments; lines are preserved.
- `lex` handles strings, nested template literals, regex literals and a shebang; `tools/test/lex.test.ts` covers them.

## Invariants

- Rules are data: a new forbidden pattern goes into a JSON file, not into a script.
- `tools/guard.ts` and `tools/boundaries.ts` match on code with strings blanked, so text in strings never triggers them.
- `pnpm check:leaks --require` fails when `dist/` is absent; CI uses it after builds exist (stage 2).
