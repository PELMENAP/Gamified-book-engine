# Prompt: gamified book engine (PWA + Capacitor)

Nov 5, 2026 · @Alaypetro 115

## 1. Role and task

You are the lead product engineer. Build the engine for a book sold as an app and as a print edition, both from one source. It is not a visual novel or an RPG: the core experience stays reading.

**Deliverables:**

- a monorepo with the book compiler and the runtime;
- a PWA and Capacitor builds for iOS and Android;
- EPUB export and print source output;
- a demo chapter that exercises every mechanic in this prompt;
- format documentation for the author and a decision log in `docs/decisions.md`.

**Inputs.** There is no novel text yet, only the universe concept «Линия жизни» in the attached file `Примерный концепт архитектуры сюжета.md`. Write the demo chapter from it as described below. The engine must not contain names, cards or rules of a specific book: all of that comes from data.

**Working rules:**

- Read the whole prompt and fix the data schemas first. Write runtime code after that.
- Do not ask questions when a decision is reversible or follows from this prompt. Decide and record it in the decision log.
- Stop only before an irreversible step: a purchase, a publication, the creation of production keys.
- Check dependency versions and store rules before each stage. The facts in this prompt are current as of the date in the header.
- If reality differs from this prompt, keep the goal, change the method and record the reason in the decision log.

**Language rules:**

| Language | Applies to |
| --- | --- |
| English | Code, identifiers, commit messages, engineering documentation, decision log |
| Russian | Book text, markup examples, lock answers, demo chapter grammar and style rules, stage reports and final output |

### Demo chapter

The demo chapter is based on the arc «Сумерки хрустального города» and uses every mechanic. Its working title comes from the chapter pool: «Покрась свои оковы». Target size is 2,500–4,000 words in three scenes, stored in `book/demo/`.

Store the concept file in `book/notes/`. It is excluded from all builds because it contains character deaths and the ending, and the leak test verifies that it is absent from `dist`.

**Грамматика и стиль демо-главы:**

- Пиши по авторскому коду: идея не разжёвывается, а складывается из улик, космология сталкивается с дворовым просторечием.
- В тексте нет событий после первой арки: Второго солнца, «Солнцеворота», Сверхновой, смертей героев.
- Всё придуманное для демо считается заглушкой, а не каноном. Автор заменит этот текст.
- Пол Люкса и Ипсам в концепте не указан, поэтому пиши их сцены в настоящем времени и без родовых форм.
- У Серафима нет отдельного профиля в концепте. В демо он только ведёт допрос, его биографию не придумывай.
- Прямая речь начинается с длинного тире, кавычки только «ёлочки». Обращения к читателю строй без родовых форм, а числа из статистики ставь там, где не нужно согласование.
- Инлайн-вставка автономна: она сама содержит свой начальный пробел и свою пунктуацию.
- Если вставку убрать, оставшееся предложение должно быть грамматически полным. Запятые, относящиеся к вставке, лежат внутри неё.
- Слова глоссария склоняются через формы: `{w хиус.gen}` даёт «хиуса», а в подсказке «морозного ветра».

**Как материал ложится на механики:**

| Механика | Материал в демо |
| --- | --- |
| Сеттинг | Город N: платная идеальная погода, личное дождевое облако, соседи с одинаковым именем «Я», изоляция по интересам и эпохам |
| Мутация | Стерильный город теряет счёт дням: день недели в одной фразе постепенно стирается при повторном открытии главы |
| Допрос и закон `mind` | Серафим спрашивает: разум — ошибка эволюции или её цель? События те же, но `error` показывает город как атрофию, а `goal` как этап, требующий новой цены |
| Глоссарий | Авторский лексикон. Для демо возьми «хиус» и «ожеледь», их значения автор уточнит. Значения слов «сияж», «маневать» и «кисулица» не выдумывай |
| `thoughts` | Бытовая речь Люкса расходится с тем, что Люкс замечает на самом деле |
| `documents` | Квитанция за облако и короткая записка Дяди Муха с ироничным скепсисом |
| `edits` | Рассказчик правит прошлое, как правят историю: зачёркнутое выдаёт прежнюю версию |
| `facts` | Заметки о законах и гомологиях, без раскрытия Истинного Потока |
| `threads` | Мотивы-листья без ствола: облако, зеркало, куст сирени |
| `voices` и темп | Контраст регистров и один короткий спан `word` с рваным синтаксисом Дымка |
| Время | `time.night` включает ночной тариф на погоду и больше ничего не меняет |
| Замок знанием | Ответ «сирень»: читатель собирает его из разбросанных упоминаний |
| Портрет | Временный голос аналитика: «всевидящее зеркало» из узла «Круговорот людей» |
| Реакция на копирование | Реплика о людях, которые промотали ожидание и вместе с ним жизнь. Этот мотив должен прозвучать в тексте раньше реплики |
| Печатная версия | Канон `mind: goal`, допрос заменён блоком `::print` |

## 2. Project scope

The project includes only ideas whose benefits outweigh their risks. Do not implement rejected ideas or add extension points for them.

**In scope:**

