import { round, type ProbeResult } from '../result.ts'

const SCROLL_FRAMES = 240

let frames = 0
let last = 0
let worst = 0
let total = 0
let step = 0
let finish: (() => void) | null = null

function onFrame(now: number): void {
  if (last !== 0) {
    const delta = now - last
    if (delta > worst) worst = delta
    total += delta
  }
  last = now
  window.scrollBy(0, step)
  frames++
  if (frames < SCROLL_FRAMES) {
    requestAnimationFrame(onFrame)
  } else if (finish !== null) {
    finish()
  }
}

export async function probeScroll(host: HTMLElement): Promise<ProbeResult> {
  const blocks = host.children.length
  if (blocks === 0) return { name: 'scroll', ok: false, summary: 'no chapter rendered', detail: {} }
  let seen = 0
  let longest = 0
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) seen++
  })
  for (const child of Array.from(host.children)) observer.observe(child)
  let longTask: PerformanceObserver | null = null
  if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
    longTask = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (entry.duration > longest) longest = entry.duration
    })
    longTask.observe({ type: 'longtask' })
  }
  window.scrollTo(0, 0)
  frames = 0
  last = 0
  worst = 0
  total = 0
  step = Math.max(1, Math.floor((document.documentElement.scrollHeight - window.innerHeight) / SCROLL_FRAMES))
  await new Promise<void>((resolve) => {
    finish = resolve
    requestAnimationFrame(onFrame)
  })
  finish = null
  observer.disconnect()
  longTask?.disconnect()
  const average = total / Math.max(1, frames - 1)
  return {
    name: 'scroll',
    ok: worst <= 50,
    summary: `worst frame ${round(worst)} ms, avg ${round(average)} ms, longest task ${round(longest)} ms`,
    detail: { frames, worstFrameMs: round(worst), averageFrameMs: round(average), longestTaskMs: round(longest), blocksIntersected: seen },
  }
}
