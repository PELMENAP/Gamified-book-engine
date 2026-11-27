import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { base32Decode, base32Encode, decodePackHeader, encodePackHeader, normalizeAnswer, PACK_HEADER_SIZE } from '../src/index.ts'

describe('properties', () => {
  it('base32 round-trips any bytes', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 64 }), (bytes) => {
        const decoded = base32Decode(base32Encode(bytes))
        expect(decoded).not.toBeNull()
        expect(Array.from(decoded ?? [])).toEqual(Array.from(bytes))
      }),
    )
  })

  it('normalization is idempotent', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'grapheme', maxLength: 40 }), (text) => {
        const once = normalizeAnswer(text)
        expect(normalizeAnswer(once)).toBe(once)
      }),
    )
  })

  it('pack header round-trips', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.uint8Array({ minLength: 16, maxLength: 16 }),
        fc.uint8Array({ minLength: 12, maxLength: 12 }),
        (contentVersion, chunkIdHash, nonce) => {
          const pack = new Uint8Array(PACK_HEADER_SIZE + 16)
          pack.set(encodePackHeader({ version: 1, alg: 1, contentVersion, chunkIdHash, nonce }))
          const result = decodePackHeader(pack)
          expect(result.ok && result.header.contentVersion).toBe(contentVersion)
        },
      ),
    )
  })
})
