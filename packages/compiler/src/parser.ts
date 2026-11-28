import { BLOCK_ID_PATTERN } from '@gbe/format'
import type {
  BlockIdNode,
  BlockNode,
  ContainerKind,
  ContainerNode,
  FileNode,
  InlineNode,
  ParagraphNode,
  Position,
  RawText,
  SceneNode,
  SpeakerNode,
} from './ast.ts'
import type { ParseError, ParseErrorCode } from './errors.ts'
import { InlineParser, isBlankText, trimLeadingSpace } from './inline.ts'
import { lex } from './lexer.ts'
import type { PlainToken, Token } from './lexer.ts'

type ParamsPolicy = 'required' | 'optional' | 'forbidden'

const DIRECTIVES = new Map<string, ParamsPolicy>([
  ['scene', 'required'],
  ['core', 'forbidden'],
  ['optional', 'forbidden'],
  ['interrogation', 'required'],
  ['lock', 'required'],
  ['recap', 'optional'],
  ['portrait', 'optional'],
  ['print', 'optional'],
  ['end', 'forbidden'],
])

export interface SourceFile {
  file: string
  source: string
}

export interface ParseResult {
  ast: FileNode
  errors: ParseError[]
}

export interface ChapterParseResult {
  files: FileNode[]
  errors: ParseError[]
}

export type BlockIdRegistry = Map<string, Position>

interface Line {
  tokens: Token[]
  newline: Token | null
}

function splitLines(tokens: readonly Token[]): Line[] {
  const lines: Line[] = []
  let current: Line = { tokens: [], newline: null }
  for (const token of tokens) {
    if (token.kind === 'bom') continue
    if (token.kind === 'newline') {
      current.newline = token
      lines.push(current)
      current = { tokens: [], newline: null }
    } else {
      current.tokens.push(token)
    }
  }
  if (current.tokens.length > 0) lines.push(current)
  return lines
}

function formatPos(pos: Position): string {
  return `${pos.file}:${pos.line}:${pos.col}`
}

function isContainerKind(name: string): name is ContainerKind {
  return name !== 'scene' && name !== 'end' && DIRECTIVES.has(name)
}

class BlockParser {
  readonly errors: ParseError[] = []
  private readonly file: string
  private readonly ids: BlockIdRegistry
  private readonly root: FileNode
  private scene: SceneNode | null = null
  private readonly open: ContainerNode[] = []
  private pending: Line[] = []

  constructor(file: string, ids: BlockIdRegistry) {
    this.file = file
    this.ids = ids
    this.root = { kind: 'file', pos: { file, line: 1, col: 1 }, children: [] }
  }

  run(source: string): FileNode {
    const lines = splitLines(lex(source, this.file))
    for (const line of lines) {
      const first = line.tokens[0]
      if (first === undefined || first.kind === 'blank') {
        this.flushParagraph()
      } else if (first.kind === 'directive') {
        this.flushParagraph()
        this.directive(line.tokens)
      } else {
        if (first.kind === 'speaker') this.flushParagraph()
        this.pending.push(line)
      }
    }
    this.flushParagraph()
    for (const node of this.open) this.reportMissingEnd(node)
    return this.root
  }

  private fail(code: ParseErrorCode, message: string, pos: Position): void {
    this.errors.push({ code, message, pos })
  }

  private reportMissingEnd(node: ContainerNode): void {
    this.fail('missing-end', `::${node.kind} is not closed: expected ::end`, node.pos)
  }

  private target(): BlockNode[] | (SceneNode | BlockNode)[] {
    const innermost = this.open[this.open.length - 1]
    if (innermost !== undefined) return innermost.children
    if (this.scene !== null) return this.scene.children
    return this.root.children
  }

