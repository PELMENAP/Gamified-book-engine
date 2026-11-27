import type { ProbeResult } from '../result.ts'

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

export async function probeEnvironment(): Promise<ProbeResult> {
  const nav = navigator as NavigatorWithMemory
  return {
    name: 'environment',
    ok: true,
    summary: `${location.protocol} secure=${String(window.isSecureContext)}`,
    detail: {
      protocol: location.protocol,
      secureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
      serviceWorkerApi: 'serviceWorker' in navigator,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemoryGb: nav.deviceMemory ?? null,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    },
  }
}
