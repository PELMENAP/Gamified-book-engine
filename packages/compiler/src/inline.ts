import type { InlineNode, Position, RawText } from './ast.ts'
import type { ParseError, ParseErrorCode } from './errors.ts'
import type { PlainToken, SpanOpenToken, Token } from './lexer.ts'

const REFERENCE_NAME = /^[A-Za-z0-9_-]+$/
const GLOSSARY_WORD = /^[\p{L}\p{N}_-]+$/u
const GLOSSARY_FORM = /^[A-Za-z0-9_-]+$/
const WORD_REF = /^\{w([ \t]*)(.*?)[ \t]*\}$/
const ALT_VARIANT_COUNT = 2
const DECAY_MIN_STAGES = 2
const TEMPO_MODE = 'word'

interface Sequence {
  nodes: InlineNode[]
  end: 'close' | 'pipe' | 'eof'
}

export class InlineParser {
  private index = 0
  private readonly tokens: readonly Token[]
  private readonly errors: ParseError[]

  constructor(tokens: readonly Token[], errors: ParseError[]) {
    this.tokens = tokens
    this.errors = errors
  }

  parse(): InlineNode[] {
    return this.sequence(false, false).nodes
  }

  private fail(code: ParseErrorCode, message: string, pos: Position): void {
    this.errors.push({ code, message, pos })
  }

  private sequence(inSpan: boolean, splitPipe: boolean): Sequence {
    const nodes: InlineNode[] = []
    for (;;) {
      const token = this.tokens[this.index]
      if (token === undefined) return { nodes, end: 'eof' }
      if (token.kind === 'spanClose') {
        if (inSpan) return { nodes, end: 'close' }
        this.fail('stray-close', 'unmatched "}" has no opening span', token.pos)
        this.index++
      } else if (token.kind === 'pipe' && splitPipe) {
        return { nodes, end: 'pipe' }
      } else if (token.kind === 'spanOpen') {
        this.index++
        const node = this.span(token)
        if (node !== null) nodes.push(node)
      } else if (token.kind === 'wordRef') {
        this.index++
        const node = this.wordRef(token)
        if (node !== null) nodes.push(node)
      } else {
        this.index++
        appendText(nodes, token.text, token.pos)
      }
    }
  }

  private consumeClose(sequence: Sequence, open: SpanOpenToken): void {
    if (sequence.end === 'close') this.index++
    else this.fail('unterminated-span', `span ${open.text} is not closed: expected "}"`, open.pos)
  }

  private span(open: SpanOpenToken): InlineNode | null {
    const header = open.colon ? open.text.slice(1, -1) : open.text.slice(1)
    const headerPos = shift(open.pos, 1)

    if (open.span === 'unknown') {
      this.fail('unknown-span', `unknown span ${open.text}`, open.pos)
      this.discardBody()
      return null
    }
    if (open.span === 'w') {
      this.fail('unterminated-span', `glossary reference ${open.text} is not closed: expected "}"`, open.pos)
      this.discardBody()
      return null
    }
    if (!open.colon) {
      this.fail('span-header', `span ${open.text} needs ":" after its header`, open.pos)
      this.discardBody()
      return null
    }

    if (open.span === 'show' || open.span === 'hide') {
      const card = reference(header.slice(1), shift(headerPos, 1))
      if (card === null || !REFERENCE_NAME.test(card.text)) {
        this.fail('span-header', `card name is missing or invalid in ${open.text}`, open.pos)
        this.discardBody()
        return null
      }
      const body = this.sequence(true, false)
      this.consumeClose(body, open)
      return { kind: open.span, pos: open.pos, card, children: body.nodes }
    }

    if (open.span === 'alt') {
      const card = reference(header.slice(3), shift(headerPos, 3))
      if (card === null || !REFERENCE_NAME.test(card.text)) {
        this.fail('span-header', `card name is missing or invalid in ${open.text}`, open.pos)
        this.discardBody()
        return null
      }
      const variants = this.variants(open)
      if (variants.length !== ALT_VARIANT_COUNT) {
        this.fail('span-variants', `{alt} takes exactly ${ALT_VARIANT_COUNT} variants separated by "|", got ${variants.length}`, open.pos)
      }
      return { kind: 'alt', pos: open.pos, card, variants }
    }

    if (open.span === 'decay') {
      if (header.trim() !== 'decay') {
        this.fail('span-header', `{decay} takes no argument before ":", got ${open.text}`, open.pos)
        this.discardBody()
        return null
      }
      const stages = this.variants(open)
      if (stages.length < DECAY_MIN_STAGES) {
        this.fail('span-variants', `{decay} needs at least ${DECAY_MIN_STAGES} stages separated by "|", got ${stages.length}`, open.pos)
      }
      return { kind: 'decay', pos: open.pos, stages }
    }

    if (open.span === 'if') {
      const expr = reference(header.slice(2), shift(headerPos, 2))
      if (expr === null) {
        this.fail('span-header', `expression is missing in ${open.text}`, open.pos)
        this.discardBody()
        return null
      }
      const body = this.sequence(true, false)
      this.consumeClose(body, open)
      return { kind: 'if', pos: open.pos, expr, children: body.nodes }
    }

    const mode = reference(header.slice(5), shift(headerPos, 5))
    if (mode === null || mode.text !== TEMPO_MODE) {
      this.fail('span-header', `{tempo} mode must be "${TEMPO_MODE}", got ${open.text}`, open.pos)
      this.discardBody()
      return null
    }
    const body = this.sequence(true, false)
    this.consumeClose(body, open)
    return { kind: 'tempo', pos: open.pos, mode, children: body.nodes }
  }

