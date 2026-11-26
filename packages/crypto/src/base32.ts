export const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567'

export function base32Encode(bytes: Uint8Array): string {
  let out = ''
  let buffer = 0
  let bits = 0
  for (let i = 0; i < bytes.length; i++) {
    buffer = (buffer << 8) | (bytes[i] ?? 0)
    bits += 8
    while (bits >= 5) {
      bits -= 5
      out += BASE32_ALPHABET.charAt((buffer >>> bits) & 31)
    }
    buffer &= (1 << bits) - 1
  }
  if (bits > 0) out += BASE32_ALPHABET.charAt((buffer << (5 - bits)) & 31)
  return out
}

export function base32Decode(text: string): Uint8Array | null {
  const out = new Uint8Array(Math.floor((text.length * 5) / 8))
  let buffer = 0
  let bits = 0
  let index = 0
  for (let i = 0; i < text.length; i++) {
    const value = BASE32_ALPHABET.indexOf(text.charAt(i))
    if (value < 0) return null
    buffer = (buffer << 5) | value
    bits += 5
    if (bits >= 8) {
      bits -= 8
      out[index++] = (buffer >>> bits) & 255
      buffer &= (1 << bits) - 1
    }
  }
  if (buffer !== 0) return null
  return out
}
