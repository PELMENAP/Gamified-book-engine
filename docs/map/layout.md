# Layout and boundaries
Root: repository. Workspaces: `pnpm-workspace.yaml`. Build graph: `tsconfig.json` (project references).
Boundary rules: `tools/boundaries.json`, checked by `tools/boundaries.ts`.

## Packages

| Package | Path | Owns | Code since stage |
|---|---|---|---|
| `@gbe/format` | `packages/format` | Types and constants of every data format; no logic beyond guards | 0 |
| `@gbe/crypto` | `packages/crypto` | Pack layout, key derivation, packs, key wrapping, knowledge locks | 0 (layout), 4 |
| `@gbe/core` | `packages/core` | State, expression evaluation, resolver, cards, mutations, portrait | 2 |
| `@gbe/compiler` | `packages/compiler` | CLI: parse → merge → validate → lint → build → encrypt; ids, codes | 1 |
| `@gbe/reader-dom` | `packages/reader-dom` | Block rendering, pacing, highlights, margins, observers | 2 |
| `@gbe/audio` | `packages/audio` | Web Audio: ambience, music, crossfades, pulse | 3 |
| `@gbe/platform` | `packages/platform` | Ports and web, ios, android adapters | 2 (web), 7 |
| `@gbe/shell` | `packages/shell` | Preact shell: card selection, settings, final screen | 3 |
| `@gbe/probe` | `apps/probe` | Stage 0 platform measurements | 0 |

Packages without code export an empty `packages/<name>/src/index.ts`; their boundaries already apply.
Apps pwa, mobile and studio appear at stages 2, 7 and 3 (`docs/SPEC.md` section 12).

## Allowed imports

| Package | May import | May not touch |
|---|---|---|
| `format` | nothing | DOM, storage, audio, clock, randomness, Capacitor |
| `core` | `format` | DOM, storage, audio, clock, randomness, Capacitor |
| `crypto` | `format` | DOM, storage, audio, clock, Capacitor |
| `compiler` | `format`, `crypto`, `core`, `node:*`, `yaml` | DOM, storage, audio, Capacitor |
| `reader-dom` | `format`, `core` | storage, audio, Capacitor |
| `audio` | `format` | storage, Capacitor |
| `platform` | `format`, `crypto`, `@capacitor/*`, `workbox-window` | — |
| `shell` | `format`, `core`, `reader-dom`, `audio`, `platform`, Preact | storage, Capacitor |

The TypeScript `lib` of each package repeats the rule: `format` and `core` compile without `DOM`, so `document` is a type error.

## Data flow

1. `book/*.bmd`, layers and YAML → `@gbe/compiler` → `CompiledChapter` → packs → `dist/<channel>`.
2. Runtime: license port → key port → pack port → decrypt → `core.resolve(state)` → `reader-dom`.
3. Reading events: `reader-dom` → log → `core` state → next resolve.

## Invariants

- `core` is pure: one `ReaderSnapshot` gives one text. Time arrives as `TimeState`, never from a clock.
- `reader-dom` reaches storage only through ports passed in by `shell`.
- No engine package contains a name, card or rule of a specific book.
