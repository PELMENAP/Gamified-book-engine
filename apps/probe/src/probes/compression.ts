import { fillerParagraphs } from '../filler.ts'
import { round, type ProbeResult } from '../result.ts'

export async function transform(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream): Promise<Uint8Array<ArrayBuffer>> {
  const piped = new Blob([bytes]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(piped).arrayBuffer())
}

export async function probeCompression(): Promise<ProbeResult> {
  if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined') {
    return { name: 'CompressionStream', ok: false, summary: 'unavailable, fallback needed behind CryptoPort', detail: {} }
  }
  const text = fillerParagraphs(30000, 7).join('\n')
  const raw = new TextEncoder().encode(text)
  let t = performance.now()
  const packed = await transform(raw, new CompressionStream('deflate-raw'))
  const compressMs = performance.now() - t
  t = performance.now()
  const unpacked = await transform(packed, new DecompressionStream('deflate-raw'))
  const decompressMs = performance.now() - t
  const same = new TextDecoder().decode(unpacked) === text
  return {
    name: 'CompressionStream',
    ok: same,
    summary: `deflate-raw ${raw.length} → ${packed.length} B, inflate ${round(decompressMs)} ms`,
    detail: { rawBytes: raw.length, packedBytes: packed.length, compressMs: round(compressMs), decompressMs: round(decompressMs), roundTrip: same },
  }
}
