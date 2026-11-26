const WORDS = [
  'дом', 'окно', 'улица', 'вечер', 'город', 'свет', 'дверь', 'лестница', 'балкон', 'ветер', 'стена', 'крыша',
  'тень', 'шаг', 'голос', 'утро', 'стекло', 'двор', 'фонарь', 'остановка', 'площадь', 'мост', 'река', 'берег',
  'идёт', 'смотрит', 'стоит', 'молчит', 'держит', 'ждёт', 'слушает', 'видит', 'тихо', 'медленно', 'снова', 'потом',
  'серый', 'тёплый', 'длинный', 'пустой', 'новый', 'старый', 'ровный', 'дальний', 'и', 'в', 'на', 'под', 'за', 'у',
]

export function fillerParagraphs(totalChars: number, seed: number): string[] {
  const out: string[] = []
  let state = seed >>> 0
  let used = 0
  while (used < totalChars) {
    let paragraph = ''
    const sentences = 3 + (state % 4)
    for (let s = 0; s < sentences; s++) {
      const length = 6 + (state % 9)
      let sentence = ''
      for (let w = 0; w < length; w++) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0
        const word = WORDS[state % WORDS.length] ?? 'дом'
        sentence += w === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ' ' + word
      }
      paragraph += (s === 0 ? '' : ' ') + sentence + '.'
    }
    out.push(paragraph)
    used += paragraph.length
  }
  return out
}
