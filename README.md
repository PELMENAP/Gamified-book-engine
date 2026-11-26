# Gamified Book Engine

An engine for a book sold as an app and as a print edition, both from one source. The core experience stays reading:
cards change how the story is understood, world laws change causes, and the book quietly remembers how it was read —
on the reader's device only.

- **One source:** plain-text `.bmd` scenes and YAML in `book/` build into a PWA, iOS and Android apps (Capacitor), EPUB and Typst print source.
- **The author writes every word:** cards, laws, mutations, time of day and second playthroughs are conditional operations on blocks; the resolver is pure.
- **No required server:** static hosting, offline after activation, encrypted chapter packs, knowledge locks keyed by the answer.
- **Engine without a book:** names, cards and rules come from data.

Requirements: [docs/SPEC.md](docs/SPEC.md). Principles: [PHILOSOPHY.md](PHILOSOPHY.md).

## Status

Stage 0 of `docs/SPEC.md` section 12: data schemas in `packages/format`, pack header layout in `packages/crypto`,
the device probe in `apps/probe`, repository checks in `tools/`. Device measurements are pending.

## Getting started

Node ≥ 22.18 and pnpm 10.

```bash
pnpm install
```

```bash
pnpm check
```

```bash
pnpm probe
```

`pnpm probe` serves the stage 0 probe on the local network; open it on the phone, tap «Запустить», copy the report.

## Repository

| Path | Content |
|---|---|
| `packages/` | Engine packages: format, crypto, core, compiler, reader-dom, audio, platform, shell |
| `apps/` | Applications: `apps/probe` now; pwa, mobile and studio at their stages |
| `book/` | Book data; `book/notes/` is excluded from every build |
| `tools/` | Repository checks, run by Node directly |
| `docs/` | Specification, guides, maps, formats, decision log |

## Documentation

| Document | Content |
|---|---|
| [PHILOSOPHY.md](PHILOSOPHY.md) | What the book is and what it must not become |
| [CLAUDE.md](CLAUDE.md) | Rules for AI contributors, routing table, search rules |
| [docs/SPEC.md](docs/SPEC.md) | Full requirements and stages |
| [docs/map/README.md](docs/map/README.md) | Architecture maps, one per subsystem; generated index |
| [docs/OPTIMIZATION.md](docs/OPTIMIZATION.md) | Budgets, the per-frame rule, DOM and layout |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, cryptography, reader data, secrets |
| [docs/formats/README.md](docs/formats/README.md) | Byte and opcode tables of every data format |
| [docs/decisions.md](docs/decisions.md) | Decision log |
| [docs/PROMPT_TEMPLATE.md](docs/PROMPT_TEMPLATE.md) | Template of a task prompt |

The architecture is described only in `docs/map`. This file does not repeat it.

## Checks

`pnpm check` runs, in order: the documentation check, the boundary linter, the code guard, the TypeScript build and the tests.
Each step is described in [docs/map/tools.md](docs/map/tools.md).

## License

[LICENSE](LICENSE)
