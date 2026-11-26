import type { BlockId, ChapterId, SceneId } from './ids.ts'

export const IR_FORMAT = 1

export type ExprRef = number
export type StringRef = number

export type ModOp = 'before' | 'after' | 'replace' | 'remove'
export type Layer = 'law' | 'run' | 'memory' | 'decay' | 'card' | 'time'

export const LAYER_ORDER: readonly Layer[] = ['law', 'run', 'memory', 'decay', 'card', 'time']

export type BlockKind = 'p' | 'line' | 'heading' | 'recap' | 'portrait' | 'interrogation' | 'lock'

export type Pace = 'flow' | 'para' | 'word'

export interface Run {
  text: StringRef
  when?: ExprRef
  decayStage?: number
  word?: number
  wordForm?: number
  tempo?: 'word'
}

export interface Block {
  id: BlockId
  index: number
  kind: BlockKind
  core: boolean
  optional: boolean
  speaker?: number
  themes: number
  wordCount: number
  runs: Run[]
}

export interface Mod {
  layer: Layer
  priority: number
  when: ExprRef
  op: ModOp
  target: BlockId
  blocks?: Block[]
}

export type DecayRule =
  | { kind: 'none' }
  | { kind: 'visits'; step: number }
  | { kind: 'chapter'; chapter: ChapterId }

export interface Scene {
  id: SceneId
  firstBlock: number
  blockCount: number
  pov?: number
  mood: StringRef
  pace: Pace
  ambience?: StringRef
  themes: number
  decay: DecayRule
}

export type CueKind = 'ambience' | 'mood' | 'pulse'

export interface Cue {
  kind: CueKind
  block: number
  value: StringRef
}

export interface CompiledChapter {
  format: number
  chapterId: ChapterId
  contentVersion: number
  strings: string[]
  exprs: Int16Array[]
  scenes: Scene[]
  blocks: Block[]
  mods: Mod[]
  cues: Cue[]
}

export interface ResolvedRun {
  text: string
  word: number
  tempo: boolean
  ghost: boolean
}

export interface ResolvedBlock {
  id: BlockId
  source: number
  kind: BlockKind
  core: boolean
  speaker: number
  runStart: number
  runCount: number
}

export interface ResolvedChapter {
  chapterId: ChapterId
  blocks: ResolvedBlock[]
  runs: ResolvedRun[]
  blockCount: number
  runCount: number
  rootClasses: string[]
  cues: Cue[]
}
