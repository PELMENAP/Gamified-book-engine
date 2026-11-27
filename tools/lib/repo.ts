import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

export const SKIP_DIRS: ReadonlySet<string> = new Set(['node_modules', 'dist', '.git', 'coverage', '.vite', 'ios', 'android'])

export function rel(path: string): string {
  return relative(ROOT, path).split(sep).join('/')
}

export function abs(path: string): string {
  return join(ROOT, path)
}

export function readText(path: string): string {
  return readFileSync(abs(path), 'utf8')
}

export function exists(path: string): boolean {
  try {
    statSync(abs(path))
    return true
  } catch {
    return false
  }
}

export function walk(dir: string, accept: (path: string) => boolean): string[] {
  const out: string[] = []
  const start = abs(dir)
  if (!exists(dir)) return out
  const stack = [start]
  while (stack.length > 0) {
    const current = stack.pop()
    if (current === undefined) break
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(full)
      } else if (accept(rel(full))) {
        out.push(rel(full))
      }
    }
  }
  return out.sort()
}

export const CODE_DIRS: readonly string[] = ['packages', 'apps', 'tools']

export function codeFiles(): string[] {
  const out: string[] = []
  for (const dir of CODE_DIRS) out.push(...walk(dir, (p) => /\.(ts|tsx|mts)$/.test(p) && !p.endsWith('.d.ts')))
  return out
}

export function report(name: string, errors: readonly string[]): void {
  if (errors.length === 0) {
    console.log(`${name}: ok`)
    return
  }
  for (const e of errors) console.error(e)
  console.error(`${name}: ${errors.length} error(s)`)
  process.exitCode = 1
}
