import { describe, expect, it } from 'vitest'
import { LAYER_ORDER, OP_COUNT, OP_OPERANDS, OP_POPS, isBlockId } from '../src/index.ts'

describe('format constants', () => {
  it('has operand and pop tables for every opcode', () => {
    expect(OP_OPERANDS.length).toBe(OP_COUNT)
    expect(OP_POPS.length).toBe(OP_COUNT)
  })

  it('keeps the layer order of the specification', () => {
    expect(LAYER_ORDER).toEqual(['law', 'run', 'memory', 'decay', 'card', 'time'])
  })

  it('accepts generated block ids only', () => {
    expect(isBlockId('a7f3')).toBe(true)
    expect(isBlockId('k21a')).toBe(true)
    expect(isBlockId('A7F3')).toBe(false)
    expect(isBlockId('a7f')).toBe(false)
  })
})
