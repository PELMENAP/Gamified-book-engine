export const LOG_FORMAT = 1

export const LOG_FLAG_SEEN = 1
export const LOG_FLAG_HIGHLIGHT = 2
export const LOG_FLAG_COPY = 4
export const LOG_FLAG_NOTE_OPENED = 8
export const LOG_FLAG_RETURN = 16

export const LOG_TICK_MS = 1000
export const LOG_IDLE_FACTOR = 3
export const LOG_MIN_WORDS_FOR_SPEED = 20
export const LOG_SIGNAL_CLAMP = 2
export const LOG_MIN_THEME_SAMPLE = 20
export const COPY_THRESHOLD_CHARS = 1500

export interface ChapterLog {
  dwellMs: Uint32Array
  visits: Uint8Array
  flags: Uint8Array
  decayStage: Uint8Array
}
