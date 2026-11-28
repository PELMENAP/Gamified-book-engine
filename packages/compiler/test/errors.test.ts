import { describe, expect, it } from 'vitest'
import { formatParseError, parseBmd, parseChapter } from '../src/index.ts'
import type { ParseErrorCode } from '../src/index.ts'

interface Failure {
  code: ParseErrorCode
  line: number
  col: number
}

function failures(source: string, file = 'case.bmd'): Failure[] {
  return parseBmd(source, file).errors.map((error) => ({ code: error.code, line: error.pos.line, col: error.pos.col }))
}

const HEAD = '::scene{id=ch01.s01}\n\n'

describe('syntax errors point to file:line:col', () => {
  it('unknown directive', () => {
    expect(failures(HEAD + '::foo\n')).toEqual([{ code: 'unknown-directive', line: 3, col: 1 }])
  })

  it('directive name missing', () => {
    expect(failures(HEAD + ':: core\n')).toEqual([{ code: 'unknown-directive', line: 3, col: 1 }])
  })

  it('unterminated span at its opening brace', () => {
    expect(failures(HEAD + 'Текст {+card: без конца ^a7f3\n')).toEqual([{ code: 'unterminated-span', line: 3, col: 7 }])
  })

  it('unterminated nested span reports the inner one', () => {
    expect(failures(HEAD + 'Текст {+card: раз {if x: два} три\n')).toEqual([{ code: 'unterminated-span', line: 3, col: 7 }])
  })

  it('unterminated glossary reference', () => {
    expect(failures(HEAD + 'Слово {w хиус дальше\n')).toEqual([{ code: 'unterminated-span', line: 3, col: 7 }])
  })

  it('span left open at a blank line does not leak into the next paragraph', () => {
    expect(failures(HEAD + 'Первый {+card: абзац\n\nВторой абзац ^a7f3\n')).toEqual([{ code: 'unterminated-span', line: 3, col: 8 }])
  })

  it('missing ::end points to the opening directive', () => {
    expect(failures(HEAD + '::core\nТекст ^a7f3\n')).toEqual([{ code: 'missing-end', line: 3, col: 1 }])
  })

  it('missing ::end of a block closed by the next scene', () => {
    expect(failures(HEAD + '::optional\nТекст ^a7f3\n\n::scene{id=ch01.s02}\n')).toEqual([{ code: 'missing-end', line: 3, col: 1 }])
  })

  it('::end without an opener', () => {
    expect(failures(HEAD + 'Текст ^a7f3\n\n::end\n')).toEqual([{ code: 'unexpected-end', line: 5, col: 1 }])
  })

  it('malformed block ids', () => {
    expect(failures(HEAD + 'Текст ^zz\n')).toEqual([{ code: 'malformed-id', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст ^A7F3\n')).toEqual([{ code: 'malformed-id', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст ^a7f3x\n')).toEqual([{ code: 'malformed-id', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст ^\n')).toEqual([{ code: 'malformed-id', line: 3, col: 7 }])
  })

  it('block id inside the paragraph', () => {
    expect(failures(HEAD + 'Первая ^a7f3\nвторая ^b19c\n')).toEqual([{ code: 'id-position', line: 3, col: 8 }])
  })

  it('duplicate id in one file points to the second use and names the first', () => {
    const result = parseBmd(HEAD + 'Один ^a7f3\n\nДва ^a7f3\n', 'dup.bmd')
    expect(result.errors).toHaveLength(1)
    const [error] = result.errors
    expect(error?.code).toBe('duplicate-id')
    expect(formatParseError(error!)).toBe('dup.bmd:5:5: [duplicate-id] duplicate block id ^a7f3, first used at dup.bmd:3:6')
  })

  it('duplicate id across the files of one chapter', () => {
    const result = parseChapter([
      { file: 's01.bmd', source: HEAD + 'Один ^a7f3\n' },
      { file: 's02.bmd', source: '::scene{id=ch01.s02}\n\nДва ^a7f3\n' },
    ])
    expect(result.errors.map((e) => `${e.pos.file}:${e.pos.line}:${e.pos.col}:${e.code}`)).toEqual(['s02.bmd:3:5:duplicate-id'])
  })

  it('ids may repeat in separate chapters', () => {
    expect(parseChapter([{ file: 'a.bmd', source: HEAD + 'Один ^a7f3\n' }]).errors).toEqual([])
    expect(parseChapter([{ file: 'b.bmd', source: HEAD + 'Один ^a7f3\n' }]).errors).toEqual([])
  })

  it('unknown span', () => {
    expect(failures(HEAD + 'Текст {foo: x} дальше\n')).toEqual([{ code: 'unknown-span', line: 3, col: 7 }])
  })

  it('span header problems', () => {
    expect(failures(HEAD + 'Текст {+: x}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {+card}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {if : x}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {alt: a | b}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {decay c: a | b}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {tempo line: a}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {w}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {w хиус.}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {w хиус: x}\n')).toEqual([{ code: 'span-header', line: 3, col: 7 }])
  })

  it('variant counts', () => {
    expect(failures(HEAD + 'Текст {alt c: a | b | c}\n')).toEqual([{ code: 'span-variants', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {alt c: a}\n')).toEqual([{ code: 'span-variants', line: 3, col: 7 }])
    expect(failures(HEAD + 'Текст {decay: a}\n')).toEqual([{ code: 'span-variants', line: 3, col: 7 }])
  })

  it('unmatched closing brace', () => {
    expect(failures(HEAD + 'Текст } дальше\n')).toEqual([{ code: 'stray-close', line: 3, col: 7 }])
  })

  it('directive parameters', () => {
    expect(failures('::scene\n')).toEqual([{ code: 'directive-params', line: 1, col: 1 }])
    expect(failures('::scene{}\n')).toEqual([{ code: 'directive-params', line: 1, col: 9 }])
    expect(failures('::scene{id=a\n')).toEqual([{ code: 'directive-params', line: 1, col: 8 }])
    expect(failures(HEAD + '::lock\n::end\n')).toEqual([{ code: 'directive-params', line: 3, col: 1 }])
    expect(failures(HEAD + '::core{x=1}\n::end\n')).toEqual([{ code: 'directive-params', line: 3, col: 8 }])
    expect(failures('::scene{id=a} лишнее\n')).toEqual([{ code: 'directive-trailing', line: 1, col: 15 }])
    expect(failures(HEAD + '::core лишнее\n::end\n')).toEqual([{ code: 'directive-trailing', line: 3, col: 8 }])
  })

  it('speaker without a name', () => {
    expect(failures(HEAD + '@ — реплика ^a7f3\n')).toEqual([{ code: 'speaker-name', line: 3, col: 1 }])
  })

  it('paragraph without text', () => {
    expect(failures(HEAD + '^a7f3\n')).toEqual([{ code: 'empty-block', line: 3, col: 1 }])
    expect(failures(HEAD + '@lux ^a7f3\n')).toEqual([{ code: 'empty-block', line: 3, col: 1 }])
  })

  it('reports columns on lines ended by CRLF and after a BOM', () => {
    expect(failures('﻿::scene{id=a}\r\n\r\nТекст ^zz\r\n')).toEqual([{ code: 'malformed-id', line: 3, col: 7 }])
  })

  it('reports several errors in file order', () => {
    expect(failures(HEAD + '::foo\n\nТекст ^zz\n\n::core\n')).toEqual([
      { code: 'unknown-directive', line: 3, col: 1 },
      { code: 'malformed-id', line: 5, col: 7 },
      { code: 'missing-end', line: 7, col: 1 },
    ])
  })

  it('formats an error as file:line:col', () => {
    const [error] = parseBmd('::foo\n', 'book/ch01/s01.bmd').errors
    expect(formatParseError(error!)).toBe('book/ch01/s01.bmd:1:1: [unknown-directive] unknown directive ::foo')
  })
})

describe('span rules', () => {
  function firstParagraph(source: string) {
    const scene = parseBmd(source, 'x.bmd').ast.children[0]
    if (scene === undefined || scene.kind !== 'scene') throw new Error('no scene')
    const paragraph = scene.children[0]
    if (paragraph === undefined || paragraph.kind !== 'paragraph') throw new Error('no paragraph')
    return paragraph
  }

  it('keeps everything after the first colon literal', () => {
    const paragraph = firstParagraph(HEAD + 'А{+t:, б: в}\n')
    const span = paragraph.children[1]
    expect(span?.kind).toBe('show')
    if (span?.kind === 'show') expect(span.children).toEqual([{ kind: 'text', pos: { file: 'x.bmd', line: 3, col: 6 }, text: ', б: в' }])
  })

  it('trims spaces around the pipe and keeps outside spacing in the surrounding text', () => {
    const paragraph = firstParagraph(HEAD + 'А {alt c:  x  |  y  } Б\n')
    expect(paragraph.children.map((node) => node.kind)).toEqual(['text', 'alt', 'text'])
    const alt = paragraph.children[1]
    if (alt?.kind === 'alt') expect(alt.variants.map((v) => v.map((n) => (n.kind === 'text' ? n.text : n.kind)))).toEqual([['x'], ['y']])
    expect(paragraph.children[0]).toMatchObject({ text: 'А ' })
    expect(paragraph.children[2]).toMatchObject({ text: ' Б' })
  })

  it('treats a pipe outside alt and decay as text', () => {
    const paragraph = firstParagraph(HEAD + 'А {if x: a | b}\n')
    const span = paragraph.children[1]
    if (span?.kind === 'if') expect(span.children).toMatchObject([{ text: ' a | b' }])
  })
})