  private directive(tokens: Token[]): void {
    const head = tokens[0]
    if (head === undefined) return
    const name = head.text.slice(2)
    const policy = DIRECTIVES.get(name)
    if (policy === undefined) {
      this.fail('unknown-directive', name.length === 0 ? 'directive name is missing after "::"' : `unknown directive ::${name}`, head.pos)
      return
    }
    const second = tokens[1]
    let params: RawText | null = null
    let rest = 1
    if (second !== undefined && second.kind === 'params') {
      params = { pos: { file: second.pos.file, line: second.pos.line, col: second.pos.col + 1 }, text: second.text.slice(1, -1) }
      rest = 2
    } else if (second !== undefined && second.kind === 'paramsUnterminated') {
      this.fail('directive-params', `parameters of ::${name} are not closed: expected "}"`, second.pos)
      rest = 2
    }
    for (const token of tokens.slice(rest)) {
      if (token.kind === 'text') this.fail('directive-trailing', `unexpected text after ::${name}`, token.pos)
    }
    if (params !== null && policy === 'forbidden') {
      this.fail('directive-params', `::${name} takes no parameters`, params.pos)
      params = null
    }
    if (policy === 'required' && (second === undefined || second.kind === 'text' || second.kind === 'space')) {
      this.fail('directive-params', `::${name} requires parameters in {…}`, head.pos)
    } else if (policy === 'required' && params !== null && params.text.trim().length === 0) {
      this.fail('directive-params', `::${name} parameters are empty`, params.pos)
    }

    if (name === 'end') {
      if (this.open.pop() === undefined) this.fail('unexpected-end', '::end has no open block to close', head.pos)
    } else if (name === 'scene') {
      for (let i = this.open.length - 1; i >= 0; i--) {
        const node = this.open[i]
        if (node !== undefined) this.reportMissingEnd(node)
      }
      this.open.length = 0
      const afterName = { file: head.pos.file, line: head.pos.line, col: head.pos.col + head.text.length }
      this.scene = { kind: 'scene', pos: head.pos, params: params ?? { pos: afterName, text: '' }, children: [] }
      this.root.children.push(this.scene)
    } else if (isContainerKind(name)) {
      const node: ContainerNode = { kind: name, pos: head.pos, params, children: [] }
      this.target().push(node)
      this.open.push(node)
    }
  }

  private flushParagraph(): void {
    if (this.pending.length === 0) return
    const lines = this.pending
    this.pending = []
    const paragraph = this.paragraph(lines)
    if (paragraph !== null) this.target().push(paragraph)
  }

  private paragraph(lines: Line[]): ParagraphNode | null {
    const flat: Token[] = []
    const last = lines.length - 1
    let id: BlockIdNode | null = null
    let speaker: SpeakerNode | null = null
    lines.forEach((line, index) => {
      const tokens = line.tokens.filter((token: Token): boolean => token.kind !== 'space')
      const tail = tokens[tokens.length - 1]
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        if (token === undefined) continue
        if (token.kind === 'id') {
          if (index === last && token === tail) id = this.blockId(token)
          else this.fail('id-position', `block id ${token.text} must end the paragraph`, token.pos)
        } else if (token.kind === 'separator' && tokens[i + 1]?.kind === 'id' && index === last) {
          continue
        } else if (token.kind === 'speaker' && index === 0 && i === 0) {
          speaker = this.speaker(token)
        } else {
          flat.push(token)
        }
      }
      const newline = line.newline
      if (index < last && newline !== null) flat.push({ kind: 'text', text: '\n', pos: newline.pos } satisfies PlainToken)
    })

    const children: InlineNode[] = new InlineParser(flat, this.errors).parse()
    if (speaker !== null) trimLeadingSpace(children)
    const first = lines[0]?.tokens[0]
    if (first === undefined) return null
    if (isBlankText(children)) {
      this.fail('empty-block', 'paragraph has no text', first.pos)
      return null
    }
    return { kind: 'paragraph', pos: first.pos, speaker, children, id }
  }

  private speaker(token: Token): SpeakerNode | null {
    const name = token.text.slice(1)
    if (name.length === 0) {
      this.fail('speaker-name', 'speaker name is missing after "@"', token.pos)
      return null
    }
    return { kind: 'speaker', pos: token.pos, name }
  }

  private blockId(token: Token): BlockIdNode | null {
    const value = token.text.slice(1)
    if (!BLOCK_ID_PATTERN.test(value)) {
      this.fail('malformed-id', `malformed block id ${token.text}: expected ^ and 4 characters 0-9a-z`, token.pos)
      return null
    }
    const first = this.ids.get(value)
    if (first !== undefined) {
      this.fail('duplicate-id', `duplicate block id ${token.text}, first used at ${formatPos(first)}`, token.pos)
      return null
    }
    this.ids.set(value, token.pos)
    return { kind: 'id', pos: token.pos, value }
  }
}

function byPosition(a: ParseError, b: ParseError): number {
  return a.pos.line - b.pos.line || a.pos.col - b.pos.col
}

export function parseBmd(source: string, file: string, ids: BlockIdRegistry = new Map()): ParseResult {
  const parser = new BlockParser(file, ids)
  const ast = parser.run(source)
  return { ast, errors: parser.errors.sort(byPosition) }
}

export function parseChapter(sources: readonly SourceFile[]): ChapterParseResult {
  const ids: BlockIdRegistry = new Map()
  const files: FileNode[] = []
  const errors: ParseError[] = []
  for (const { file, source } of sources) {
    const result = parseBmd(source, file, ids)
    files.push(result.ast)
    errors.push(...result.errors)
  }
  return { files, errors }
}