| Idea | Implementation |
| --- | --- |
| Pick 4 of 16 cards | Chosen before each part, with the previous set preselected |
| Pacing control | The author sets the pace and the reader can turn it off at any time |
| Text mutations | Stages are written by the author and advance predictably |
| Time of day and date | Change only shades of text, the plot never depends on them |
| Dictionary | Free for everyone, rare and authorial words gradually enter the text |
| Story interrogations | At most four per book, no scoring |
| Personal ontology | One or two flags that change the causes of events, not the events |
| Knowledge lock | Hidden text opens with a fact understood from the book |
| Telemetry and portrait | On-device only, the portrait relies on verifiable facts |
| Friends' traces | Exchanged by code or link, no server |
| Reaction to copying | Copying always works, the book may mention it later |
| Highlights as canon | Reader highlights surface at pre-written points |
| Lying recap | The narrator distorts the recap depending on what was seen |
| Version comparison | After the finale: share of text unlocked and a friend's version of a scene by code |
| Second playthrough | A new run remembers the previous one and allows another world law |
| Single source | App, EPUB and print are built from the same files |

**Out of scope:**

| Idea | Reason |
| --- | --- |
| Exam after every chapter | Tiring, and pushes readers towards one optimal card set |
| Clipboard blocking or text substitution | Protects nothing, but hurts quotes, translation and accessibility tools |
| Geolocation, weather, microphone | Permission prompts deter readers and the payoff is small |
| Random text corruption | Looks like a bug and takes control away from the author |
| Constant word-by-word display | Tiring, so it is allowed only in short authored peaks |
| Content available only at certain times | Punishes readers for their schedule |
| Global trace network | Requires a server and moderation, and makes the book depend on infrastructure |
| External analytics | Conflicts with the promise that reading data stays on the device |
| Accessibility settings as cards | Font, contrast and sound off are always available to everyone |
| Text rendering in canvas, font obfuscation | Break accessibility, selection and performance |

## 3. Principles and budgets

Priority order: performance, then correctness, then extensibility.

**Engineering rules:**

- TypeScript in `strict` mode, no `any` in public types.
- No code comments and no JSDoc. Names and types must explain themselves, and explanations belong in `docs/`.
- Binary formats are the same: describe them with named layout constants, byte tables in `docs/formats/` and golden test vectors, not with comments.
- Text selection depends entirely on reader state. The resolver has no random numbers and no clock access: time arrives as a ready state field.
- Text is rendered only through DOM text nodes. `innerHTML`, `eval` and `new Function` are forbidden, and a strict CSP enforces this.
- No required server. The book must work on static hosting, and offline after activation.
- Every data format change comes with a version number and a migration.

**Allocation rules:**

- Per-frame paths must not allocate in our code: scroll and `requestAnimationFrame` handlers, tempo transitions, per-frame audio envelope updates. They use no closures, no array or object creation, no `map`, `filter`, `slice` or spread.
- Code that runs less than once per frame may use closures and small objects: the 1 Hz telemetry tick, `IntersectionObserver` callbacks, click handlers. The browser allocates observer entries anyway, so do not contort this code with global mutable indices.
- Block state and the reading log always live in `Uint8Array` and `Uint32Array`, indexed by the block number in the chapter. This saves memory and speeds up saving.

**DOM and layout:**

- Use `IntersectionObserver` for block visibility, with no layout reads during scrolling.
- Do not use `content-visibility: auto` on chapters. Estimated heights cause scroll jumps when restoring a position by block ID, especially after cards change the text above.
- Render a normal chapter as plain DOM and measure it on the target Android in stage 0.
- Enable scene virtualization only above `virtualizeAboveBlocks`, default 350, or if measurements miss the budget. It stays off in screen reader mode.
- Restore the reading position after the chapter is rendered and fonts are loaded.
- Separate layout reads and writes across frames.

**Target budgets on a mid-range Android device:**

| Metric | Limit |
| --- | --- |
| Cold start to first text | 2 s |
| Opening a 30,000-character chapter: decrypt, decompress, resolve, render | 100 ms |
| Input to next paragraph | 50 ms |
| Longest main-thread task while scrolling | 50 ms |
| Shell and reader JS, gzip, without content | 120 KB |
| Telemetry tick at 1 Hz | 1 ms |

Check budgets in CI where possible, and manually on a real device before each stage.

## 4. Architecture

The core knows nothing about the platform or the specific book. Everything platform-specific sits behind ports, and everything book-specific comes from data.

**Stack:**

- TypeScript, pnpm workspaces, Vite.
- Reading surface on plain DOM, shell (menus, cards, settings) on Preact with signals.
- Service Worker through Workbox in the web channel only.
- Capacitor 8.x for iOS and Android.
- Vitest, fast-check, Playwright, axe.

**Repository layout:**

```text
packages/
  format/          types and schemas: source, IR, manifest, save, traces
  compiler/        CLI: parse → merge → validate → lint → build → encrypt
  crypto/          packs, key wrapping, knowledge locks
  core/            state, expressions, resolver, cards, mutations, portrait
  reader-dom/      block rendering, pacing, highlights, margins, observers
  audio/           Web Audio: ambience, music, crossfades, pulse
  shell/           Preact shell, card selection, settings, final screen
  platform/        ports and web, ios, android adapters
apps/
  pwa/             web channel
  mobile/          Capacitor project
  studio/          local preview for the author
book/              book data, described in section 5
docs/              formats, decisions, release guide
```

**Dependency boundaries:** `core` does not import DOM, Capacitor or audio. `reader-dom` does not access storage directly. A boundary linter enforces this.

