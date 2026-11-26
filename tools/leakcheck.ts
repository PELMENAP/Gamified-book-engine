import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { abs, exists, readText, report, walk } from './lib/repo.ts'

const FRAGMENT_MIN = 24
const FRAGMENT_MAX = 64
const FRAGMENTS_PER_FILE = 40
const SOURCES: readonly { dir: string; ext: RegExp }[] = [
  { dir: 'book/notes', ext: /\.(md|txt|yaml)$/ },
  { dir: 'book/demo', ext: /\.bmd$/ },
  { dir: 'book/parts', ext: /\.bmd$/ },
  { dir: 'book/portrait', ext: /\.bmd$/ },
]
const IGNORED_SOURCES = new Set(['README.md'])

function plain(text: string): string {
  return text
    .replace(/\^[0-9a-z]{4}\b/g, ' ')
    .replace(/::[a-z]+(\{[^}]*\})?/g, ' ')
    .replace(/\{[^{}:|]*:/g, '|')
    .replace(/[{}]/g, '|')
    .replace(/@[a-z][\w-]*/g, ' ')
    .replace(/[#*_`>]/g, ' ')
}

export function fragmentsOf(text: string): string[] {
  const out: string[] = []
  for (const piece of plain(text).split(/[|\n.!?…;]+/)) {
    const trimmed = piece.replace(/\s+/g, ' ').trim()
    if (trimmed.length < FRAGMENT_MIN) continue
    out.push(trimmed.slice(0, FRAGMENT_MAX))
    if (out.length >= FRAGMENTS_PER_FILE) break
  }
  return out
}

function contentsOf(file: string): string[] {
  const bytes = readFileSync(abs(file))
  const out = [bytes.toString('utf8')]
  if (file.endsWith('.gz')) {
    try {
      out.push(gunzipSync(bytes).toString('utf8'))
    } catch {
      out.push('')
    }
  }
  return out
}

function main(): void {
  const args = process.argv.slice(2)
  const require = args.includes('--require')
  const targets = args.filter((a) => !a.startsWith('--'))
  const dirs = targets.length > 0 ? targets : ['dist']
  const needles: { source: string; text: string }[] = []
  for (const { dir, ext } of SOURCES) {
    for (const file of walk(dir, (p) => ext.test(p) && !IGNORED_SOURCES.has(basename(p)))) {
      needles.push({ source: file, text: basename(file) })
      for (const text of fragmentsOf(readText(file))) needles.push({ source: file, text })
    }
  }
  const errors: string[] = []
  let scanned = 0
  for (const dir of dirs) {
    if (!exists(dir)) {
      if (require) errors.push(`${dir}: does not exist`)
      else console.log(`leakcheck: ${dir} does not exist, nothing to scan`)
      continue
    }
    for (const file of walk(dir, () => true)) {
      scanned++
      for (const content of contentsOf(file)) {
        for (const needle of needles) {
          if (content.includes(needle.text)) errors.push(`${file}: contains plaintext from ${needle.source}: «${needle.text}»`)
        }
      }
    }
  }
  console.log(`leakcheck: ${needles.length} fragment(s), ${scanned} file(s) scanned`)
  report('leakcheck', errors)
}

if (import.meta.main) main()
