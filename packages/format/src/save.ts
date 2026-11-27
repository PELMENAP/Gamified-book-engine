import type { BlockId, CardId, ChapterId, LawId, LawValue, LockId, PartId } from './ids.ts'

export const SAVE_SCHEMA_VERSION = 1

export interface ReadingPosition {
  block: BlockId
  offset: number
}

export interface Highlight {
  block: BlockId
  start: number
  end: number
}

export interface ChapterLogRecord {
  chapter: ChapterId
  contentVersion: number
  blocks: BlockId[]
  dwellMs: string
  visits: string
  flags: string
  decayStage: string
}

export interface OpenedLock {
  lock: LockId
  wrappedCek: string
}

export interface ReaderSettings {
  pacing: 'authored' | 'flow' | 'para'
  fontScale: number
  lineHeight: number
  font: 'default' | 'simple'
  theme: 'light' | 'dark' | 'sepia' | 'system'
  contrast: 'normal' | 'high'
  sound: boolean
  log: boolean
}

export interface SaveFile {
  schemaVersion: number
  bookId: string
  contentVersion: number
  runN: number
  cardsByPart: Record<PartId, CardId[]>
  laws: Record<LawId, LawValue>
  facts: Record<string, string>
  position: ReadingPosition | null
  highlights: Highlight[]
  locks: OpenedLock[]
  chapters: ChapterLogRecord[]
  settings: ReaderSettings
  lastOpenedAt: number
}
