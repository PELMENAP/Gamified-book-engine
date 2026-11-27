# Reading log

Constants: `packages/format/src/log.ts`. One `ChapterLog` per chapter, every array indexed by block index.

| Array | Type | Meaning |
|---|---|---|
| `dwellMs` | `Uint32Array` | Credited reading time |
| `visits` | `Uint8Array` | Chapter opens that showed the block, saturating at 255 |
| `flags` | `Uint8Array` | Bit mask below |
| `decayStage` | `Uint8Array` | Mutation stage, only grows |

| Flag | Bit | Value |
|---|---|---|
| `LOG_FLAG_SEEN` | 0 | 1 |
| `LOG_FLAG_HIGHLIGHT` | 1 | 2 |
| `LOG_FLAG_COPY` | 2 | 4 |
| `LOG_FLAG_NOTE_OPENED` | 3 | 8 |
| `LOG_FLAG_RETURN` | 4 | 16 |

- Tick: `LOG_TICK_MS`; crediting stops after `LOG_IDLE_FACTOR` expected reading times without activity.
- Speed: rolling median over blocks of at least `LOG_MIN_WORDS_FOR_SPEED` words.
- Signal: `clamp(ln(dwell / expected), -LOG_SIGNAL_CLAMP, LOG_SIGNAL_CLAMP)`; a theme claim needs `LOG_MIN_THEME_SAMPLE` blocks.
