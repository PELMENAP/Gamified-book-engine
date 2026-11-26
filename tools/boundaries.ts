import { dirname, join, normalize } from 'node:path'
import { codeFiles, readText, rel, report, ROOT } from './lib/repo.ts'
import { lex, lineOf } from './lib/lex.ts'

interface PackageRule {
  imports: string[]
  forbid: string[]
}

interface Rules {
  globalGroups: Record<string, string[]>
  packages: Record<string, PackageRule>
  testImports: string[]
}

const rules = JSON.parse(readText('tools/boundaries.json')) as Rules
const IMPORT_RX = /(?<![\w$.])(?:import|export)\s+(?:type\s+)?(?:[\w$*{}\s,]+\s+from\s+)?['"]([^'"]*)['"]|(?<![\w$.])import\s*\(\s*['"]([^'"]*)['"]\s*\)/dg

function ownerOf(path: string): string | null {
  let best: string | null = null
  for (const root of Object.keys(rules.packages)) {
    if ((path === root || path.startsWith(root + '/')) && (best === null || root.length > best.length)) best = root
  }
  return best
}

function matches(pattern: string, specifier: string): boolean {
  if (pattern.endsWith('*')) return specifier.startsWith(pattern.slice(0, -1))
  return specifier === pattern
}

function isTest(path: string): boolean {
  return /\/test\//.test(path) || /\.test\.tsx?$/.test(path)
}

const errors: string[] = []
const globalPatterns = new Map<string, RegExp>()
for (const [group, names] of Object.entries(rules.globalGroups)) {
  globalPatterns.set(group, new RegExp(`(?<![\\w$.])(?:${names.join('|')})(?![\\w$])`, 'g'))
}

for (const file of codeFiles()) {
  const owner = ownerOf(file)
  if (owner === null) {
    errors.push(`${file}: no boundary rule covers this file; add its package to tools/boundaries.json`)
    continue
  }
  const rule = rules.packages[owner]
  if (rule === undefined) continue
  const source = readText(file)
  const lexed = lex(source)
  const allowed = isTest(file) ? [...rule.imports, ...rules.testImports] : rule.imports
  for (const m of lexed.code.matchAll(IMPORT_RX)) {
    const span = m.indices?.[1] ?? m.indices?.[2]
    if (span === undefined) continue
    const specifier = lexed.withStrings.slice(span[0], span[1])
    const line = lineOf(lexed.code, m.index)
    if (specifier.startsWith('.')) {
      const target = rel(normalize(join(ROOT, dirname(file), specifier)))
      if (ownerOf(target) !== owner) errors.push(`${file}:${line}: relative import "${specifier}" leaves ${owner}; import the package instead`)
      continue
    }
    if (!allowed.some((p) => matches(p, specifier))) {
      errors.push(`${file}:${line}: ${owner} may not import "${specifier}" (tools/boundaries.json)`)
    }
  }
  if (isTest(file)) continue
  for (const group of rule.forbid) {
    const rx = globalPatterns.get(group)
    if (rx === undefined) {
      errors.push(`tools/boundaries.json: unknown group "${group}"`)
      continue
    }
    for (const m of lexed.code.matchAll(rx)) {
      errors.push(`${file}:${lineOf(lexed.code, m.index)}: ${owner} may not use ${group} global "${m[0]}"`)
    }
  }
}

report('boundaries', errors)
