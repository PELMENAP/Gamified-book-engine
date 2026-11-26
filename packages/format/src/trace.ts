import type { BlockId, CardId, LawId, LawValue, SceneId } from './ids.ts'

export const TRACE_FORMAT = 1
export const TRACE_MAX_BYTES = 65536
export const TRACE_MAX_ENTRIES = 4096

export const TRACE_FLAG_HIGHLIGHT = 1
export const TRACE_FLAG_PAUSE = 2
export const TRACE_FLAG_CLOSING = 4

export interface TraceEntry {
  block: BlockId
  flags: number
}

export interface TraceCode {
  format: number
  bookId: string
  contentVersion: number
  entries: TraceEntry[]
}

export interface SceneCode {
  format: number
  bookId: string
  contentVersion: number
  scene: SceneId
  cards: CardId[]
  laws: Record<LawId, LawValue>
}
