import type { Position } from './ast.ts'

export type ParseErrorCode =
  | 'unknown-directive'
  | 'directive-params'
  | 'directive-trailing'
  | 'unexpected-end'
  | 'missing-end'
  | 'unterminated-span'
  | 'unknown-span'
  | 'span-header'
  | 'span-variants'
  | 'stray-close'
  | 'speaker-name'
  | 'malformed-id'
  | 'duplicate-id'
  | 'id-position'
  | 'empty-block'

export interface ParseError {
  code: ParseErrorCode
  message: string
  pos: Position
}

export function formatPosition(pos: Position): string {
  return `${pos.file}:${pos.line}:${pos.col}`
}

export function formatParseError(error: ParseError): string {
  return `${formatPosition(error.pos)}: [${error.code}] ${error.message}`
}