**Platform ports:**

| Port | Purpose | Web | Capacitor |
| --- | --- | --- | --- |
| `StoragePort` | Saves, reading log, settings | IndexedDB, `navigator.storage.persist()` | Files with atomic writes |
| `PackPort` | Fetching and caching encrypted packs | Service Worker, Cache Storage | Packs in the build, extra downloads to files |
| `LicensePort` | Content entitlement and key retrieval | Activation code | Store purchase |
| `KeyPort` | Edition key storage | Non-extractable `CryptoKey` in IndexedDB | Keychain and Keystore |
| `CryptoPort` | Crypto and decompression primitives | WebCrypto, `CompressionStream` | Same, with a fallback if unavailable |
| `SharePort` | Sharing trace codes and quotes | Web Share, clipboard | System share sheet |
| `HapticsPort` | Pulse | `navigator.vibrate` or a visual substitute | Haptics plugin |
| `AudioSessionPort` | Behavior during calls and screen lock | Visibility events | Native audio session |
| `ClockPort` | Local time for `time.*` | `Date` | `Date` |

**iOS constraint.** On iOS, Capacitor uses the `capacitor://` scheme, and Service Workers do not work in WKWebView with a custom scheme. Build mobile offline support on packs in the build and file storage, and do not register a Service Worker in the `mobile` channel.

**Data flow:**

```text
book/*.bmd + overlays + yaml
  → compiler → IR → chapter packs → encryption → dist/<channel>
runtime: LicensePort → KeyPort → PackPort → decrypt → core.resolve(state) → reader-dom
reading events: reader-dom → log → core.state → next resolve
```

**The author studio** shows a chapter with toggles for cards, world laws, mutation stages and time of day, plus the linter report. It is mandatory: without it the author cannot review combinations.

## 5. Source text

The book source lives in plain text files in git, and HTML appears only as render output. The author must be able to read the main text almost free of markup, so large variants live in separate layer files.

**Book structure:**

```text
book/
  book.yaml                metadata, editions, languages
  deck.yaml                cards
  laws.yaml                ontology flags
  themes.yaml              theme tags for the portrait
  characters/*.yaml        font, color, line rhythm, avatar
  glossary/*.yaml          words, forms, meanings, rollout stages
  demo/                    demo chapter
  notes/                   concept files, excluded from builds
  parts/01/part.yaml
  parts/01/ch03/s02.bmd    main scene text
  parts/01/ch03/s02.thoughts.bmd
  parts/01/ch03/s02.law-mind-error.bmd
  portrait/*.bmd           portrait fragments
  editions/print.yaml      print edition contents
  editions/epub.yaml
  locales/en/...           translations by block ID
  assets/                  audio and images
```

**Main scene file `.bmd`:**

```text
::scene{id=ch01.s02 pov=lux mood=calm pace=para ambience=rain-private themes=city,body}

Люкс оплачивает дождь до вечера. Облако висит над балконом и больше ни над кем.{+expanded: Соседнее небо выглажено, без единой складки.} ^a7f3

@lux — Мне хватит.{+thoughts: На самом деле не хватает, но чего, уже не вспомнить.} ^b19c

{decay: Сосед по имени Я съехал в среду. | Сосед по имени Я съехал в четверг. | Сосед по имени Я съехал.} ^c01d

::optional
Длинное описание, которое выпадает при сжатом чтении. ^d44e
::end

С окраины тянет {w хиус}.{if time.night: Ночной тариф на погоду уже начал действовать.} ^e8b2

::core
У Ипсам есть карта того, что лежит за Городом. ^f6a0
::end
```

**Markup rules:**

| Construct | Meaning |
| --- | --- |
| `::scene{...}` | Scene and its parameters: point of view, mood, pace, sound, themes |
| `^a7f3` | Permanent block ID at the end of a paragraph |
| `@lux` | Speaker, links the line to a character profile |
| `{+card: text}` | Text appears when the card is active |
| `{-card: text}` | Text is hidden when the card is active |
| `{alt card: A \| B}` | Choice of one of two variants |
| `{decay: A \| B \| C}` | Mutation stages |
| `{if expression: text}` | Conditional text |
| `{w word}`, `{w word.gen}` | Glossary word in its base form or a named grammatical form |
| `{tempo word: text}` | Short authored peak with word-by-word display |
| `::core ... ::end` | Mandatory plot block |
| `::optional ... ::end` | May drop out in compressed reading |
| `::interrogation{...}` | Interrogation, see section 8 |
| `::lock{...}` | Text behind a knowledge lock, see section 9 |
| `::recap`, `::portrait`, `::print` | Lying recap, portrait, print-only variant |

**Whitespace in inline spans:**

- The first colon ends the span header. Everything after it is literal text, including the leading space and punctuation.
- So `{+expanded: Соседнее небо.}` inserts a space and a sentence, and `{+thoughts:, почти}` inserts a comma with no space before it.
- In `alt` and `decay`, spaces around `|` are trimmed. Any surrounding spacing belongs to the text outside the span.

**Block IDs:**

- The `book ids` command assigns IDs, and the author does not invent them.
- An ID does not change when the text is edited. Saves, traces, mutations and translations depend on it.
- A deleted ID goes to `tombstones.yaml` and is never reused.
- A release build fails if a block has no ID or an ID repeats.

