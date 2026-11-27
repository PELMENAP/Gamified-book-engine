import { describe, expect, it } from 'vitest'
import { fragmentsOf } from '../leakcheck.ts'

describe('leakcheck fragments', () => {
  it('drops markup and ids and keeps long phrases', () => {
    const f = fragmentsOf('Люкс оплачивает дождь до вечера над балконом.{+expanded: Соседнее небо выглажено, без единой складки.} ^a7f3')
    expect(f).toContain('Люкс оплачивает дождь до вечера над балконом')
    expect(f).toContain('Соседнее небо выглажено, без единой складки')
    expect(f.join(' ')).not.toContain('^a7f3')
  })

  it('ignores short phrases', () => {
    expect(fragmentsOf('Мне хватит.')).toEqual([])
  })
})
