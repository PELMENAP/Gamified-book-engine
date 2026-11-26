# Crypto: packs and locks
Root: `packages/crypto/src`. Package: `@gbe/crypto`. Tests: `packages/crypto/test/`. Vectors: `packages/crypto/vectors/`.
Rules and threat model: `docs/SECURITY.md`. Byte table: `docs/formats/pack.md`.

## Entry points

| Name | File | Role |
|---|---|---|
| `PACK_*` constants | `packages/crypto/src/pack-layout.ts` | The only place that knows pack offsets and sizes |
| `encodePackHeader` | `packages/crypto/src/pack-header.ts` | Header fields → 38 bytes |
| `decodePackHeader` | `packages/crypto/src/pack-header.ts` | Bytes → `PackHeaderResult`; rejects short packs, bad magic, unknown version |
| `packHeaderBytes` | `packages/crypto/src/pack-header.ts` | The header view passed to AES-GCM as additional data |
| `normalizeAnswer` | `packages/crypto/src/normalize.ts` | NFKC, lowercase, ё → е, punctuation → space, spaces collapsed |
| `base32Encode` | `packages/crypto/src/base32.ts` | RFC 4648 lowercase without padding, for opaque file names |
| `toHex`, `fromHex` | `packages/crypto/src/hex.ts` | Vectors and digests |

## Invariants

- No literal offset outside `packages/crypto/src/pack-layout.ts`.
- `packages/crypto/vectors/pack-header.json` is the golden file: change it only together with `PACK_VERSION`.
- Normalization is idempotent (property test) and applied identically by the compiler and the runtime.
- WebCrypto only; no own primitives. Key derivation, pack encryption and locks arrive at stage 4.

## Hot paths
None.