**A layer file** is attached by name and contains operations on the main text:

```text
::layer{when=card.thoughts}

::after ^a7f3
Дождь пахнет квитанцией. ^k21a

::replace ^b19c
@lux — Мне хватит. Почти. ^k21b

::remove ^d44e
```

A short edit is convenient inline, and anything longer than one phrase belongs in a layer. The compiler reduces both forms to one model.

**Expressions** use a restricted language and compile to data, with no code execution. Available fields are `card.*`, `law.*`, `time.night`, `time.season`, `run.n`, `seen.<id>`, `marked.<id>`, `fact.*`, `copied.<chapter>`, `locale`, with the operators `not`, `and`, `or`, `==`.

**Glossary:**

```yaml
word: хиус
meaning: морозный ветер
origin: сибирский говор
forms:
  nom: { word: хиус, gloss: морозный ветер }
  gen: { word: хиуса, gloss: морозного ветра }
stages:
  - { from: ch01, show: "{gloss} ({word})" }
  - { from: ch04, show: "{word} ({gloss})" }
  - { from: ch07, show: "{word}" }
```

Russian words change form with case, so a glossary word without the requested form is a compile error.

**Translations** are stored by block ID together with a hash of the source phrase. If the original changes, the compiler marks the translation as stale.

## 6. Modifications and resolver

Every text change uses one model: an operation on a block with a condition and a layer. Cards, world laws, mutations, time and second playthroughs differ only in condition and priority.

**Intermediate representation types:**

```ts
type BlockId = string
type ExprRef = number
type ModOp = 'before' | 'after' | 'replace' | 'remove'
type Layer = 'law' | 'run' | 'memory' | 'decay' | 'card' | 'time'

interface Run {
  text: number
  when?: ExprRef
  decayStage?: number
  word?: number
  wordForm?: number
  tempo?: 'word'
}

interface Block {
  id: BlockId
  index: number
  kind: 'p' | 'line' | 'heading' | 'recap' | 'portrait' | 'interrogation' | 'lock'
  core: boolean
  optional: boolean
  speaker?: number
  themes: number
  wordCount: number
  runs: Run[]
}

interface Mod {
  layer: Layer
  priority: number
  when: ExprRef
  op: ModOp
  target: BlockId
  blocks?: Block[]
}

interface CompiledChapter {
  format: number
  chapterId: string
  contentVersion: number
  strings: string[]
  exprs: Int16Array[]
  blocks: Block[]
  mods: Mod[]
  cues: Cue[]
}
```

Serialize expressions and strings compactly in the pack file, and convert them to these types on load. Expression opcodes and log bit masks are named constants, documented in `docs/formats/`.

**Layers apply in a fixed order:**

1. Main text.
2. `law`: the truth of the world.
3. `run`: what the book remembers from the previous playthrough.
4. `memory`: highlights, copying, facts from interrogations.
5. `decay`: mutation stages.
6. `card`: text cards.
7. `time`: shades of time of day and season.
8. Glossary substitution.
9. Presentation: root element classes and audio cues.

**Resolve function:**

```ts
resolve(chapter: CompiledChapter, state: ReaderSnapshot, out: ResolvedChapter): void
```

- The function is pure: one state snapshot always produces one text.
- `ReaderSnapshot` is fixed when a chapter opens, so text never changes in front of the reader.
- Mutations and new facts apply the next time the chapter opens.
- Presentation cards do not take part in resolving. They switch classes and audio tracks.

**Invariants:**

- A `core` block cannot be removed. It can be replaced only by a block also marked `core`.
- Two `replace` or `remove` operations on one block in one layer are an error unless a priority is set.
- The `time` layer cannot change `core` blocks and cannot be the only source of a plot fact.
- The reading position is a block ID plus an offset. If the block disappears, the reader lands on the nearest following visible block.

**Whitespace normalization** does only three things: it collapses repeated spaces, trims block edges and drops empty blocks. It never inserts, removes or moves punctuation. Russian punctuation problems are reported by the linter for the author to fix in the source.

**The compiler linter checks in three scopes.**

Global matrix for each chapter:

- It covers `card.*`, `law.*`, the extreme `decay` stages and `time.night`.
- 9 cards from section 7 affect text, which gives 256 sets of at most four cards.
- With two ontology flags, extreme mutation stages and day or night, this reaches 4,096 variants per chapter, which is practical to check automatically.

Local checks for each mod or inline condition:

- The predicates `seen.*`, `marked.*`, `fact.*`, `copied.*`, `run.n` and `time.season` are not multiplied into the global matrix. Ten `marked` checks would otherwise produce about 4 million variants.
- Each predicate is checked as true and false on its target block. `run.n` uses the values 1 and 2.
- Predicates on the same block are enumerated together with that block's card mods, up to 8 predicates. Above that, the linter switches to pairwise coverage and warns the author.

Whole-book data flow:

- A `fact.*` or `seen.*` read must have a preceding source on some reading path, otherwise the linter reports an error.
- If a fact can be unset on some path, the condition must have a sensible fallback.

The linter reports:

- missing `core` blocks in any variant;
- operation conflicts and broken ID references;
- empty scenes and broken dialogue lines;
- a space before punctuation, doubled punctuation, a missing space after a sentence, an empty dialogue dash;
- unresolved glossary words or forms;
- the size added by each card and its distribution across chapters;
- forbidden reproaches on sensitive themes in the portrait.

