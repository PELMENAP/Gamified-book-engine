import { probeAudio } from './probes/audio.ts'
import { probeChapter } from './probes/chapter.ts'
import { probeCompression } from './probes/compression.ts'
import { probeCrypto } from './probes/crypto.ts'
import { probeEnvironment } from './probes/env.ts'
import { probeScroll } from './probes/scroll.ts'
import { probeStorage } from './probes/storage.ts'
import { guarded, type ProbeResult } from './result.ts'

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (found === null) throw new Error(`missing ${selector}`)
  return found
}

const runButton = element<HTMLButtonElement>('#run')
const copyButton = element<HTMLButtonElement>('#copy')
const rows = element<HTMLTableSectionElement>('#results tbody')
const chapter = element<HTMLElement>('#chapter')
let report: ProbeResult[] = []

function cell(text: string, className?: string): HTMLTableCellElement {
  const td = document.createElement('td')
  td.textContent = text
  if (className !== undefined) td.className = className
  return td
}

function show(result: ProbeResult): void {
  const tr = document.createElement('tr')
  tr.append(cell(result.name), cell(result.ok ? 'ok' : 'fail', result.ok ? 'ok' : 'fail'), cell(result.summary))
  rows.appendChild(tr)
}

async function runAll(): Promise<void> {
  runButton.disabled = true
  copyButton.disabled = true
  rows.replaceChildren()
  report = []
  const steps: [string, () => Promise<ProbeResult>][] = [
    ['environment', probeEnvironment],
    ['audio', probeAudio],
    ['crypto.subtle', probeCrypto],
    ['CompressionStream', probeCompression],
    ['storage', probeStorage],
    ['chapter 30k chars', () => probeChapter(chapter)],
    ['scroll', () => probeScroll(chapter)],
  ]
  for (const [name, run] of steps) {
    const result = await guarded(name, run)
    report.push(result)
    show(result)
  }
  window.scrollTo(0, 0)
  runButton.disabled = false
  copyButton.disabled = false
  document.documentElement.dataset['probe'] = 'done'
}

runButton.addEventListener('click', () => {
  void runAll()
})

copyButton.addEventListener('click', () => {
  const text = JSON.stringify({ at: new Date().toISOString(), results: report }, null, 2)
  void navigator.clipboard.writeText(text).then(
    () => {
      copyButton.textContent = 'Скопировано'
    },
    () => {
      copyButton.textContent = 'Не удалось скопировать'
    },
  )
})
