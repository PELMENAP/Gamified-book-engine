export interface Position {
  file: string
  line: number
  col: number
}

export interface RawText {
  pos: Position
  text: string
}

export interface TextNode {
  kind: 'text'
  pos: Position
  text: string
}

export interface ShowSpanNode {
  kind: 'show'
  pos: Position
  card: RawText
  children: InlineNode[]
}

export interface HideSpanNode {
  kind: 'hide'
  pos: Position
  card: RawText
  children: InlineNode[]
}

export interface AltSpanNode {
  kind: 'alt'
  pos: Position
  card: RawText
  variants: InlineNode[][]
}

export interface DecaySpanNode {
  kind: 'decay'
  pos: Position
  stages: InlineNode[][]
}

export interface IfSpanNode {
  kind: 'if'
  pos: Position
  expr: RawText
  children: InlineNode[]
}

export interface WordSpanNode {
  kind: 'word'
  pos: Position
  word: RawText
  form: RawText | null
}

export interface TempoSpanNode {
  kind: 'tempo'
  pos: Position
  mode: RawText
  children: InlineNode[]
}

export type InlineNode =
  | TextNode
  | ShowSpanNode
  | HideSpanNode
  | AltSpanNode
  | DecaySpanNode
  | IfSpanNode
  | WordSpanNode
  | TempoSpanNode

export interface SpeakerNode {
  kind: 'speaker'
  pos: Position
  name: string
}

export interface BlockIdNode {
  kind: 'id'
  pos: Position
  value: string
}

export interface ParagraphNode {
  kind: 'paragraph'
  pos: Position
  speaker: SpeakerNode | null
  children: InlineNode[]
  id: BlockIdNode | null
}

export type ContainerKind = 'core' | 'optional' | 'interrogation' | 'lock' | 'recap' | 'portrait' | 'print'

export interface ContainerNode {
  kind: ContainerKind
  pos: Position
  params: RawText | null
  children: BlockNode[]
}

export type BlockNode = ParagraphNode | ContainerNode

export interface SceneNode {
  kind: 'scene'
  pos: Position
  params: RawText
  children: BlockNode[]
}

export interface FileNode {
  kind: 'file'
  pos: Position
  children: (SceneNode | BlockNode)[]
}

export type AstNode = FileNode | SceneNode | BlockNode | SpeakerNode | BlockIdNode | InlineNode