The report shows the author each card's cost in words, which reveals overloaded and empty cards.

## 7. Deck

Before each part the reader picks 4 cards from those available. Any set gives a complete story, and different sets change how that story is understood. The deck lives entirely in data, so the author can replace any card without touching code.

| ID | Title (Russian UI) | Group | Effect | Available from part |
| --- | --- | --- | --- | --- |
| `thoughts` | Мысли героев | Text | Inner lines, sometimes contradicting what is said | 1 |
| `expanded` | Расширенные описания | Text | Details of places, objects and bodies | 1 |
| `distill` | Сжатый сюжет | Text | Removes `optional` blocks and unlocks an end-of-chapter summary unavailable otherwise | 1 |
| `facts` | Факты и отсылки | Text | Margin notes and links between chapters | 1 |
| `documents` | Чужие документы | Text | Letters and records from other people | 2 |
| `edits` | Правки рассказчика | Text | Struck-through variants where the narrator gives himself away | 3 |
| `faces` | Лица | View | Dialogue avatars that change with mood | 1 |
| `voices` | Голоса | View | Each character's own font and line rhythm | 1 |
| `threads` | Нити | View | Motif highlighting and jumps to earlier appearances | 2 |
| `atlas` | Атлас | View | Scene place, time and participants in the margin | 3 |
| `ambience` | Окружение | Sense | Background sounds of the scene | 1 |
| `score` | Музыка эмоций | Sense | Musical themes following scene mood | 2 |
| `pulse` | Пульс | Sense | Vibration and visual rhythm, works without headphones | 1 |
| `recall` | Цепкая память | Rule | Shows the previous stage of mutated text as a ghost | 3 |
| `decoder` | Дешифратор | Rule | Word origins and revealed hidden inscriptions | 2 |
| `witness` | Второй свидетель | Rule | Interlocutor reactions during interrogations and one extra line | 3 |

**Selection rules:**

- 8 cards are available in part 1, 12 in part 2, all 16 in part 3. This reduces the load at the start and stays a data setting.
- A set is chosen at part boundaries. The previous set is preselected, so one tap continues.
- Every card has a preview: a short example on a neutral paragraph, without spoilers.
- `expanded` and `distill` are mutually exclusive.
- A Sense card can be swapped for another Sense card at any time. A reader must not lose a slot for lacking headphones.
- After the first finale all cards unlock, but the limit of 4 stays.

**Balance:**

- No card is required to understand the plot or affects a score, because there are no scores.
- Each card must give something unavailable otherwise, including `distill`.
- The linter report shows each card's cost in words and chapter coverage. A card with no material in a chapter says so in advance, so the slot is not wasted.

**Format:**

```yaml
- id: distill
  group: text
  affectsText: true
  unlockPart: 1
  excludes: [expanded]
  title: { ru: Сжатый сюжет }
  blurb: { ru: Меньше описаний, зато в конце главы вы получите сводку. }
  preview: previews/distill.bmd
  presentationClass: null
  audioBus: null
```

Card titles are data. If the book gets a story frame, such as archive clearances, the author renames them without code changes.

## 8. Mechanics

Every mechanic must work with animation off, without sound and with a screen reader. Turning a mechanic off must not break the plot.

### Pacing

- Scene modes: `flow` (scrolling), `para` (paragraph by paragraph), short `word` spans (word by word).
- Settings offer three options: authored pacing, always scrolling, always paragraph by paragraph.
- Controls: wheel, tap, keyboard, gesture.
- Text never moves on a timer. Only the reader takes the next step.
- With `prefers-reduced-motion`, a `word` span appears whole.

### Mutations

- The stage is stored per block and only grows.
- The rule is set in the scene: `decay=visits:2` or `decay=chapter:ch07`. There is no randomness.
- The stage changes the next time the chapter opens, never in front of the reader.
- The first screen warns that text may change on return.
- The journal of seen versions unlocks after the finale.

### Time

Only `time.night` and `time.season` from the local clock are available. They add shades in the `time` layer and block nothing.

### Dictionary and authorial lexicon

- Tapping a word shows a short meaning next to it, with no modal. This is available to everyone.
- How a word is shown depends on its glossary stage: translation first, then the word with a hint, then the word alone.
- The `decoder` card adds word origins and reveals hidden inscriptions.

### Interrogations and ontology

```text
::interrogation{id=mind with=seraphim}
Q Разум — ошибка эволюции или её цель?
A error  Ошибка.  => law.mind=error
A goal   Цель.    => law.mind=goal
A silent Промолчать. => law.mind=error, fact.silent=true
::end
```

- A book has at most four interrogations and two ontology flags. There are no correct answers.
- An answer can change until the reader leaves the scene. The world law then stays fixed for that playthrough.
- Laws change causes, explanations and a few key scenes, while shared events stay the same.
- Each law value must carry a cost in the story. The linter requires a visible effect in the chapter right after the choice and in the finale.
- For print, the author sets the canonical law in `editions/print.yaml`.

### Reading log

The log stays on the device in typed arrays: time on block, visits and a bit mask of flags (highlight, copy, opened note, return).

