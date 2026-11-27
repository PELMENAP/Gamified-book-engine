import { round, type ProbeResult } from '../result.ts'

const DB_NAME = 'gbe-probe'
const STORE = 'kv'

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('idb'))
  })
}

function openDb(): Promise<IDBDatabase> {
  const req = indexedDB.open(DB_NAME, 1)
  req.onupgradeneeded = () => req.result.createObjectStore(STORE)
  return request(req)
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('tx'))
    tx.onabort = () => reject(tx.error ?? new Error('abort'))
  })
}

export async function probeStorage(): Promise<ProbeResult> {
  if (typeof indexedDB === 'undefined') return { name: 'storage', ok: false, summary: 'IndexedDB unavailable', detail: {} }
  const db = await openDb()
  const blob = new Uint32Array(16384)
  for (let i = 0; i < blob.length; i++) blob[i] = i
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  let t = performance.now()
  const write = db.transaction(STORE, 'readwrite')
  write.objectStore(STORE).put(blob.buffer, 'log')
  write.objectStore(STORE).put(key, 'ek')
  await done(write)
  const writeMs = performance.now() - t
  t = performance.now()
  const read = db.transaction(STORE, 'readonly')
  const logBack = await request(read.objectStore(STORE).get('log'))
  const keyBack = await request(read.objectStore(STORE).get('ek'))
  const readMs = performance.now() - t
  db.close()
  const keyOk = keyBack instanceof CryptoKey && !keyBack.extractable
  const logOk = logBack instanceof ArrayBuffer && logBack.byteLength === blob.byteLength
  let persisted: boolean | null = null
  let persistGranted: boolean | null = null
  let quotaMb: number | null = null
  if (navigator.storage !== undefined) {
    persisted = await navigator.storage.persisted()
    persistGranted = await navigator.storage.persist()
    const estimate = await navigator.storage.estimate()
    quotaMb = estimate.quota === undefined ? null : Math.round(estimate.quota / 1048576)
  }
  return {
    name: 'storage',
    ok: keyOk && logOk,
    summary: `IDB 64 KB w ${round(writeMs)} ms r ${round(readMs)} ms, CryptoKey in IDB ${keyOk ? 'ok' : 'fail'}, persist=${String(persistGranted)}`,
    detail: { idbWriteMs: round(writeMs), idbReadMs: round(readMs), nonExtractableKeyStored: keyOk, persistedBefore: persisted, persistGranted, quotaMb },
  }
}
