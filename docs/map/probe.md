# Stage 0 probe
Root: `apps/probe`. Package: `@gbe/probe`. Build: `dist/probe` (`base: './'`, opens from `capacitor://` too).

## Entry points

| Name | File | Measures |
|---|---|---|
| `probeEnvironment` | `apps/probe/src/probes/env.ts` | Protocol, secure context, Service Worker API presence, viewport, memory |
| `probeAudio` | `apps/probe/src/probes/audio.ts` | `AudioContext` start after a tap, latency, click-free envelope |
| `probeCrypto` | `apps/probe/src/probes/crypto.ts` | HKDF, AES-GCM 30 KB, tamper rejection, PBKDF2 iterations for 500 ms, ECDSA verify |
| `probeCompression` | `apps/probe/src/probes/compression.ts` | `deflate-raw` availability and timing |
| `probeStorage` | `apps/probe/src/probes/storage.ts` | IndexedDB timing, non-extractable `CryptoKey` in IndexedDB, persist, quota |
| `probeChapter` | `apps/probe/src/probes/chapter.ts` | Decrypt + inflate + parse + DOM of 30 000 chars against the 100 ms budget |
| `probeScroll` | `apps/probe/src/probes/scroll.ts` | Worst frame and longest task during scripted scroll, `IntersectionObserver` |

## Data flow

1. `apps/probe/src/main.ts` runs probes in order after the «Запустить» tap, so audio may start.
2. Each probe returns a `ProbeResult`; `guarded` turns a throw into a failed row.
3. «Скопировать отчёт» puts the JSON report on the clipboard for `docs/decisions.md`.

## Invariants

- The text is filler from `apps/probe/src/filler.ts`, never book text.
- The page runs under the same CSP as the reader: no inline script or style.
- The scroll frame handler `onFrame` allocates nothing (`docs/map/HOT_PATHS.md`).
