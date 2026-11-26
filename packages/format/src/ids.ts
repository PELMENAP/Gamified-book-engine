export type BlockId = string
export type ChapterId = string
export type SceneId = string
export type PartId = string
export type CardId = string
export type LawId = string
export type LawValue = string
export type FactId = string
export type ThemeId = string
export type CharacterId = string
export type LockId = string
export type InterrogationId = string
export type Locale = string

export const BLOCK_ID_LENGTH = 4
export const BLOCK_ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
export const BLOCK_ID_PATTERN = /^[0-9a-z]{4}$/
export const CHAPTER_ID_PATTERN = /^ch[0-9]{2}$/
export const SCENE_ID_PATTERN = /^ch[0-9]{2}\.s[0-9]{2}$/
export const PART_ID_PATTERN = /^[0-9]{2}$/

export function isBlockId(value: string): boolean {
  return BLOCK_ID_PATTERN.test(value)
}
