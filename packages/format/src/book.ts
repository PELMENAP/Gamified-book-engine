import type { CardId, CharacterId, ChapterId, LawId, LawValue, Locale, PartId, ThemeId } from './ids.ts'

export const SOURCE_FORMAT = 1

export type LocalizedText = Record<Locale, string>

export interface BookMeta {
  format: number
  id: string
  title: LocalizedText
  author: string
  defaultLocale: Locale
  locales: Locale[]
  contentVersion: number
  parts: PartId[]
}

export type CardGroup = 'text' | 'view' | 'sense' | 'rule'

export interface CardSource {
  id: CardId
  group: CardGroup
  affectsText: boolean
  unlockPart: number
  excludes: CardId[]
  title: LocalizedText
  blurb: LocalizedText
  preview: string
  presentationClass: string | null
  audioBus: string | null
}

export interface DeckSource {
  format: number
  availableByPart: Record<PartId, number>
  cards: CardSource[]
}

export interface LawSource {
  id: LawId
  values: LawValue[]
  title: LocalizedText
}

export interface ThemeSource {
  id: ThemeId
  title: LocalizedText
  sensitive: boolean
}

export interface CharacterSource {
  id: CharacterId
  name: LocalizedText
  font: string | null
  color: string | null
  lineRhythm: number | null
  avatar: string | null
  avatarByMood: Record<string, string>
}

export interface GlossaryForm {
  word: string
  gloss: string
}

export interface GlossaryStage {
  from: ChapterId
  show: string
}

export interface GlossaryEntry {
  word: string
  meaning: string
  origin: string | null
  forms: Record<string, GlossaryForm>
  stages: GlossaryStage[]
}

export interface PartSource {
  id: PartId
  title: LocalizedText
  chapters: ChapterId[]
}

export interface EditionSource {
  edition: 'print' | 'epub'
  cards: CardId[]
  laws: Record<LawId, LawValue>
  decay: number
  time: { night: boolean }
  glossaryStage: 'final' | number
  replaceInteractive: 'print'
}

export type ChannelName = 'web' | 'ios' | 'android'
export type LicenseKind = 'code' | 'store-paid' | 'store-iap'

export interface ChannelConfig {
  channel: ChannelName
  license: LicenseKind
  packs: 'downloaded' | 'bundled'
  serviceWorker: boolean
  edition: 'full' | 'preview'
}
