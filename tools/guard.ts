import { codeFiles, readText, report, walk } from './lib/repo.ts'
import { lex, lineOf } from './lib/lex.ts'

interface Rule {
  id: string
  pattern: string
  message: string
}

interface GuardRules {
  code: Rule[]
  copyHandler: { listener: string; forbidden: string; message: string }
  css: Rule[]
  html: Rule[]
}

const rules = JSON.parse(readText('tools/guard.json')) as GuardRules
const errors: string[] = []

function applyRules(file: string, text: string, list: readonly Rule[]): void {
  for (const rule of list) {
    for (const m of text.matchAll(new RegExp(rule.pattern, 'g'))) {
      errors.push(`${file}:${lineOf(text, m.index)}: [${rule.id}] ${rule.message}`)
    }
  }
}

const SELF = new Set(['tools/guard.ts'])

for (const file of codeFiles()) {
  const lexed = lex(readText(file))
  for (const c of lexed.comments) {
    errors.push(`${file}:${c.line}: [comment] no comments in code; explanations belong in docs/ (${c.text.slice(0, 40).trim()})`)
  }
  if (SELF.has(file)) continue
  applyRules(file, lexed.code, rules.code)
  if (new RegExp(rules.copyHandler.listener).test(lexed.withStrings)) {
    for (const m of lexed.code.matchAll(new RegExp(rules.copyHandler.forbidden, 'g'))) {
      errors.push(`${file}:${lineOf(lexed.code, m.index)}: [copy-handler] ${rules.copyHandler.message}`)
    }
  }
}

for (const file of [...walk('packages', (p) => p.endsWith('.css')), ...walk('apps', (p) => p.endsWith('.css'))]) {
  applyRules(file, readText(file), rules.css)
}

for (const file of [...walk('packages', (p) => p.endsWith('.html')), ...walk('apps', (p) => p.endsWith('.html'))]) {
  applyRules(file, readText(file), rules.html)
}

report('guard', errors)
