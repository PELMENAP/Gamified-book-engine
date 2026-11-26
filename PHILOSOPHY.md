# Gamified Book Engine Philosophy

This is not a visual novel and not an RPG. It is a book. The reader reads, and the book quietly notices how.

---

## 1. Reading Is the Core

Every mechanic serves reading and none of them competes with it.

- Text never moves on a timer. Only the reader takes the next step.
- There are no scores, no correct answers and no optimal card set.
- Word-by-word display exists only in short authored peaks, and never with reduced motion.
- A mechanic that tires the reader is cut, however clever it is.

## 2. The Author Writes Every Word

The engine arranges text; it never invents it.

- Every variant, mutation stage, recap and portrait line is written by the author.
- No random corruption, no generated text, no surprises the author did not review.
- One reader state always yields one text: the resolver has no randomness and no clock.
- Text never changes in front of the reader. Changes apply the next time a chapter opens.
- The author sees every combination in the studio before the reader does.

## 3. Every Path Is a Whole Story

- Any set of cards, any world law and any combination of mechanics turned off gives the complete plot.
- Cards change how the story is understood, not whether it can be understood.
- Laws change causes and explanations; shared events stay the same.
- Each card gives something unavailable otherwise, and each law value carries a cost in the story.

## 4. The Engine Knows No Book

- Names, cards, laws, glossary words and rules are data in `book/`.
- The author renames, replaces or removes a card without touching code.
- A rule that a second book would want differently belongs in data, not in code.

## 5. The Reader's Data Stays with the Reader

- The reading log, highlights and traces live on the device.
- No external analytics, advertising or tracking. Network requests are for packs, codes and updates only.
- Sharing happens only by an explicit reader action, and the reader sees what is shared.
- The log can be turned off and deleted with one button, and the book still works.

## 6. Accessibility Is Not a Resource

- Font, size, contrast, motion and sound settings are always available to everyone and are never cards.
- Text is real, selectable DOM text. Screen readers, translation tools and quotes always work.
- Every sound and vibration has a visual alternative.

## 7. Honest Protection

- Encryption keeps the files closed until display. It does not protect text already displayed, and the book never claims otherwise.
- Copying always works. The book may remember it and mention it later; it never blocks it.
- No anti-debugging, no invisible watermarks, no canvas text, no custom crypto.

## 8. One Source, No Required Server

- App, EPUB and print are built from the same plain-text files.
- Every channel works on static hosting, and offline once the content is obtained.
- A purchased book must stay readable in ten years.

## 9. Principles

1. Do not interrupt reading.
2. Do not write text the author did not write.
3. Do not make any path incomplete.
4. Do not put a book into the engine.
5. Do not send the reader's reading anywhere.
6. Do not trade accessibility for play.
7. Do not promise protection that does not exist.

---

*The book reads the reader back, but it keeps the secret on the reader's own device.*
