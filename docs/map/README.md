# Project maps

One map per subsystem. Open only the map of the area the task touches; the routing table is in `CLAUDE.md`.

| File | Covers |
|---|---|
| `docs/map/layout.md` | Packages and apps, what each owns, dependency boundaries, the stage that fills it |
| `docs/map/format.md` | `@gbe/format`: IR, expressions, reader state, log, save, manifest, traces, source types |
| `docs/map/compiler.md` | `@gbe/compiler`: `.bmd` lexer, parser, AST with positions, parse errors, golden files |
| `docs/map/crypto.md` | `@gbe/crypto`: pack header layout, answer normalization, base32, golden vectors |
| `docs/map/tools.md` | Repository checks under `tools/` and CI |
| `docs/map/probe.md` | `apps/probe`: stage 0 measurements of the platform |
| `docs/map/book.md` | `book/`: data files, notes exclusion, demo chapter |
| `docs/map/HOT_PATHS.md` | Code under the zero-allocation rule |
| `docs/map/INDEX.md` | Generated: packages, workspace deps, exported name → file:line |
| `docs/map/LARGE_FILES.md` | Generated: declarations of files over 400 lines |

## Tools

- `pnpm docs:gen` rewrites `INDEX.md` and `LARGE_FILES.md`.
- `pnpm check:docs` fails on a missing path or link, a backticked name absent from the code, an over-budget file, a stale generated file.
- CI runs `pnpm check` on every push: `.github/workflows/ci.yml`.

## Rules for these files

1. Size budget: `CLAUDE.md` 90 lines, a map 150 lines. Over budget means split, not grow.
2. One fact per line, under 200 characters. A search hit must be usable alone.
3. Every path starts at the repository root.
4. A map describes the present. History belongs to `git log`, reasons to `docs/decisions.md`.
5. Whatever a script can derive is generated: export locations, line numbers, package dependencies.
6. Hand-written content is what code cannot say: entry points, data flow, invariants, reasons.
7. One source of truth per fact; other files link to it. Requirements live only in `docs/SPEC.md`.
8. A package that gets its first real code gets its own map and a row in the routing table of `CLAUDE.md` in the same commit.
9. A change that moves, renames, adds or deletes a file named in a map updates that map in the same commit.
10. A backticked name with a capital letter must exist in the code; platform names go to `externalNames` in `tools/docmap.json`.

## Map template

```markdown
# <Subsystem>
Root: `packages/...`. Package: `@gbe/...`. Tests: `packages/.../test/`.

## Entry points
| Name | File | Role |

## Data flow
Numbered steps.

## Invariants
What breaks silently if violated.

## Hot paths
Link to the section of HOT_PATHS.md, or "none".
```

## Structural rules for code

1. One module per responsibility; the file is named after what it exports (`pack-header.ts` exports `encodePackHeader`).
2. A package exposes only `packages/<name>/src/index.ts`. Other packages import `@gbe/<name>`, never a relative path into it.
3. Imports inside a package are relative and end in `.ts`, so Node runs tools without a build step.
4. Soft limit of 400 lines per file. Over it, split by responsibility.
5. Per-frame code sits in files whose name says so (`scroll-frame.ts`) and is listed in `docs/map/HOT_PATHS.md`.
6. A new package gets `package.json`, `tsconfig.json`, a rule in `tools/boundaries.json` and a reference in `tsconfig.json`.
