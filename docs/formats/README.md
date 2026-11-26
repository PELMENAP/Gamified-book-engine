# Data formats

Every format has a version constant in `packages/format/src` or `packages/crypto/src`. A change bumps it and adds a migration.

| Format | Version constant | Types | Table |
|---|---|---|---|
| Pack file | `PACK_VERSION` | `PackHeader` | [pack.md](pack.md) |
| Expression program | `EXPR_FORMAT` | `OP_*` | [expr.md](expr.md) |
| Compiled chapter | `IR_FORMAT` | `CompiledChapter` | `packages/format/src/ir.ts` |
| Reading log | `LOG_FORMAT` | `ChapterLog` | [log.md](log.md) |
| Save file | `SAVE_SCHEMA_VERSION` | `SaveFile` | [save.md](save.md) |
| Manifest | `MANIFEST_FORMAT` | `Manifest`, `SignedManifest` | `packages/format/src/manifest.ts` |
| Trace and scene codes | `TRACE_FORMAT` | `TraceCode`, `SceneCode` | `packages/format/src/trace.ts` |
| Book source YAML | `SOURCE_FORMAT` | `BookMeta`, `DeckSource`, `LawSource` | `packages/format/src/book.ts` |

The author-facing description of `.bmd` markup is `docs/SPEC.md` section 5 until the compiler exists.
