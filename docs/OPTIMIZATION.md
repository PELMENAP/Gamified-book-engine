# Optimization Guide

Reading must feel instant on a mid-range Android phone. Every millisecond the engine spends is a millisecond the reader waits between paragraphs.

When working on code, check this file in order: budgets (section 1), the per-frame rule (section 2), memory layout (section 3), DOM (section 4), then the procedure (section 7).
Requirements are in `docs/SPEC.md` section 3; this file is how to meet them.

---

## 1. Budgets

Target: a mid-range Android device. A desktop or CI number is a hint, never a proof.

| Metric | Limit | Checked by |
|---|---|---|
| Cold start to first text | 2 s | device, stage gate |
| Open a 30,000-character chapter: decrypt, decompress, resolve, render | 100 ms | `probeChapter` on device; later a reader benchmark |
| Input to next paragraph | 50 ms | device |
| Longest main-thread task while scrolling | 50 ms | `probeScroll` on device |
| Shell and reader JS, gzip, without content | 120 KB | `pnpm check:budget` in CI |
| Telemetry tick at 1 Hz | 1 ms | benchmark at stage 6 |

- Estimate before writing: a resolve is O(blocks + mods + runs) per chapter open. Anything quadratic in blocks is a design error.
- The lint matrix (4,096 variants per chapter) runs in the compiler, never in the reader.
- A stage closes only when its budgets are measured on the device; the measurement goes into the stage report.

## 2. Per-Frame Paths Allocate Nothing

Per-frame: scroll and `requestAnimationFrame` handlers, tempo transitions, audio envelope updates. The list: `docs/map/HOT_PATHS.md`.

- No closures, no array or object literals, no `map`, `filter`, `slice`, spread, template strings or `bind`.
- Handlers are named module-level functions; their state is module-level or preallocated typed arrays.
- No layout reads (`offsetHeight`, `getBoundingClientRect`, `getComputedStyle`) during scroll.
- Read layout in one frame and write in the next; never interleave reads and writes.
- Allocation checks: a heap profile of the scroll scenario shows no growth from our code.

Warm paths (once per second or per event: 1 Hz tick, `IntersectionObserver` callbacks, clicks) may allocate small objects.
Do not contort them with global mutable indices: the browser allocates the observer entries anyway.

## 3. Data Shaped by Use

- Block state and the reading log live in `Uint8Array` and `Uint32Array` indexed by block index in the chapter (`ChapterLog`).
- Flags are bit masks (`LOG_FLAG_*`, `TRACE_FLAG_*`, the card mask in `ReaderSnapshot`).
- Strings are interned in `CompiledChapter.strings`; runs and mods refer to them by index.
- Expressions are flat `Int16Array` programs evaluated with a fixed-size stack, never trees of objects.
- Saving dumps typed arrays as they are; no per-block objects on the way to storage.

## 4. DOM and Layout

- Render a normal chapter as plain DOM built from text nodes in one `DocumentFragment`.
- No `content-visibility: auto` on chapters: estimated heights make position restore jump (`tools/guard.json` forbids it).
- Scene virtualization only above `virtualizeAboveBlocks` (default 350) or after a missed budget; never in screen reader mode.
- Block visibility comes from `IntersectionObserver`, not from scroll math.
- Restore the reading position after the chapter is rendered and fonts are loaded (`document.fonts.ready`).
- Presentation cards switch classes on the root element; they never re-resolve text.

## 5. Loading

- Plaintext stays in memory only for the current and next chapter, LRU-evicted.
- Prefetch and decrypt the next chapter when idle, not while the reader scrolls.
- Audio is lazy: short looping files, decoded on first need.

## 6. What Not to Optimize

- Compiler, linter, studio and probe code run off the reader's device budget; clarity beats speed there.
- Encryption cost is dominated by WebCrypto; do not replace it with own code for speed.

## 7. Procedure

1. Name the path: per-frame, warm, or cold. Per-frame code is added to `docs/map/HOT_PATHS.md`.
2. Estimate the cost against the budget before writing.
3. Write the code; re-read it for allocations if it is per-frame.
4. Measure: CI for size, the probe or a benchmark for time, the device for the stage gate.
5. Report the measured value, device and method; never round a desktop number into a device claim.
