import { round, type ProbeResult } from '../result.ts'

const PAYLOAD_BYTES = 30000
const PBKDF2_SAMPLE_ITERATIONS = 100000
const LOCK_TARGET_MS = 500

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(length)
  for (let i = 0; i < length; i += 65536) crypto.getRandomValues(out.subarray(i, Math.min(length, i + 65536)))
  return out
}

export async function probeCrypto(): Promise<ProbeResult> {
  if (typeof crypto === 'undefined' || crypto.subtle === undefined) {
    return { name: 'crypto.subtle', ok: false, summary: 'unavailable', detail: {} }
  }
  const subtle = crypto.subtle
  const master = await subtle.importKey('raw', randomBytes(32), 'HKDF', false, ['deriveKey'])
  let t = performance.now()
  const cek = await subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new TextEncoder().encode('book'), info: new TextEncoder().encode('ch01|1') },
    master,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
  const hkdfMs = performance.now() - t
  const payload = randomBytes(PAYLOAD_BYTES)
  const iv = randomBytes(12)
  const aad = randomBytes(38)
  const sealed = await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, cek, payload)
  t = performance.now()
  const opened = new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad }, cek, sealed))
  const decryptMs = performance.now() - t
  let tamperRejected = false
  const tampered = new Uint8Array(sealed.slice(0))
  tampered[0] = (tampered[0] ?? 0) ^ 1
  try {
    await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad }, cek, tampered)
  } catch {
    tamperRejected = true
  }
  const password = await subtle.importKey('raw', new TextEncoder().encode('сирень'), 'PBKDF2', false, ['deriveBits'])
  t = performance.now()
  await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: randomBytes(16), iterations: PBKDF2_SAMPLE_ITERATIONS }, password, 256)
  const pbkdf2Ms = performance.now() - t
  const lockIterations = Math.floor((PBKDF2_SAMPLE_ITERATIONS * LOCK_TARGET_MS) / Math.max(pbkdf2Ms, 1))
  const pair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify'])
  const manifest = randomBytes(4096)
  const signature = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, manifest)
  t = performance.now()
  const verified = await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pair.publicKey, signature, manifest)
  const verifyMs = performance.now() - t
  const roundTrip = opened.length === payload.length && opened.every((b, i) => b === payload[i])
  return {
    name: 'crypto.subtle',
    ok: roundTrip && tamperRejected && verified,
    summary: `AES-GCM 30 KB ${round(decryptMs)} ms, PBKDF2 → ${lockIterations} it/500 ms`,
    detail: {
      hkdfMs: round(hkdfMs),
      aesGcmDecrypt30kMs: round(decryptMs),
      tamperRejected,
      pbkdf2Per100kMs: round(pbkdf2Ms),
      lockIterationsFor500ms: lockIterations,
      ecdsaVerifyMs: round(verifyMs),
      ecdsaVerified: verified,
    },
  }
}
