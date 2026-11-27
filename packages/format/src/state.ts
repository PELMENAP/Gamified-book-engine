import type { BlockId, ChapterId, FactId, Locale } from './ids.ts'

export interface TimeState {
  night: boolean
  season: number
}

export interface ReaderSnapshot {
  cards: number
  laws: Uint8Array
  time: TimeState
  runN: number
  locale: Locale
  decayStages: Uint8Array
  seen: ReadonlySet<BlockId>
  marked: ReadonlySet<BlockId>
  facts: ReadonlyMap<FactId, string>
  copied: ReadonlySet<ChapterId>
  glossaryStage: number
}

export const MAX_CARDS = 32
export const MAX_ACTIVE_CARDS = 4
export const MAX_LAWS = 2
export const MAX_INTERROGATIONS = 4
export const LAW_UNSET = 0
