# Pack file

Constants: `packages/crypto/src/pack-layout.ts`. Vectors: `packages/crypto/vectors/pack-header.json`.

| Field | Offset | Size, bytes | Constant |
|---|---|---|---|
| `magic` = `BPK1` (ASCII) | 0 | 4 | `PACK_MAGIC_OFFSET`, `PACK_MAGIC_SIZE` |
| `version` u8 = 1 | 4 | 1 | `PACK_VERSION_OFFSET` |
| `alg` u8, 1 = AES-256-GCM over deflate-raw | 5 | 1 | `PACK_ALG_OFFSET` |
| `contentVersion` u32 little-endian | 6 | 4 | `PACK_CONTENT_VERSION_OFFSET` |
| `chunkIdHash` | 10 | 16 | `PACK_CHUNK_ID_HASH_OFFSET` |
| `nonce` | 26 | 12 | `PACK_NONCE_OFFSET` |
| `ciphertext` + 16-byte GCM tag | 38 | rest | `PACK_CIPHERTEXT_OFFSET` |

- Header size: `PACK_HEADER_SIZE` = 38. Minimum pack: `PACK_MIN_SIZE` = 54 (header plus tag).
- The whole header is the AES-GCM additional data, so a changed header byte fails decryption.
- Plaintext: `deflate-raw` of the serialized `CompiledChapter`.
