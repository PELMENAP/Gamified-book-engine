const PUNCTUATION = /[\p{P}\p{S}]+/gu
const SPACES = /\s+/gu

export function normalizeAnswer(answer: string): string {
  return answer
    .normalize('NFKC')
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replace(PUNCTUATION, ' ')
    .replace(SPACES, ' ')
    .trim()
}
