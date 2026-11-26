# Book data
Root: `book/`. Owner: the author. Format reference: `docs/SPEC.md` section 5. Layout: `book/README.md`.

## Files present

| Path | Holds |
|---|---|
| `book/book.yaml` | Book id, title, locales, parts, content version (`BookMeta`) |
| `book/deck.yaml` | The 16 cards and availability per part (`DeckSource`) |
| `book/laws.yaml` | Ontology flags (`LawSource`) |
| `book/notes/README.md` | Why `book/notes/` is excluded and where the concept file goes |

## Invariants

- `book/notes/` never reaches a build; `tools/leakcheck.ts` searches `dist/` for its fragments.
- Everything written for the demo is a placeholder, not canon; the author replaces it.
- Block ids are assigned by `book ids`, never by hand; deleted ids go to `tombstones.yaml` in `book/`.
