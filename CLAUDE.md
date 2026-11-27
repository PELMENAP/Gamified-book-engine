# Gamified Book Engine — rules for AI contributors

TypeScript monorepo (pnpm, Vite, Preact, Capacitor 8). Requirements: [docs/SPEC.md](docs/SPEC.md). Task prompts follow [docs/PROMPT_TEMPLATE.md](docs/PROMPT_TEMPLATE.md).
Code: `packages/`, `apps/`, `tools/`. Book data: `book/`. Tests: `packages/*/test/`, `tools/test/`.

## What to read
Read only what the task touches. The Philosophy and Project constraints below are sufficient for everything else.

| The change touches | Read first |
|---|---|
| Package layout, which package owns what, dependency boundaries | [docs/map/layout.md](docs/map/layout.md) |
| IR, expressions, reader state, log, save, manifest, traces, source YAML types | [docs/map/format.md](docs/map/format.md), [docs/formats/README.md](docs/formats/README.md) |
| Packs, headers, keys, answer normalization, base32 | [docs/map/crypto.md](docs/map/crypto.md), [docs/SECURITY.md](docs/SECURITY.md) |
| Repository checks: docmap, boundaries, guard, leakcheck, budget | [docs/map/tools.md](docs/map/tools.md) |
| Stage 0 device probe | [docs/map/probe.md](docs/map/probe.md) |
| Book data, markup, demo chapter, notes | [docs/map/book.md](docs/map/book.md) |
| Scroll, rAF, tempo, audio envelopes, telemetry tick (list: [docs/map/HOT_PATHS.md](docs/map/HOT_PATHS.md)) | [docs/OPTIMIZATION.md](docs/OPTIMIZATION.md) |
| Trace codes, save import, packs, activation, locks, CSP, anything from outside | [docs/SECURITY.md](docs/SECURITY.md) |
| A new mechanic or rule | [PHILOSOPHY.md](PHILOSOPHY.md), then the section of [docs/SPEC.md](docs/SPEC.md) |
| A decision that is reversible or follows from the spec | [docs/decisions.md](docs/decisions.md): record it there |

## Search
- Search `packages/`, `apps/`, `tools/`, `book/` (except `book/notes/`). Do not read `node_modules/`, `dist/`, `pnpm-lock.yaml`.
- `book/notes/` holds the concept with deaths and the ending: read it only for book-text tasks, never quote it into code or docs.
- An exported name: `grep -n "Name" docs/map/INDEX.md` gives file and line. `docs/SPEC.md` is long: grep its section.
- A file over 400 lines: take the line from `docs/map/LARGE_FILES.md` and read that range.

## Documentation
- A change that moves, renames, adds or deletes a file or exported name named in `docs/map` updates that map in the same commit.
- After changing code run `pnpm docs:gen`, then `pnpm check`; commit the regenerated files.
- A data format change bumps its version constant, adds a migration and updates `docs/formats/` in the same commit.
- Rules for maps: [docs/map/README.md](docs/map/README.md). Decisions: append to `docs/decisions.md`, never rewrite old entries.
- Never commit ideas, backlogs, TODO lists or known defects. Keep them in the chat report.
  Exception: `docs/ROADMAP.md`, the stage plan derived from `docs/SPEC.md`; a closed task is marked there, not deleted.

## Language
Code, identifiers, commits, engineering docs and the decision log are in English.
Book text, markup examples, lock answers, demo style rules and every report to the user are in Russian.

## Philosophy
- Reading is the core: no timers that move text, no scores, no correct answers.
- The author writes every word: no randomness or clock in the resolver; text never changes in front of the reader.
- Every path is a whole story: any card set or law, and any mechanic turned off, keeps the plot complete.
- The engine knows no book: names, cards and rules come from `book/` data.
- Reader data stays on the device; accessibility is never a card; protection claims stay honest.

If a task item contradicts the philosophy or `docs/SPEC.md` section 2 "Out of scope", do not perform it: report the conflict and propose a compliant variant.

## Project constraints
- Priority: performance → correctness → extensibility.
- TypeScript `strict`, no `any`. No comments and no JSDoc in code: names, types and `docs/` explain. Enforced by `tools/guard.ts`.
- Binary layouts: named constants in one file, byte tables in `docs/formats/`, golden vectors in tests. No literal offsets elsewhere.
- Text reaches the DOM only as text nodes. No `innerHTML`, `eval`, `new Function`, inline scripts or styles: the CSP forbids them.
- `core` and `format` see no DOM, storage, clock or randomness; `reader-dom` sees no storage. Rules: `tools/boundaries.json`.
- Per-frame paths allocate nothing: no closures, arrays, objects, `map`, `filter`, `slice`, spread. Block state lives in typed arrays.
- No required server. No external analytics. The `copy` handler never calls `preventDefault`.
- Stop before an irreversible step: purchase, publication, store submission, production keys. Ask the author.
- Dependencies: check the current version and store rules before a stage; pin it; record the reason in `docs/decisions.md`.
- Tests may be added and changed. Never delete, skip or weaken a test to pass; change a test only with the behaviour it checks.
- Do not create a PR unless asked. Commit only when meaningful; never write the model identifier in commits.

## Task procedure
- Perform items strictly in order; after each item, run the verification below.
- If an item needs a file that is absent (for example the concept in `book/notes/`), ask for that path and continue with other items.
- A reversible decision is not a question: decide, record it in `docs/decisions.md`, continue.

## Verification
- `pnpm check` runs docmap, boundaries, guard, typecheck and tests. Run it; report what passed and what was not run.
- Re-read the diff for allocations on per-frame paths, comments, book-specific names in engine code, and plaintext leaks.
- Device budgets (`docs/OPTIMIZATION.md`) need a real device: never claim them from a desktop or CI measurement.
- Do not claim something is verified if the verification was not performed.

## Response format
The report to the user is in Russian. No introductions and no closing phrases.
1. What works: per item, files changed, what was verified and how.
2. Measured budgets: value, device, method; or "not measured".
3. Decisions made: links to `docs/decisions.md` entries.
4. Open risks: one line each, including decisions that need the author.
5. Push to the session branch: `git push -u origin <branch>`; on a network error retry after 2, 4, 8, 16 seconds.
