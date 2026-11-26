export interface Comment {
  line: number
  text: string
}

export interface Lexed {
  code: string
  withStrings: string
  comments: Comment[]
  strings: { line: number; value: string }[]
}

const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^'])
const REGEX_KEYWORDS = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await'])

function blank(text: string): string {
  let out = ''
  for (const ch of text) out += ch === '\n' ? '\n' : ' '
  return out
}

function lastSignificant(code: string): string {
  let i = code.length - 1
  while (i >= 0 && /\s/.test(code.charAt(i))) i--
  if (i < 0) return '('
  const ch = code.charAt(i)
  if (/[A-Za-z_$]/.test(ch)) {
    let j = i
    while (j >= 0 && /[A-Za-z0-9_$]/.test(code.charAt(j))) j--
    const word = code.slice(j + 1, i + 1)
    return REGEX_KEYWORDS.has(word) ? '(' : 'a'
  }
  return ch
}

export function lex(source: string): Lexed {
  const comments: Comment[] = []
  const strings: { line: number; value: string }[] = []
  let code = ''
  let kept = ''
  let line = 1
  let i = 0
  const n = source.length
  const braceStack: number[] = []
  if (source.startsWith('#!')) {
    const end = source.indexOf('\n')
    i = end < 0 ? n : end
  }
  while (i < n) {
    const c = source.charAt(i)
    const two = source.slice(i, i + 2)
    if (two === '//') {
      let j = source.indexOf('\n', i)
      if (j < 0) j = n
      comments.push({ line, text: source.slice(i, j) })
      code += blank(source.slice(i, j))
      kept += blank(source.slice(i, j))
      i = j
      continue
    }
    if (two === '/*') {
      let j = source.indexOf('*/', i + 2)
      j = j < 0 ? n : j + 2
      const text = source.slice(i, j)
      comments.push({ line, text })
      code += blank(text)
      kept += blank(text)
      for (const ch of text) if (ch === '\n') line++
      i = j
      continue
    }
    if (c === '"' || c === "'") {
      let j = i + 1
      while (j < n && source.charAt(j) !== c && source.charAt(j) !== '\n') j += source.charAt(j) === '\\' ? 2 : 1
      strings.push({ line, value: source.slice(i + 1, j) })
      code += c + blank(source.slice(i + 1, j)) + c
      kept += source.slice(i, j + 1)
      i = j + 1
      continue
    }
    if (c === '`' || (c === '}' && braceStack.length > 0 && braceStack[braceStack.length - 1] === 0)) {
      if (c === '}') braceStack.pop()
      let j = i + 1
      let value = ''
      let closedByInterpolation = false
      while (j < n) {
        const d = source.charAt(j)
        if (d === '\\') {
          value += source.slice(j, j + 2)
          j += 2
          continue
        }
        if (d === '`') break
        if (d === '$' && source.charAt(j + 1) === '{') {
          closedByInterpolation = true
          break
        }
        value += d
        j++
      }
      strings.push({ line, value })
      code += '`' + blank(value) + '`'
      kept += '`' + value + '`'
      for (const ch of value) if (ch === '\n') line++
      if (closedByInterpolation) {
        braceStack.push(0)
        i = j + 2
      } else {
        i = j + 1
      }
      continue
    }
    if (c === '/' && REGEX_PRECEDERS.has(lastSignificant(code))) {
      let j = i + 1
      let inClass = false
      while (j < n && source.charAt(j) !== '\n') {
        const d = source.charAt(j)
        if (d === '\\') {
          j += 2
          continue
        }
        if (d === '[') inClass = true
        else if (d === ']') inClass = false
        else if (d === '/' && !inClass) break
        j++
      }
      code += '/' + blank(source.slice(i + 1, j)) + '/'
      kept += source.slice(i, j + 1)
      i = j + 1
      continue
    }
    if (c === '{') braceStack.push(1)
    else if (c === '}') braceStack.pop()
    if (c === '\n') line++
    code += c
    kept += c
    i++
  }
  return { code, withStrings: kept, comments, strings }
}

export function lineOf(text: string, index: number): number {
  let line = 1
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++
  return line
}
