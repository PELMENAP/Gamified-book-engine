export const EXPR_FORMAT = 1

export const OP_TRUE = 1
export const OP_FALSE = 2
export const OP_CARD = 3
export const OP_LAW_EQ = 4
export const OP_TIME_NIGHT = 5
export const OP_SEASON_EQ = 6
export const OP_RUN_EQ = 7
export const OP_SEEN = 8
export const OP_MARKED = 9
export const OP_FACT = 10
export const OP_FACT_EQ = 11
export const OP_COPIED = 12
export const OP_LOCALE_EQ = 13
export const OP_NOT = 14
export const OP_AND = 15
export const OP_OR = 16

export const OP_COUNT = 17

export const OP_OPERANDS: readonly number[] = [0, 0, 0, 1, 2, 0, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0]
export const OP_POPS: readonly number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2]

export const EXPR_MAX_LENGTH = 256
export const EXPR_MAX_STACK = 32

export const SEASON_WINTER = 0
export const SEASON_SPRING = 1
export const SEASON_SUMMER = 2
export const SEASON_AUTUMN = 3

export const SEASON_NAMES: readonly string[] = ['winter', 'spring', 'summer', 'autumn']

export type ExprField =
  | 'card'
  | 'law'
  | 'time.night'
  | 'time.season'
  | 'run.n'
  | 'seen'
  | 'marked'
  | 'fact'
  | 'copied'
  | 'locale'

export const LOCAL_PREDICATE_FIELDS: readonly ExprField[] = ['seen', 'marked', 'fact', 'copied', 'run.n', 'time.season']
export const MATRIX_FIELDS: readonly ExprField[] = ['card', 'law', 'time.night']
