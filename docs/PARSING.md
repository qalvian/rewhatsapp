# WhatsApp Export Parsing Architecture

Parsing raw WhatsApp text exports is notoriously deceptive: there is no formal specification, headers vary by mobile OS, locale, and Android/iOS build, and message text frequently contains arbitrary formatting, emojis, and timestamps.

`rewhatsapp` replaces brittle single "mega-regex" approaches with a **strict candidate grammar scoring pipeline**:

```
Raw Input (Plain Text / ArrayBuffer)
  │
  ├─ 1. Sniff BOM & Decode (UTF-8, UTF-16LE, UTF-16BE)
  ├─ 2. Normalize Unicode (Bidi controls, Narrow NBSP, Arabic/Devanagari digits)
  ├─ 3. Detect Grammar by Scoring (First 200 non-empty lines)
  ├─ 4. Compile Strict Regex & Tokenize (Headers vs Continuations)
  ├─ 5. Constraint-Solve Date Order (DMY vs MDY vs YMD)
  ├─ 6. Two-Pass Sender Discovery (System Events vs Participants)
  ├─ 7. Classify Records (Emoji counts, Media, Voice, Deleted, Calls)
  └─ 8. Deterministic Sub-Minute Spreading (Monotonic timestamps)
```

---

## 1. Encoding Detection & BOM Sniffing (`src/core/parser/decode.js`)

WhatsApp exports generated on Windows or certain non-English Android devices are encoded in UTF-16 Little Endian (`FF FE`) or Big Endian (`FE FF`).

- We inspect the first 3 bytes before decoding:
  - `EF BB BF` → UTF-8 with BOM (strip 3 bytes).
  - `FF FE` → UTF-16LE (decode with `TextDecoder('utf-16le')`).
  - `FE FF` → UTF-16BE (decode with `TextDecoder('utf-16be')`).
  - Otherwise → Defaults to standard UTF-8.

## 2. Unicode Normalization (`src/core/parser/normalize.js`)

- **Bidi Controls**: iOS exports litter strings with Left-to-Right and Right-to-Left marks (`\u200E`, `\u200F`, `\u202A-\u202E`). We strip these cleanly.
- **Narrow No-Break Space**: Newer iOS and Android versions place `\u202F` or `\u00A0` between the minute and AM/PM (e.g. `10:30 AM`). We unify these to ASCII spaces (`\u0020`).
- **Digit Normalization**: Arabic-Indic digits (`٠-٩`) and Devanagari digits (`०-९`) are mapped to ASCII digits `0-9` via lookup tables.
- **Line Endings**: Normalizes `\r\n` and `\r` to `\n`.

## 3. Grammar Detection by Scoring (`src/core/parser/grammar.js`)

Rather than running a slow, tolerant regex on every line, we test the first 200 non-empty lines against candidate grammar definitions:

- Android standard 24h (`DD/MM/YYYY, HH:MM - Sender: Message`)
- Android US 12h (`MM/DD/YY, H:MM AM - Sender: Message`)
- iOS bracketed with seconds (`[DD/MM/YYYY, HH:MM:SS] Sender: Message`)
- iOS bracketed 12h without seconds (`[M/D/YY, H:MM:SS AM] Sender: Message`)
- German dot-separated 24h (`DD.MM.YY, HH:MM - Sender: Message`)
- Spanish hyphenated AM/PM (`DD/MM/YY, H:MM a. m. - Sender: Message`)

**Mandatory Delimiter Rule**: A valid header must terminate in either `-` or `] `. A wrapped message line starting with numbers (e.g. `12/5, 10:30 meeting with client`) will never match as a header because it lacks the mandatory delimiter.

## 4. Multi-Line Messages & Preserving Continuations (`src/core/parser/tokenize.js`)

Any line that does not begin with the detected strict header grammar is identified as a continuation of the preceding message. Blank lines inside messages are preserved verbatim.

## 5. Date Order Inference: Constraint Solving (`src/core/parser/dates.js`)

