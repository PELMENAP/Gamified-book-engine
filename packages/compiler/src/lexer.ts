import type { Position } from './ast.ts'

export type SpanKind = 'show' | 'hide' | 'alt' | 'decay' | 'if' | 'w' | 'tempo' | 'unknown'

export type PlainTokenKind =
  | 'bom'
  | 'newline'
  | 'blank'
  | 'text'
  | 'directive'
  | 'params'
  | 'paramsUnterminated'
  | 'speaker'
  | 'wordRef'
  | 'pipe'
  | 'spanClose'
  | 'separator'
  | 'id'
  | 'space'

export interface PlainToken {
  kind: PlainTokenKind
  text: string
  pos: Position
}

export interface SpanOpenToken {
  kind: 'spanOpen'
  text: string
  pos: Position
  span: SpanKind
  colon: boolean
}

export type Token = PlainToken | SpanOpenToken

const BOM = '﻿'
const SPAN_HEAD = /^(?:(\+)|(-)|(alt|decay|if|w|tempo)(?=[ \t:}]|$))/
const SPEAKER_NAME = /^[\p{L}\p{N}_-]*/u
const DIRECTIVE_NAME = /^[A-Za-z][A-Za-z0-9-]*/
const ID_AT_LINE_END = /^\^\S*[ \t]*$/
const WORD_REF_BODY = /^[^}\r\n]*\}/
const HORIZONTAL_SPACE = /^[ \t]*$/

function spanKindOf(head: string): SpanKind {
  const m = SPAN_HEAD.exec(head)
  if (m === null) return 'unknown'
  if (m[1] !== undefined) return 'show'
  if (m[2] !== undefined) return 'hide'
  const word = m[3]
  if (word === 'alt' || word === 'decay' || word === 'if' || word === 'w' || word === 'tempo') return word
  return 'unknown'
}

function lineEndIndex(source: string, from: number): number {
  const nl = source.indexOf('\n', from)
  if (nl < 0) return source.length
  return nl > from && source.charAt(nl - 1) === '\r' ? nl - 1 : nl
}

function findParamsEnd(source: string, open: number, lineEnd: number): number {
  let inQuote = false
  for (let i = open + 1; i < lineEnd; i++) {
    const c = source.charAt(i)
    if (c === '"') inQuote = !inQuote
    else if (c === '}' && !inQuote) return i
  }
  return -1
}

export function lex(source: string, file: string): Token[] {
  const tokens: Token[] = []
  const stack: SpanKind[] = []
  let i = 0
  let line = 1
  let lineStart = 0
  let colShift = 0

  const posAt = (index: number): Position => ({ file, line, col: index - lineStart + 1 - colShift })

  const push = (kind: PlainTokenKind, from: number, to: number): void => {
    tokens.push({ kind, text: source.slice(from, to), pos: posAt(from) })
  }

  if (source.startsWith(BOM)) {
    push('bom', 0, 1)
    i = 1
    colShift = 1
  }

  while (i < source.length) {
    const lineEnd = lineEndIndex(source, i)

    if (HORIZONTAL_SPACE.test(source.slice(i, lineEnd))) {
      stack.length = 0
      if (lineEnd > i) push('blank', i, lineEnd)
      i = lineEnd
    } else if (source.startsWith('::', i)) {
      stack.length = 0
      i = lexDirectiveLine(i, lineEnd)
    } else {
      const speakerLine = source.charAt(i) === '@'
      if (speakerLine) stack.length = 0
      i = lexInlineLine(i, lineEnd, speakerLine)
    }

    if (i < source.length) {
      const nlEnd = source.charAt(i) === '\r' ? i + 2 : i + 1
      push('newline', i, nlEnd)
      i = nlEnd
      line++
      lineStart = i
      colShift = 0
    }
  }
  return tokens

  function lexDirectiveLine(start: number, lineEnd: number): number {
    const nameMatch = DIRECTIVE_NAME.exec(source.slice(start + 2, lineEnd))
    let at = start + 2 + (nameMatch === null ? 0 : nameMatch[0].length)
    push('directive', start, at)
    if (source.charAt(at) === '{') {
      const close = findParamsEnd(source, at, lineEnd)
      if (close < 0) {
        push('paramsUnterminated', at, lineEnd)
        return lineEnd
      }
      push('params', at, close + 1)
      at = close + 1
    }
    if (at < lineEnd) {
      const tail = source.slice(at, lineEnd)
      const spaces = /^[ \t]*/.exec(tail)
      const spaceLength = spaces === null ? 0 : spaces[0].length
      if (spaceLength > 0) push('space', at, at + spaceLength)
      if (at + spaceLength < lineEnd) push('text', at + spaceLength, lineEnd)
    }
    return lineEnd
  }

  function lexInlineLine(start: number, lineEnd: number, speakerLine: boolean): number {
    let at = start
    let textStart = start
    const flush = (to: number): void => {
      if (to > textStart) push('text', textStart, to)
    }
    if (speakerLine) {
      const m = SPEAKER_NAME.exec(source.slice(at + 1, lineEnd))
      const end = at + 1 + (m === null ? 0 : m[0].length)
      push('speaker', at, end)
      at = end
      textStart = at
    }
    while (at < lineEnd) {
      const c = source.charAt(at)
      if (c === '{') {
        flush(at)
        at = lexSpanOpen(at, lineEnd)
        textStart = at
        continue
      }
      if (c === '}') {
        flush(at)
        push('spanClose', at, at + 1)
        stack.pop()
        at++
        textStart = at
        continue
      }
      if (c === '|' && (stack[stack.length - 1] === 'alt' || stack[stack.length - 1] === 'decay')) {
        flush(at)
        push('pipe', at, at + 1)
        at++
        textStart = at
        continue
      }
      if (c === '^' && stack.length === 0 && ID_AT_LINE_END.test(source.slice(at, lineEnd))) {
        const before = at === start ? '' : source.charAt(at - 1)
        if (at === start || before === ' ' || before === '\t') {
          let sepStart = at
          while (sepStart > textStart && /[ \t]/.test(source.charAt(sepStart - 1))) sepStart--
          flush(sepStart)
          if (at > sepStart) push('separator', sepStart, at)
          const idMatch = /^\^\S*/.exec(source.slice(at, lineEnd))
          const idEnd = at + (idMatch === null ? 1 : idMatch[0].length)
          push('id', at, idEnd)
          if (idEnd < lineEnd) push('space', idEnd, lineEnd)
          return lineEnd
        }
      }
      at++
    }
    flush(lineEnd)
    return lineEnd
  }

  function lexSpanOpen(open: number, lineEnd: number): number {
    const rest = source.slice(open + 1, lineEnd)
    const kind = spanKindOf(rest)
    if (kind === 'w') {
      const body = WORD_REF_BODY.exec(rest)
      if (body !== null) {
        push('wordRef', open, open + 1 + body[0].length)
        return open + 1 + body[0].length
      }
    }
    let headEnd = open + 1
    while (headEnd < lineEnd) {
      const c = source.charAt(headEnd)
      if (c === ':' || c === '}') break
      headEnd++
    }
    const colon = headEnd < lineEnd && source.charAt(headEnd) === ':'
    const end = colon ? headEnd + 1 : headEnd
    tokens.push({ kind: 'spanOpen', text: source.slice(open, end), pos: posAt(open), span: kind, colon })
    stack.push(kind)
    return end
  }
}
