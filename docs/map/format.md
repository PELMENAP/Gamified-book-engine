# Format: types and schemas
Root: `packages/format/src`. Package: `@gbe/format`. Tests: `packages/format/test/`. Byte and opcode tables: `docs/formats/`.

## Entry points

| File | Defines |
|---|---|
| `packages/format/src/ids.ts` | `BlockId` and other id aliases; `BLOCK_ID_PATTERN` (4 chars base36, unique per book) |
| `packages/format/src/expr.ts` | Expression opcodes `OP_*`, `OP_OPERANDS`, `OP_POPS`, limits, seasons, matrix and local fields |
| `packages/format/src/ir.ts` | `CompiledChapter`, `Block`, `Run`, `Mod`, `Scene`, `Cue`, `LAYER_ORDER`, `ResolvedChapter` |
| `packages/format/src/state.ts` | `ReaderSnapshot`, `TimeState`, `MAX_ACTIVE_CARDS`, `MAX_LAWS`, `MAX_INTERROGATIONS` |
| `packages/format/src/log.ts` | `ChapterLog` typed arrays, `LOG_FLAG_*` bit masks, telemetry constants |
| `packages/format/src/save.ts` | `SaveFile`, `SAVE_SCHEMA_VERSION`, `ReaderSettings`, `ReadingPosition` |
| `packages/format/src/manifest.ts` | `Manifest`, `PackEntry`, `SignedManifest`, `MANIFEST_FORMAT` |
| `packages/format/src/trace.ts` | `TraceCode`, `SceneCode`, `TRACE_MAX_BYTES`, `TRACE_FLAG_*` |
| `packages/format/src/book.ts` | Source YAML: `BookMeta`, `DeckSource`, `CardSource`, `LawSource`, `GlossaryEntry`, `EditionSource`, `ChannelConfig` |

## Invariants

- Every format has a version constant: `IR_FORMAT`, `EXPR_FORMAT`, `LOG_FORMAT`, `SAVE_SCHEMA_VERSION`, `MANIFEST_FORMAT`, `TRACE_FORMAT`, `SOURCE_FORMAT`.
- A change to a type here bumps its constant, adds a migration and updates `docs/formats/`.
- `LAYER_ORDER` is the order of `docs/SPEC.md` section 6; the resolver iterates it, never a literal list.
- Block ids are book-unique, so `seen.<id>` and `marked.<id>` need no chapter prefix.
- `ReaderSnapshot.cards` is a bit mask over deck order; `laws` holds value indices, `LAW_UNSET` for none.
- Plaintext never appears in `SaveFile`: it holds ids, offsets, typed-array dumps and wrapped keys only.

## Hot paths
None. Types only.
