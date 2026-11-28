# Compiler: `.bmd` parser
Root: `packages/compiler/src`. Package: `@gbe/compiler`. Tests: `packages/compiler/test/`. Grammar: `docs/SPEC.md` section 5.

## Entry points

| File | Defines |
|---|---|
| `packages/compiler/src/lexer.ts` | `lex(source, file)`: source to `Token[]`; token texts concatenate back to the source byte for byte |
| `packages/compiler/src/parser.ts` | `parseBmd` (one file), `parseChapter` (files of one chapter, shared id registry); block structure, directives, ids |
| `packages/compiler/src/inline.ts` | `InlineParser`: spans, first-colon rule, `alt` and `decay` trimming, glossary references |
| `packages/compiler/src/ast.ts` | `FileNode`, `SceneNode`, `ContainerNode`, `ParagraphNode`, `InlineNode` union, `Position`, `RawText` |
| `packages/compiler/src/errors.ts` | `ParseError`, `ParseErrorCode`, `formatParseError` (`file:line:col: [code] message`) |
| `packages/compiler/src/index.ts` | The only public surface of the package |
| `packages/compiler/test/golden/` | `*.bmd` inputs and `*.ast.json` dumps; `GOLDEN_UPDATE=1` rewrites the dumps |
| `packages/compiler/test/parse.test.ts` | Golden comparison |
| `packages/compiler/test/lexer.test.ts` | Round trip, position oracle, fuzz |
| `packages/compiler/test/errors.test.ts` | One case per `ParseErrorCode` with exact line and column |
| `packages/compiler/test/golden-json.ts` | Stable JSON with sorted keys |

## Data flow

1. `lex` splits the source into line-aware tokens and tracks the open-span stack so `|` is a token only inside `alt` and `decay`.
2. `parseBmd` groups tokens into lines; a blank line, a directive or an `@` line ends a paragraph.
3. Directives build `SceneNode` (open until the next `::scene`) and `ContainerNode` (open until `::end`).
4. Each paragraph loses its `@speaker` and `^id` tokens, then `InlineParser` builds the `InlineNode` tree.
5. The AST goes to merging (1.5); `expr` and `params` stay raw `RawText` until 1.4 and 1.5.

## Invariants

- Every node and token carries `Position` with 1-based `line` and `col` in UTF-16 units; a BOM takes no column.
- The first colon ends the span header; everything after it is literal, including a leading space or punctuation.
- Only `alt` and `decay` trim: each variant loses spaces and tabs at both ends; a `|` inside another span kind is text.
- Whitespace between `@name` and the line, and between the text and `^id`, is a separator and not part of any text node.
- `::interrogation`, `::lock`, `::recap`, `::portrait`, `::print` are checked syntactically only; their logic is not here.
- `::scene` needs parameters; `::core`, `::optional`, `::end` take none; `::recap`, `::portrait`, `::print` may have them.
- `BLOCK_ID_PATTERN` from `@gbe/format` decides whether an id is well formed; a duplicate is reported at its second use.
- The lexer never throws; the parser collects every error, sorted by position, and still returns a tree.

## Hot paths
None.
