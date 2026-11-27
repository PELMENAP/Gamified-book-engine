import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { abs, exists, readText, report, walk } from './lib/repo.ts'

interface Budgets {
  shellAndReaderJsGzipBytes: number
  excludeDirs: string[]
}

const budgets = JSON.parse(readText('tools/budgets.json')) as Budgets
const dir = process.argv[2] ?? 'dist/pwa'
const errors: string[] = []

if (!exists(dir)) {
  console.log(`budget: ${dir} does not exist, nothing to measure`)
} else {
  let total = 0
  const rows: string[] = []
  for (const file of walk(dir, (p) => /\.m?js$/.test(p))) {
    const parts = file.slice(dir.length + 1).split('/')
    if (parts.some((p) => budgets.excludeDirs.includes(p))) continue
    const size = gzipSync(readFileSync(abs(file)), { level: 9 }).length
    total += size
    rows.push(`${String(size).padStart(8)}  ${file}`)
  }
  for (const r of rows) console.log(r)
  console.log(`budget: ${total} B gzip of ${budgets.shellAndReaderJsGzipBytes} B`)
  if (total > budgets.shellAndReaderJsGzipBytes) errors.push(`${dir}: JS is ${total} B gzip, over the budget in tools/budgets.json`)
}

report('budget', errors)
