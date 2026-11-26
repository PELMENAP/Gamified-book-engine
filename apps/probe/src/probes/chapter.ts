import { fillerParagraphs } from '../filler.ts'
import { round, type ProbeResult } from '../result.ts'
import { transform } from './compression.ts'

const CHAPTER_CHARS = 30000

interface SyntheticChapter {
  strings: string[]
  blocks: { id: string; runs: number[] }[]
}

function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

function render(host: HTMLElement, chapter: SyntheticChapter): number {
  const fragment = document.createDocumentFragment()
  for (const block of chapter.blocks) {
    const p = document.createElement('p')
    p.dataset['block'] = block.id
    for (const run of block.runs) p.appendChild(document.createTextNode(chapter.strings[run] ?? ''))
    fragment.appendChild(p)
  }
  host.replaceChildren(fragment)
  return chapter.blocks.length
}

export async function probeChapter(host: HTMLElement): Promise<ProbeResult> {
  const paragraphs = fillerParagraphs(CHAPTER_CHARS, 11)
  const chapter: SyntheticChapter = {
    strings: paragraphs,
    blocks: paragraphs.map((_, i) => ({ id: i.toString(36).padStart(4, '0'), runs: [i] })),
  }
  const plain = new TextEncoder().encode(JSON.stringify(chapter))
  const packed = await transform(plain, new CompressionStream('deflate-raw'))
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, packed)
  host.replaceChildren()
  await nextFrame()
  const t0 = performance.now()
  const opened = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, sealed))
  const t1 = performance.now()
  const inflated = await transform(opened, new DecompressionStream('deflate-raw'))
  const t2 = performance.now()
  const parsed = JSON.parse(new TextDecoder().decode(inflated)) as SyntheticChapter
  const t3 = performance.now()
  const count = render(host, parsed)
  const t4 = performance.now()
  const height = host.offsetHeight
  const t5 = performance.now()
  await nextFrame()
  const t6 = performance.now()
  const toTextMs = t4 - t0
  return {
    name: 'chapter 30k chars',
    ok: toTextMs <= 100,
    summary: `decrypt+inflate+parse+DOM ${round(toTextMs)} ms (budget 100), layout ${round(t5 - t4)} ms`,
    detail: {
      chars: paragraphs.reduce((n, p) => n + p.length, 0),
      blocks: count,
      packedBytes: sealed.byteLength,
      decryptMs: round(t1 - t0),
      inflateMs: round(t2 - t1),
      parseMs: round(t3 - t2),
      domMs: round(t4 - t3),
      totalMs: round(toTextMs),
      layoutMs: round(t5 - t4),
      firstFrameMs: round(t6 - t0),
      heightPx: height,
    },
  }
}
