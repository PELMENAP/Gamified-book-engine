# Book data

Plain text, owned by the author. The engine reads everything book-specific from here. Format: `docs/SPEC.md` section 5.

| Path | Holds |
|---|---|
| `book/book.yaml` | Metadata, locales, parts, content version |
| `book/deck.yaml` | Cards: group, availability, exclusions, titles, previews |
| `book/laws.yaml` | Ontology flags and their values |
| `book/notes/` | Concept files. Excluded from every build |

Directories that the compiler reads as they appear: `demo/`, `parts/<NN>/`, `characters/`, `glossary/`, `portrait/`,
`editions/`, `locales/`, `assets/`, plus `themes.yaml` and `tombstones.yaml`.
