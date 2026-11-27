import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  PACK_HEADER_SIZE,
  base32Decode,
  base32Encode,
  decodePackHeader,
  encodePackHeader,
  fromHex,
  normalizeAnswer,
  toHex,
} from '../src/index.ts'

interface HeaderVector {
  name: string
  version: number
  alg: number
  contentVersion: number
  chunkIdHash: string
  nonce: string
  header: string
}

interface VectorFile {
  vectors: HeaderVector[]
  normalize: { input: string; output: string }[]
  base32: { hex: string; text: string }[]
}

const file = JSON.parse(readFileSync(new URL('../vectors/pack-header.json', import.meta.url), 'utf8')) as VectorFile

describe('pack header golden vectors', () => {
  for (const v of file.vectors) {
    it(`encodes ${v.name}`, () => {
      const header = encodePackHeader({
        version: v.version,
        alg: v.alg,
        contentVersion: v.contentVersion,
        chunkIdHash: fromHex(v.chunkIdHash),
        nonce: fromHex(v.nonce),
      })
      expect(header.length).toBe(PACK_HEADER_SIZE)
      expect(toHex(header)).toBe(v.header)
    })

    it(`decodes ${v.name}`, () => {
      const pack = new Uint8Array(PACK_HEADER_SIZE + 16)
      pack.set(fromHex(v.header))
      const result = decodePackHeader(pack)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.header.contentVersion).toBe(v.contentVersion)
      expect(toHex(result.header.chunkIdHash)).toBe(v.chunkIdHash)
      expect(toHex(result.header.nonce)).toBe(v.nonce)
    })
  }

  it('rejects tampered magic', () => {
    const first = file.vectors[0]
    if (!first) throw new Error('no vectors')
    const pack = new Uint8Array(PACK_HEADER_SIZE + 16)
    pack.set(fromHex(first.header))
    pack[0] = 0
    expect(decodePackHeader(pack)).toEqual({ ok: false, error: 'bad-magic' })
  })

  it('rejects a pack without room for the tag', () => {
    expect(decodePackHeader(new Uint8Array(PACK_HEADER_SIZE))).toEqual({ ok: false, error: 'too-short' })
  })
})

describe('answer normalization vectors', () => {
  for (const v of file.normalize) {
    it(JSON.stringify(v.input), () => {
      expect(normalizeAnswer(v.input)).toBe(v.output)
    })
  }
})

describe('base32 vectors', () => {
  for (const v of file.base32) {
    it(v.text || 'empty', () => {
      expect(base32Encode(fromHex(v.hex))).toBe(v.text)
      const decoded = base32Decode(v.text)
      expect(decoded && toHex(decoded)).toBe(v.hex)
    })
  }
})
