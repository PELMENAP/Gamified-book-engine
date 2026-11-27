export type Detail = Record<string, number | string | boolean | null>

export interface ProbeResult {
  name: string
  ok: boolean
  summary: string
  detail: Detail
}

export function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function errorText(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error)
}

export async function guarded(name: string, run: () => Promise<ProbeResult>): Promise<ProbeResult> {
  try {
    return await run()
  } catch (error) {
    return { name, ok: false, summary: errorText(error), detail: {} }
  }
}
