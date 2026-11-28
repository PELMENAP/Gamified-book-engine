import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { lex, parseBmd } from '../src/index.ts'
import type { Token } from '../src/index.ts'

const GOLDEN_DIR = join(import.meta.dirname, 'golden')
const SPEC_SECTION_5 = readFileSync(join(GOLDEN_DIR, 'spec-sample.bmd'), 'utf8')

function joined(tokens: readonly Token[]): string {
  return tokens.map((token) => token.text).join('')
}

function expectedPositions(source: string, tokens: readonly Token[]): { line: number; col: number }[] {
  const out: { line: number; col: number }[] = []
  let line = 1
  let col = 1
  for (const token of tokens) {
    out.push(token.kind === 'bom' ? { line: 1, col: 1 } : { line, col })
    if (token.kind === 'bom') continue
    if (token.kind === 'newline') {
      line++
      col = 1
    } else {
      col += token.text.length
    }
  }
  expect(source.length).toBe(joined(tokens).length)
  return out
}

const FRAGMENTS = ['{', '}', '|', '^', '@', ':', '::', '::core', '::end', '::scene{', ' ', '  ', '\n', '\r\n', '\t', '+', '-', 'w', 'if ', 'alt ', 'decay', 'tempo word', 'a7f3', 'Я', '﻿', '"']

describe('lexer', () => {
  it('round-trips the SPEC section 5 sample byte for byte', () => {
    expect(joined(lex(SPEC_SECTION_5, 'spec-sample.bmd'))).toBe(SPEC_SECTION_5)
  })

  it('round-trips every golden input', () => {
    for (const name of readdirSync(GOLDEN_DIR).filter((entry) => entry.endsWith('.bmd'))) {
      const source = readFileSync(join(GOLDEN_DIR, name), 'utf8')
      expect(joined(lex(source, name)), name).toBe(source)
    }
  })

  it('round-trips arbitrary markup-like input and reports consistent positions', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...FRAGMENTS), { maxLength: 40 }), (parts) => {
        const source = parts.join('')
        const tokens = lex(source, 'fuzz.bmd')
        expect(joined(tokens)).toBe(source)
        const expected = expectedPositions(source, tokens)
        tokens.forEach((token, index) => {
          expect({ line: token.pos.line, col: token.pos.col }).toEqual(expected[index])
        })
        const result = parseBmd(source, 'fuzz.bmd')
        for (const error of result.errors) {
          expect(error.pos.line).toBeGreaterThanOrEqual(1)
          expect(error.pos.col).toBeGreaterThanOrEqual(1)
        }
      }),
      { numRuns: 500 },
    )
  })

  it('does not count the byte order mark in columns', () => {
    const tokens = lex('﻿::core\n', 'bom.bmd')
    expect(tokens[0]?.kind).toBe('bom')
    expect(tokens[1]?.pos).toEqual({ file: 'bom.bmd', line: 1, col: 1 })
  })

  it('recognizes a block id only at the end of a line outside spans', () => {
    const kinds = (text: string): string[] => lex(text, 'x.bmd').map((token) => token.kind)
    expect(kinds('текст ^a7f3')).toEqual(['text', 'separator', 'id'])
    expect(kinds('x^2 и далее')).toEqual(['text'])
    expect(kinds('{+c: текст ^a7f3')).toEqual(['spanOpen', 'text'])
  })

  it('splits alt and decay variants only at the innermost span', () => {
    const kinds = lex('{alt c: a | {if x: b | c}}', 'x.bmd').map((token) => token.kind)
    expect(kinds.filter((kind) => kind === 'pipe')).toHaveLength(1)
  })
})
