import { round, type ProbeResult } from '../result.ts'

export async function probeAudio(): Promise<ProbeResult> {
  if (typeof AudioContext === 'undefined') return { name: 'audio', ok: false, summary: 'AudioContext unavailable', detail: {} }
  const t = performance.now()
  const ctx = new AudioContext({ latencyHint: 'playback' })
  if (ctx.state !== 'running') await ctx.resume()
  const startMs = performance.now() - t
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate)
  const channel = buffer.getChannelData(0)
  for (let i = 0; i < channel.length; i++) channel[i] = Math.sin((i / ctx.sampleRate) * 2 * Math.PI * 440) * 0.05
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(gain).connect(ctx.destination)
  source.start()
  await new Promise<void>((resolve) => {
    source.onended = () => resolve()
  })
  const state = ctx.state
  await ctx.close()
  return {
    name: 'audio',
    ok: state === 'running',
    summary: `state=${state} start ${round(startMs)} ms, ${ctx.sampleRate} Hz`,
    detail: { startMs: round(startMs), sampleRate: ctx.sampleRate, baseLatencyMs: round(ctx.baseLatency * 1000), state },
  }
}