- A 1 Hz tick credits time to the block occupying most of the screen.
- Crediting stops when the tab is hidden, and when there is no activity for longer than three expected reading times of the block.
- Reader speed is a rolling median over blocks of at least 20 words.
- The block signal is `clamp(ln(dwell / expected), -2, 2)`, where `expected = words / wpm`.
- Signals are aggregated by theme tags and computed only for text the reader actually saw.

### Final portrait

```text
::portrait{id=returns-to-notes requires="stat.notes.revisits >= 3"}
Возвратов к заметкам: {stat.notes.revisits}. К письму матери: ни одного.
::end
```

- The portrait rests on verifiable statements about actions. Interpretation comes from the analyst as an unreliable character.
- A claim about a theme needs at least 20 blocks in the sample.
- The reader can answer «Это неправда» and get a pre-written reaction.
- Sensitive themes such as `violence` or `loss` cannot ground a reproach, and the linter forbids this.
- With the log off, a neutral version of the finale appears.

### Friends' traces

- A code holds the format version, book ID, content version and a sparse list: block ID, highlight, notable pause, closing point.
- A code contains no book text. It is compressed and passed in the URL fragment, so it never reaches a server.
- The sender sees a preview and separately enables pauses and the closing point. Only highlights are shared by default.
- Traces from chapters beyond the recipient's position stay hidden.
- If a trace points to a block missing from the recipient's version, an empty mark appears in the margin: a friend saw something else here.
- A code is untrusted input: 64 KB limit, schema validation, no free text.

### Copying

- The `copy` handler never calls `preventDefault` and never changes the clipboard.
- Copying 1,500 characters or more is recorded as `copied.<chapter>`.
- The author may write up to three reactions per book, such as an analyst's line. They work only with the log on.

### Highlights and recap

- Highlights are stored by block ID and offset. The author writes 20–30 points like `{if marked.a7f3: ...}`, each with a variant for no highlight.
- `::recap` appears at the start of a part or after a pause of three days or more. Its variants depend on `seen` and `marked`, and it can always be skipped.

### After the finale

- The screen shows the share of text unlocked and coverage by card.
- A scene code passes only the scene ID, the friend's card set and laws. The same resolver builds that version locally.
- The recipient sees only scenes already read.
- A new playthrough increments `run.n`, keeps `seen` and allows another world law.

### Sound

- Cues come from the scene's `ambience` and `mood`, with crossfades between them.
- The audio context starts only after a user action.
- Loading is lazy, with short looping files.
- Calls, screen lock and headphone disconnects are handled without clicks or lost state.

## 9. Text encryption

Encryption protects book files until display, but not text already displayed. A reader with a legitimate key can always extract the text, so do not spend effort fighting this, and do not promise otherwise in the UI or documentation.

**What is protected:**

| Threat | Protection |
| --- | --- |
| Downloading the whole book from static hosting | Chapters are encrypted, and the pack holds no key |
| Spoilers from build files | Text, conditions, chapter titles and audio cues sit inside ciphertext, and file names are opaque |
| Reading locked text without knowing the answer | The chapter key derives from the answer and is stored nowhere else |
| Pack substitution on hosting | The manifest is signed, and AES-GCM verifies each pack |
| Sharing an activation code | Accepted risk, with no device binding or accounts |
| Copying text after decryption | Not protected |

**Forbidden:** anti-debugging, selection blocking, invisible watermark characters, canvas rendering and custom crypto primitives. Use WebCrypto.

**Key hierarchy:**

```text
MASTER            held only by the author and in CI secrets
 ├─ CEK(chunk)    HKDF-SHA256(MASTER, salt=bookId, info=chunkId|contentVersion) → AES-256-GCM
 ├─ EK(edition)   edition key, encrypts CEKs of regular chapters in keyring.bin
 └─ PK(preview)   key inside the app, encrypts CEKs of preview chapters
LOCK(answer)      encrypts the CEK of locked text, with no keyring entry
```

**Pack format:**

| Field | Offset | Size, bytes |
| --- | --- | --- |
| `magic` = `BPK1` | 0 | 4 |
| `version` u8 | 4 | 1 |
| `alg` u8 | 5 | 1 |
| `contentVersion` u32 LE | 6 | 4 |
| `chunkIdHash` | 10 | 16 |
| `nonce` | 26 | 12 |
| `ciphertext + tag` | 38 | rest |

- Define these offsets once as named constants in `packages/crypto`. All reads and writes use them, with no literal offsets elsewhere.
- Golden test vectors in `packages/crypto/vectors/` cover the header, key derivation and full decryption. They run on every build.
- The whole header is passed to AES-GCM as additional authenticated data.
- Plaintext is `deflate-raw` over the serialized `CompiledChapter`: compress first, then encrypt.
- The nonce is random, 96 bits, new for every pack build.
- The file name is `HMAC(MASTER, chunkId)` in base32.
- Audio and images stay unencrypted for speed, but get a hash instead of a name. Spoiler images go inside a pack.

**The manifest** contains the pack list, sizes, ciphertext SHA-256, `contentVersion` and `minRuntime`. It is signed with an ECDSA P-256 key, and the public part ships in the app. The runtime verifies the signature before anything else.

**Runtime flow:**

1. `LicensePort` confirms entitlement and passes the EK to `KeyPort`.
2. `PackPort` provides the pack, and the runtime checks its hash against the manifest.
3. The EK decrypts the CEK, the CEK decrypts the chapter, then come decompression and parsing.
4. Plaintext stays only in memory: the current and next chapter, with LRU eviction.

