import {
  PACK_ALG_OFFSET,
  PACK_CHUNK_ID_HASH_OFFSET,
  PACK_CHUNK_ID_HASH_SIZE,
  PACK_CONTENT_VERSION_OFFSET,
  PACK_HEADER_SIZE,
  PACK_MAGIC,
  PACK_MAGIC_OFFSET,
  PACK_MAGIC_SIZE,
  PACK_MIN_SIZE,
  PACK_NONCE_OFFSET,
  PACK_NONCE_SIZE,
  PACK_VERSION,
  PACK_VERSION_OFFSET,
} from './pack-layout.ts'

export interface PackHeader {
  version: number
  alg: number
  contentVersion: number
  chunkIdHash: Uint8Array
  nonce: Uint8Array
}

export type PackHeaderError = 'too-short' | 'bad-magic' | 'unsupported-version'

export type PackHeaderResult = { ok: true; header: PackHeader } | { ok: false; error: PackHeaderError }

export function encodePackHeader(header: PackHeader): Uint8Array {
  if (header.chunkIdHash.length !== PACK_CHUNK_ID_HASH_SIZE) throw new RangeError('chunkIdHash size')
  if (header.nonce.length !== PACK_NONCE_SIZE) throw new RangeError('nonce size')
  if (!Number.isInteger(header.contentVersion) || header.contentVersion < 0 || header.contentVersion > 0xffffffff) {
    throw new RangeError('contentVersion range')
  }
  const out = new Uint8Array(PACK_HEADER_SIZE)
  for (let i = 0; i < PACK_MAGIC_SIZE; i++) out[PACK_MAGIC_OFFSET + i] = PACK_MAGIC.charCodeAt(i)
  out[PACK_VERSION_OFFSET] = header.version
  out[PACK_ALG_OFFSET] = header.alg
  new DataView(out.buffer).setUint32(PACK_CONTENT_VERSION_OFFSET, header.contentVersion, true)
  out.set(header.chunkIdHash, PACK_CHUNK_ID_HASH_OFFSET)
  out.set(header.nonce, PACK_NONCE_OFFSET)
  return out
}

export function decodePackHeader(pack: Uint8Array): PackHeaderResult {
  if (pack.length < PACK_MIN_SIZE) return { ok: false, error: 'too-short' }
  for (let i = 0; i < PACK_MAGIC_SIZE; i++) {
    if (pack[PACK_MAGIC_OFFSET + i] !== PACK_MAGIC.charCodeAt(i)) return { ok: false, error: 'bad-magic' }
  }
  const version = pack[PACK_VERSION_OFFSET] ?? 0
  if (version !== PACK_VERSION) return { ok: false, error: 'unsupported-version' }
  const view = new DataView(pack.buffer, pack.byteOffset, pack.byteLength)
  return {
    ok: true,
    header: {
      version,
      alg: pack[PACK_ALG_OFFSET] ?? 0,
      contentVersion: view.getUint32(PACK_CONTENT_VERSION_OFFSET, true),
      chunkIdHash: pack.slice(PACK_CHUNK_ID_HASH_OFFSET, PACK_CHUNK_ID_HASH_OFFSET + PACK_CHUNK_ID_HASH_SIZE),
      nonce: pack.slice(PACK_NONCE_OFFSET, PACK_NONCE_OFFSET + PACK_NONCE_SIZE),
    },
  }
}

export function packHeaderBytes(pack: Uint8Array): Uint8Array {
  return pack.subarray(0, PACK_HEADER_SIZE)
}