Distinguishing `DD/MM/YY` from `MM/DD/YY` when day and month are both $\le 12$ is mathematically ambiguous on a single line. We treat this as constraint satisfaction across the _entire_ file:

1. **Hard Constraints**:
   - Any first field $> 12 \implies \text{DMY}$.
   - Any second field $> 12 \implies \text{MDY}$.
   - Any 4-digit first field $\implies \text{YMD}$.
2. **Monotonicity Evaluation**:
   - If still ambiguous, we test both hypotheses across the whole conversation. The hypothesis yielding fewer negative timestamp jumps (chronological inversions) is selected.
3. **Priors**:
   - 12-hour AM/PM formats weakly favor MDY (US convention). 24-hour formats favor DMY.
4. **User Confirmation**:
   - In the Setup dialog, the detected order is surfaced as a live toggle (`DD/MM ↔ MM/DD`) previewing the exact formatted dates of the first and last messages, so the user can correct low-confidence guesses in one tap.

## 6. Two-Digit Years & Clock Normalization

- `YY` is normalized to `20YY`.
- `12:xx AM` is parsed as UTC hour `0`.
- `12:xx PM` is parsed as UTC hour `12`.
- Locale markers `a. m.`, `p.m.`, `vorm.` are normalized to standard `am` / `pm`.

## 7. Sender vs. System Messages (`src/core/parser/participants.js`)

System events do not have a `Sender: ` prefix, but occasionally contain colons (e.g. `Sam changed the subject from "Trip: Spain" to "Trip: Portugal"`).

- **Pass 1**: Check against known localized system event patterns (`locales.js`). These always win.
- **Pass 2**: Split on the first `: `. Accept as sender only if the candidate name:
  - Appears multiple times in the file, OR
  - Is $\le 40$ characters with plausible phone or name syntax (no sentence punctuation like `.` or `?`).
  - Otherwise, classify as a system notification.

## 8. Multilingual Locale Placeholders (`src/core/parser/locales.js`)

System messages and omitted media placeholders (`<Media omitted>`, `image omitted`, `This message was deleted`) are maintained in a clean per-language data dictionary, allowing contributors to add support for a new language via a single-file PR.

## 9. Sub-Minute Ordering for Second-less Timestamps (`src/core/parser/spread.js`)

Android exports lack second-level timestamps (`HH:MM`). When multiple messages occur in the same minute, file order is preserved. We distribute these messages evenly across the minute using deterministic, index-seeded offsets without ever spilling into the subsequent minute.

## 10. Timezones & DST Immunity

Exports contain no timezone metadata. All dates are parsed using `Date.UTC(year, month, day, hours, minutes, seconds)` and retrieved via `getUTC*` methods ("floating local time"). This completely eliminates phantom daylight saving time gaps and duplicates.

## 11. Unicode Grapheme Segmentation for Emojis (`src/core/parser/classify.js`)

JavaScript `.length` fails on multi-codepoint emojis (e.g. 👨‍👩‍👧‍👦 has length 11). We use `Intl.Segmenter` with `granularity: 'grapheme'` to count exact visual glyphs. Messages containing 1–3 emojis with no text are rendered in the real enlarged WhatsApp sticker style.

## 12. Participant Name Hazards

- Contacts starting with `~` have the tilde stripped for display only.
- Participants named `__proto__` are safely stored using native ES `Map` objects rather than plain JavaScript objects.

## 13. Future Media & Archive Roadmap

Currently, `rewhatsapp` focuses strictly on plain-text (`.txt`) exports. Internal low-level ZIP utilities (`src/core/zip.js`) exist in the codebase for potential future archive extraction, but user-facing features currently require lightweight `.txt` exports created via "Without Media".

## 14. Inherent Format Limitations: Spoofed Headers

Because WhatsApp exports are plain text files, a user who sends a message starting with a valid timestamp string could theoretically create an artificial message boundary. This is an unavoidable limitation of the plain-text format.
