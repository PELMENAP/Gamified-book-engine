# Expression program

Constants: `packages/format/src/expr.ts`. Stored as `Int16Array` in `CompiledChapter.exprs`, postfix order.
Each opcode is followed by its operands (`OP_OPERANDS`) and pops `OP_POPS` values; every opcode pushes one boolean.

| Opcode | Value | Operands | Source form |
|---|---|---|---|
| `OP_TRUE` | 1 | — | literal |
| `OP_FALSE` | 2 | — | literal |
| `OP_CARD` | 3 | card index in deck | `card.thoughts` |
| `OP_LAW_EQ` | 4 | law index, value index | `law.mind == goal` |
| `OP_TIME_NIGHT` | 5 | — | `time.night` |
| `OP_SEASON_EQ` | 6 | season (`SEASON_*`) | `time.season == winter` |
| `OP_RUN_EQ` | 7 | run number | `run.n == 2` |
| `OP_SEEN` | 8 | string index of block id | `seen.a7f3` |
| `OP_MARKED` | 9 | string index of block id | `marked.a7f3` |
| `OP_FACT` | 10 | string index of fact id | `fact.silent` |
| `OP_FACT_EQ` | 11 | fact string index, value string index | `fact.door == open` |
| `OP_COPIED` | 12 | string index of chapter id | `copied.ch03` |
| `OP_LOCALE_EQ` | 13 | string index of locale | `locale == en` |
| `OP_NOT` | 14 | — (pops 1) | `not` |
| `OP_AND` | 15 | — (pops 2) | `and` |
| `OP_OR` | 16 | — (pops 2) | `or` |

- Limits: `EXPR_MAX_LENGTH` = 256 cells, `EXPR_MAX_STACK` = 32. The compiler rejects longer programs.
- `MATRIX_FIELDS` enter the global lint matrix; `LOCAL_PREDICATE_FIELDS` are checked locally per block.