Plaintext never appears in Cache Storage, IndexedDB, files or saves. Saves and the log reference IDs and offsets. The journal of seen versions is rebuilt by the resolver.

**EK storage:** a non-extractable `CryptoKey` in IndexedDB on the web, Keychain and Keystore through a secure storage plugin in mobile builds.

**Web activation without a server:**

- A code holds 128 random bits and is shown in base32 groups.
- Hosting holds a file `/v/<SHA-256("lookup" | code)>.bin` with the EK encrypted under `HKDF(code, "wrap")`.
- The runtime computes the file name, downloads it and recovers the EK, so activation works on plain static hosting.
- Deleting the file blocks new activations with that code. Already activated copies keep working.
- The `book codes` command creates a batch of codes for the sales platform and a separate encrypted ledger for the author.

**Knowledge lock:**

```text
::lock{id=lilac answers="сирень|куст сирени" hint=lock-lilac-hint}
Текст, доступный только тому, кто понял это из книги. ^m01a
::end
```

- An answer is normalized: NFKC, lowercase, `ё` to `е`, punctuation removed, spaces collapsed.
- Each answer variant has a copy of the CEK encrypted with a PBKDF2-HMAC-SHA256 key from the normalized answer. The salt is `bookId | lockId`.
- Neither the plaintext answer nor its hash is stored. The AES-GCM tag itself verifies correctness.
- Calibrate the iteration count so a check takes up to 500 ms on the target Android, and store it in the lock record.
- Short answers can be brute-forced with a dictionary. That is acceptable for a game lock, whose only job is to keep the text from lying in the open.
- An opened lock keeps its CEK in the save, encrypted under the EK.

**Device check.** Before writing pack code, test `crypto.subtle` and `CompressionStream` in WKWebView on the `capacitor://` scheme and in Android WebView. If an API is unavailable, plug a fallback in behind `CryptoPort` and record it in the decision log.

**Secrets management:**

- `MASTER` and the signing private key never reach git or logs.
- Creating production keys requires the author's confirmation. Development uses separate test keys.
- Document backups: losing `MASTER` makes compatible updates impossible.

## 10. Distribution

One source builds into different channels with one command, and no channel needs a permanent server. A channel is defined by configuration, not by branching in code.

| Channel | Purchase | Content | Main risk |
| --- | --- | --- | --- |
| Web, PWA | Activation code from a sales platform | Packs are downloaded and cached | The system may clear browser storage |
| iOS, App Store | Paid download or in-app purchase | Packs in the build | Rejection under guideline 4.2 as a plain book |
| Android, Google Play | Paid download or Play Billing | Packs in the build | Rejection as a static text app |
| EPUB | E-book stores | Canonical text without mechanics | Part of the concept is lost, so it is a separate product |
| Print | Publisher or print on demand | Canonical text, layout through Typst | Manual layout and proofreading required |

Installing the PWA covers desktop in the first version. Do not build a separate desktop app, but the ports must not block one.

**Channel configuration:**

```yaml
channel: ios
license: store-paid
packs: bundled
serviceWorker: false
edition: full
```

**Store requirements, checked as of the header date. Recheck before submission:**

- Apple sends an app that is simply a book to Apple Books and requires more than a repackaged website. Interactivity, offline use and native features must be immediately visible to the reviewer, so describe them in the review notes.
- Google Play does not allow static text-only or PDF apps without their own functionality.
- Apple forbids unlocking content through custom mechanisms, including license keys. So the iOS build has no activation code entry and no external purchase links.
- A reader app exception exists, but App Review decides, and it requires an account sign-in. Do not base the main plan on it.
- If an app needs a download on first launch, Apple requires showing its size and asking the user. So base content ships in the build, and optional audio packs download with a warning.
- Packs contain data only. New app behavior ships only in a new build.

**Licensing:**

- Implement `LicensePort` in three variants: `code`, `store-paid`, `store-iap`.
- The default for the first mobile version is `store-paid`, with no server receipt validation.
- `store-iap` with preview chapters must be ready as a replacement if the author chooses a free entry. Purchase restoration is mandatory.
- In a paid mobile build the EK is assembled from parts inside the app. This only makes extraction harder, and the documentation must say so plainly.
- The author chooses the sales platform. The engine only needs to accept codes.

**Versions and updates:**

- App version and `contentVersion` are independent. The manifest sets `minRuntime`.
- Web updates are atomic: a new manifest takes effect the next time a chapter opens.
- A save holds `schemaVersion`. Each format change has a migration and a test on an old save.
- Text edits must not break progress: permanent IDs, tombstones and position fallback to the nearest block ensure this.
- Reading progress moves by exporting a save file. The first version has no cloud sync and no accounts.

**Web storage:** request persistent storage and regularly offer save export. Losing browser data must not cost the reader the purchase, because reactivation by code always works.

**Print and EPUB:**

```yaml
edition: print
cards: [thoughts, facts]
laws: { mind: goal }
decay: 0
time: { night: false }
glossaryStage: final
replaceInteractive: print
```

