# Security Guide

The book protects two things: the files until the reader is entitled to them, and the reader's data on the reader's device.
It does not protect text already displayed, and it never pretends to (`PHILOSOPHY.md` section 7).

Check this file in order: threat model (section 1), trust boundaries (section 2), cryptography (section 3), reader data (section 4), secrets (section 5), procedure (section 7).
Requirements are in `docs/SPEC.md` sections 9 and 11.

---

## 1. Threat Model

| Who | Wants | Answer |
|---|---|---|
| Visitor of the static hosting | The whole book without paying | Chapters are encrypted; packs hold no key; names are opaque |
| Spoiler hunter | Plot from build files | Text, conditions, titles and cues sit inside ciphertext; `book/notes/` never ships |
| Reader without the answer | Text behind a knowledge lock | The key derives from the answer and exists nowhere else |
| Hosting or network attacker | Substituted content | Signed manifest, SHA-256 per pack, AES-GCM tag with the header as additional data |
| Code sharer | Many activations from one code | Accepted risk: no accounts, no device binding |
| Reader with a key | Plaintext | Not protected, by design |
| Friend's trace or save file | Crash, injection, memory blowup | Untrusted input rules, section 2 |

## 2. Trust Boundaries

Everything below is a message from a stranger until validated.

- Trace and scene codes: 64 KB limit (`TRACE_MAX_BYTES`), schema validation, no free text, unknown block ids become empty marks.
- Save import: schema version check, migrations, bounds on every array length, ids validated with `BLOCK_ID_PATTERN`.
- Packs and manifest: signature checked before anything else, then hash, then AES-GCM; any failure stops loading that pack.
- Activation code input: normalized, length-checked, never logged.
- Book source in the compiler: expressions compile to opcodes; there is no code execution path from data.

## 3. Cryptography

- WebCrypto only: AES-256-GCM, HKDF-SHA256, PBKDF2-HMAC-SHA256, ECDSA P-256, SHA-256. No own primitives.
- Pack layout lives in `packages/crypto/src/pack-layout.ts`; the whole header is the additional authenticated data.
- Compress then encrypt (`deflate-raw`). A new random 96-bit nonce for every pack build; never reuse a nonce under one key.
- Pack file names are `HMAC(MASTER, chunkId)` in base32; asset names are content hashes.
- Lock answers: `normalizeAnswer`, PBKDF2 with salt `bookId | lockId`, iterations calibrated to 500 ms on the target Android
  and stored in the lock record. Neither the answer nor its hash is stored; the GCM tag verifies it.
- The edition key on the web is a non-extractable `CryptoKey` in IndexedDB; on mobile, Keychain and Keystore.
- A paid mobile build assembles its key from parts in the app. This only slows extraction; documentation says so plainly.

## 4. Reader Data and the Page

- The reading log, highlights and traces stay on the device. No third-party analytics, advertising or tracking SDKs.
- Plaintext never lands in Cache Storage, IndexedDB, files or saves.
- Strict CSP: `script-src 'self'`, `style-src 'self'`, `object-src 'none'`, `base-uri 'none'`. No inline script, style or handler.
- Text reaches the DOM only through text nodes. `innerHTML`, `eval` and `new Function` are banned by `tools/guard.json`.
- The `copy` handler never calls `preventDefault` and never writes the clipboard.
- An error report is sent only by the reader, after showing its contents, without book text or the log.

## 5. Secrets

- `MASTER` and the manifest signing key never reach git, logs or CI output. `.gitignore` excludes `keys/`, `*.key`, `*.pem`, `.env`.
- Development uses separate test keys, generated locally and marked as test keys in their file name.
- Creating production keys is an irreversible step: the author confirms it. Backups are documented in the release guide at stage 8.
- Losing `MASTER` makes compatible updates impossible; say so whenever keys are created.

## 6. Store Rules

- iOS: no activation code entry and no external purchase links (custom unlock mechanisms are forbidden).
- Mobile builds ship base content in the build; optional downloads show their size and ask first.
- Packs contain data only; new behaviour ships only in a new app build.
- Recheck the store rules before each mobile stage and record the date in `docs/decisions.md`.

## 7. Procedure

1. Name the input and its sender from section 1.
2. Validate at the boundary: size, schema, version, ids. Reject, never repair, untrusted data.
3. Add a negative test: garbage, truncation, tampering, oversize.
4. Run `pnpm check:leaks` after any build change.
5. Report which threats the change touches and how they were tested.
