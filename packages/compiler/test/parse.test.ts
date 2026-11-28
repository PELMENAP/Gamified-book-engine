import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { formatParseError, parseBmd } from '../src/index.ts'
import { stableJson } from './golden-json.ts'

const GOLDEN_DIR = join(import.meta.dirname, 'golden')
const UPDATE = process.env['GOLDEN_UPDATE'] === '1'
const inputs = readdirSync(GOLDEN_DIR).filter((name) => name.endsWith('.bmd')).sort()

describe('golden parse', () => {
  it('has golden inputs', () => {
    expect(inputs.length).toBeGreaterThan(0)
  })

  for (const name of inputs) {
    it(`parses ${name} without errors and matches the committed AST`, () => {
      const source = readFileSync(join(GOLDEN_DIR, name), 'utf8')
      const result = parseBmd(source, name)
      expect(result.errors.map(formatParseError)).toEqual([])
      const actual = stableJson(result.ast)
      const goldenPath = join(GOLDEN_DIR, name.replace(/\.bmd$/, '.ast.json'))
      if (UPDATE) writeFileSync(goldenPath, actual)
      expect(existsSync(goldenPath), `missing ${goldenPath}; run with GOLDEN_UPDATE=1`).toBe(true)
      expect(actual).toBe(readFileSync(goldenPath, 'utf8'))
    })
  }
})