- `book build --target=epub` is checked with EpubCheck, and `--target=print` outputs Typst source.
- Interrogations, locks and the portrait are replaced by `::print` blocks, and the linter verifies these replacements exist.
- These editions contain only the selected text variant. The full variant graph stays in encrypted packs.

**Shutdown plan.** Describe in `docs/release.md` how to publish a final version without activation if the author stops support. A purchased book must stay readable in 10 years: everything needed lives in static files and plain text sources.

## 11. Accessibility and privacy

Accessibility and reader data protection are not game resources and are never granted through cards.

**Accessibility:**

- Target WCAG 2.2 AA for the UI. Text is always real and selectable.
- Size, line spacing, font, theme and contrast are always available, including a simplified font mode.
- Support `prefers-reduced-motion`, `prefers-contrast` and system scaling.
- Screen reader mode shows linear text and announces cards, locks and interrogations.
- Everything works from the keyboard, with touch targets of at least 44 CSS pixels.
- All sound and pulse have a visual alternative, and no plot information is lost without them.
- `voices` typography stays readable, and it can be simplified without losing the card.

**Privacy:**

- The reading log, highlights and traces stay on the device. Network requests are only for packs, codes and updates.
- The first screen says plainly: «Книга запоминает, как вы её читаете. Эти данные остаются на устройстве». Mechanic details need not be revealed.
- Settings can turn the log off and delete it with one button.
- No third-party analytics, advertising or tracking SDKs. Store privacy labels must match actual behavior.
- An error report is sent only manually, after showing its contents, and without book text or the log.
- Traces are shared only by an explicit reader action.

## 12. Tests, stages and readiness

Work proceeds in vertical stages, and the demo chapter must run after each one. The next stage starts only when the current one meets its criteria.

| Stage | Result | Completion criterion |
| --- | --- | --- |
| 0. Device check and schemas | Prototype on iOS and Android, `format` types | `crypto.subtle`, `CompressionStream`, audio, storage and plain DOM chapter rendering are measured on real devices |
| 1. Compiler | Parser, layers, IDs, IR, linter, plain text output | The demo chapter passes all linter scopes, and errors point to file and line |
| 2. Core and reader | Resolver, pacing, position, saves, PWA without encryption | Section 3 budgets are met on a mid-range Android device |
| 3. Cards and studio | Deck, selection, presentation, audio, author studio | All 16 cards work, previews and the cost report are ready |
| 4. Encryption and offline | Packs, manifest, activation, locks, Service Worker | Build files hold no plaintext, and reading works offline |
| 5. Story mechanics | Mutations, glossary, interrogations, ontology, recap, highlights | The demo chapter shows different text under different laws and stages |
| 6. Log and social features | Log, portrait, traces, copying, finale, second playthrough | The portrait holds only confirmed statements, and import survives garbage |
| 7. Mobile channels | Capacitor, licensing, vibration, audio session | Builds are installed on devices, and store review materials are ready |
| 8. Editions and release | EPUB, Typst, documentation, shutdown plan | EPUB passes EpubCheck, and the author can build all channels with one command |

**Required tests:**

- **Resolver:** unit and property tests on random states, checking the section 6 invariants.
- **Compiler:** golden files for parsing and merging, negative examples for the linter, including Russian punctuation errors at span boundaries.
- **Encryption:** golden vectors, header and ciphertext tampering, wrong key, answer normalization, nonce uniqueness.
- **Leak check:** a test searches `dist` and storage after reading for demo text fragments and concept file content.
- **Saves:** a set of old saves passes all migrations, and position fallback works with deleted blocks.
- **Traces:** import fuzzing and limit checks.
- **End-to-end Playwright scenario:** activation, reading, offline, content update, continued reading.
- **Devices:** a call during sound, screen lock, low memory, rotation, VoiceOver and TalkBack.
- **Position:** restoring by block ID causes no scroll jump after a card change.
- **Allocations:** a heap profile confirms no allocations in the per-frame paths from section 3.

**Definition of done for the first version:**

- The author can write a chapter without knowing code and see all its variants in the studio.
- A reader can buy, activate and read the book offline on the web, iOS and Android.
- Turning off sound, animation and the log does not break the plot.
- A text update does not break old saves.
- No channel needs a running server after content is obtained.
- A test with unfamiliar readers has checked the main question: do they want to know, after the finale, what was on the other cards.

**Вывод после каждого этапа и после завершения задания пиши на русском:** что работает, измеренные бюджеты, принятые решения, открытые риски.

Start with stage 0.

---

### Источники для автора промпта

- [Minimum Functionality: правила Apple и Google Play](https://newly.app/guides/minimum-functionality-rejection), прочитано 21 октября 2026 года авторами страницы.
- [Reader Apps на App Store](https://newly.app/guides/app-store-reader-apps): статус требует входа в аккаунт, которого в этом проекте нет.
- [Запрет собственных механизмов разблокировки](https://conductatlas.com/platform/apple/apple-app-store-review-guidelines/provision/CA-P-018897/mandatory-use-of-in-app-purchase-for-digital-content/).
- [WebKit: Service Worker в WKWebView](https://bugs.webkit.org/show_bug.cgi?id=206741): запись открыта, последнее изменение в августе 2026 года.
- [Обновление Capacitor до 8.4.2 в зависимостях Ionic](https://github.com/ionic-team/ionic-framework/pull/31272): подтверждает актуальность ветки 8.x на июль 2026 года.
