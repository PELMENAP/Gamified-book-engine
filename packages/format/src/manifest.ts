export const MANIFEST_FORMAT = 1

export type PackKind = 'chapter' | 'preview' | 'portrait' | 'lock' | 'glossary' | 'deck'

export interface PackEntry {
  file: string
  kind: PackKind
  size: number
  sha256: string
}

export interface AssetEntry {
  file: string
  size: number
  sha256: string
}

export interface Manifest {
  format: number
  bookId: string
  contentVersion: number
  minRuntime: string
  packs: PackEntry[]
  assets: AssetEntry[]
}

export interface SignedManifest {
  manifest: string
  signature: string
  keyId: string
}