  private variants(open: SpanOpenToken): InlineNode[][] {
    const result: InlineNode[][] = []
    for (;;) {
      const body = this.sequence(true, true)
      result.push(trimEdges(body.nodes))
      if (body.end === 'pipe') {
        this.index++
        continue
      }
      this.consumeClose(body, open)
      return result
    }
  }

  private discardBody(): void {
    const body = this.sequence(true, false)
    if (body.end === 'close') this.index++
  }

  private wordRef(token: PlainToken): InlineNode | null {
    const match = WORD_REF.exec(token.text)
    const spaces = match === null ? 0 : (match[1] ?? '').length
    const ref = match === null ? '' : (match[2] ?? '')
    const dot = ref.indexOf('.')
    const word = dot < 0 ? ref : ref.slice(0, dot)
    const form = dot < 0 ? null : ref.slice(dot + 1)
    const valid = GLOSSARY_WORD.test(word) && (form === null || GLOSSARY_FORM.test(form))
    if (match === null || !valid) {
      this.fail('span-header', `invalid glossary reference ${token.text}: expected {w word} or {w word.form}`, token.pos)
      return null
    }
    const wordPos = shift(token.pos, 2 + spaces)
    return {
      kind: 'word',
      pos: token.pos,
      word: { pos: wordPos, text: word },
      form: form === null ? null : { pos: shift(wordPos, word.length + 1), text: form },
    }
  }
}

function shift(pos: Position, columns: number): Position {
  return { file: pos.file, line: pos.line, col: pos.col + columns }
}

function reference(raw: string, pos: Position): RawText | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  const lead = raw.length - raw.trimStart().length
  return { pos: shift(pos, lead), text: trimmed }
}

export function appendText(nodes: InlineNode[], text: string, pos: Position): void {
  if (text.length === 0) return
  const last = nodes[nodes.length - 1]
  if (last !== undefined && last.kind === 'text') last.text += text
  else nodes.push({ kind: 'text', pos, text })
}

function trimEdges(nodes: InlineNode[]): InlineNode[] {
  const first = nodes[0]
  if (first !== undefined && first.kind === 'text') {
    const trimmed = first.text.replace(/^[ \t]+/, '')
    first.pos = shift(first.pos, first.text.length - trimmed.length)
    first.text = trimmed
  }
  const last = nodes[nodes.length - 1]
  if (last !== undefined && last.kind === 'text') last.text = last.text.replace(/[ \t]+$/, '')
  return nodes.filter((node) => node.kind !== 'text' || node.text.length > 0)
}

export function trimLeadingSpace(nodes: InlineNode[]): void {
  const first = nodes[0]
  if (first === undefined || first.kind !== 'text') return
  const trimmed = first.text.replace(/^[ \t]+/, '')
  first.pos = shift(first.pos, first.text.length - trimmed.length)
  first.text = trimmed
  if (trimmed.length === 0) nodes.shift()
}

export function isBlankText(nodes: readonly InlineNode[]): boolean {
  return nodes.every((node: InlineNode): boolean => node.kind === 'text' && node.text.trim().length === 0)
}
