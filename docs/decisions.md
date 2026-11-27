# Decision log

Append-only. Each entry: date, context, decision, reason, how to revert. Requirements: `docs/SPEC.md`.

## D-0001 · 2026-11-26 · Repository rules follow the TheRavine model
Context: the author asked for development principles, a file map and AI-agent rules modelled on the TheRavine repository.
Decision: `CLAUDE.md` with a routing table to `docs/map/`, `AGENTS.md` pointing to it, `PHILOSOPHY.md`, `docs/OPTIMIZATION.md`,
`docs/SECURITY.md`, `docs/PROMPT_TEMPLATE.md`, generated `docs/map/INDEX.md`, and a doc checker in CI.
Reason: agents read only the map of the touched area; the checker keeps maps true to the code.
Revert: documentation only.

## D-0002 · 2026-11-26 · The specification lives in the repository
Decision: the task prompt is stored verbatim as `docs/SPEC.md`; maps and guides link to its sections instead of copying them.
Reason: one source of truth for requirements. Revert: delete the file and inline the needed sections.

## D-0003 · 2026-11-26 · Tooling versions
Checked on npm: TypeScript 7.0.2, Vite 8.3.8, Vitest 5.1.2, fast-check 4.11.0, Capacitor 8.6.3, Preact 11.2.0,
`@preact/signals` 2.11.4, Playwright 1.65.1, Workbox 7.4.1, pnpm 12.23.0.
Decision: pin TypeScript 7, Vite 8, Vitest 5, fast-check 4 now; add the others at the stage that uses them, after a recheck.
pnpm is pinned to 10.28.0 (`packageManager`), the version present in the build environment; moving to 12 is a one-line change.
Reason: `tsc -b` with project references, `erasableSyntaxOnly` and `.ts` import rewriting pass on TypeScript 7.
Revert: change versions in `package.json`.

## D-0004 · 2026-11-26 · Tools are TypeScript run directly by Node
Decision: scripts in `tools/` are `.ts` files executed by Node ≥ 22.18 type stripping, with no build step or extra runner.
Reason: one language for the whole repository, no dependency to run checks. Constraint: erasable syntax only (no enums).
Revert: compile `tools/` with `tsc` to `.mjs`.

## D-0005 · 2026-11-26 · Package scope and source-first workspaces
Decision: packages are `@gbe/<name>`; `exports` points to `packages/<name>/src/index.ts`; `tsc -b` emits declarations only for type checks.
Reason: Vite and Vitest consume sources directly, so there is no package build in the edit loop.
Revert: add a build step and point `exports` to `dist/`.

## D-0006 · 2026-11-26 · Boundaries enforced twice
Decision: `tools/boundaries.ts` checks imports and forbidden globals per package from `tools/boundaries.json`; in addition
`format` and `core` compile without the `DOM` lib. Comments, HTML sinks, `eval`, `any` and copy blocking are checked by `tools/guard.ts`.
Reason: the spec requires a boundary linter; own scripts are smaller and faster than an ESLint setup and keep rules as data.
Revert: replace with ESLint rules of the same content.

## D-0007 · 2026-11-26 · IR additions to section 6
Decision: `CompiledChapter` gains `scenes: Scene[]` (pov, mood, pace, ambience, themes, decay rule per scene);
`Cue` is `{ kind, block, value }`; `ResolvedChapter` is a flat block and run list for allocation-free rendering.
Reason: section 6 leaves `Cue` and scene parameters undefined while sections 5 and 8 need them.
Revert: bump `IR_FORMAT` and move scene data into blocks.

## D-0008 · 2026-11-26 · Block ids are unique per book
Decision: 4 characters of base36 (`BLOCK_ID_PATTERN`), unique across the book, not per chapter.
Reason: `seen.<id>`, `marked.<id>`, traces and translations reference blocks without a chapter prefix; 1.6 million ids suffice.
Revert: bump `IR_FORMAT`, widen the pattern; existing ids stay valid.

## D-0009 · 2026-11-26 · Expressions are postfix `Int16Array` programs
Decision: opcodes and operand counts in `packages/format/src/expr.ts`, table in `docs/formats/expr.md`.
Reason: evaluation with a fixed stack and no allocation; compact in packs; no code execution.
Revert: bump `EXPR_FORMAT`.

## D-0010 · 2026-11-26 · Stage 0 probe is its own app
Decision: `apps/probe` measures WebCrypto, `CompressionStream`, storage of a non-extractable `CryptoKey`, audio start,
a 30,000-character chapter pipeline and scroll frames. It builds with `base: './'` so the same files run in Capacitor.
Reason: the stage 0 criterion needs numbers from real devices before pack code is written.
Revert: delete `apps/probe`; nothing depends on it.

## D-0011 · 2026-11-26 · The concept file is not in the repository yet
Context: the prompt refers to `Примерный концепт архитектуры сюжета.md`; only the prompt was provided.
Decision: `book/notes/README.md` names the expected path; the demo chapter waits for the concept file.
Revert: none needed.

## D-0012 · 2026-11-26 · Stage plan in the repository
Decision: `docs/ROADMAP.md` (Russian, like the TheRavine roadmap) splits `docs/SPEC.md` stages into prompt-sized tasks.
It is the only plan allowed in git; `CLAUDE.md` names the exception. `tools/docmap.json` excludes it from path checks,
because it names files of future stages. The resolver moves from stage 2 to task 1.5: the lint matrix needs it.
Revert: delete the file and the exception.
