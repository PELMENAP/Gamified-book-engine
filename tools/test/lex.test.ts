import { describe, expect, it } from 'vitest'
import { lex } from '../lib/lex.ts'

describe('lex', () => {
  it('finds line and block comments with their lines', () => {
    const r = lex('const a = 1\n// one\nconst b = 2 /* two\nthree */\n')
    expect(r.comments.map((c) => c.line)).toEqual([2, 3])
  })

  it('ignores comment markers inside strings, templates and regexes', () => {
    const r = lex("const url = 'https://x'\nconst t = `a // b ${1 + 1} /* c */`\nconst rx = /\\/\\/[a-z]/g\nconst d = 4 / 2 / 1\n")
    expect(r.comments).toEqual([])
  })

  it('blanks string content in code but keeps it in withStrings', () => {
    const r = lex("import { x } from '@gbe/format'\nconst s = 'document'\n")
    expect(r.code).not.toContain('document')
    expect(r.code).not.toContain('@gbe/format')
    expect(r.withStrings).toContain("'@gbe/format'")
  })

  it('keeps line numbers stable', () => {
    const source = 'const a = `x\ny`\n// c\n'
    const r = lex(source)
    expect(r.code.split('\n').length).toBe(source.split('\n').length)
    expect(r.comments[0]?.line).toBe(3)
  })

  it('tracks nested template interpolation', () => {
    const r = lex('const a = `${`${1}`}` // tail\n')
    expect(r.comments.length).toBe(1)
  })

  it('skips a shebang', () => {
    expect(lex('#!/usr/bin/env node\nconst a = 1\n').comments).toEqual([])
  })
})
