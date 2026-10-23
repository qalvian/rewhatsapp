// @ts-check

/**
 * Character mapping table for non-ASCII digits (Arabic-Indic and Devanagari) to ASCII digits.
 * @type {Record<string, string>}
 */
const DIGIT_MAP = {
  // Eastern Arabic-Indic digits
  '\u0660': '0',
  '\u0661': '1',
  '\u0662': '2',
  '\u0663': '3',
  '\u0664': '4',
  '\u0665': '5',
  '\u0666': '6',
  '\u0667': '7',
  '\u0668': '8',
  '\u0669': '9',
  // Devanagari digits
  '\u0966': '0',
  '\u0967': '1',
  '\u0968': '2',
  '\u0969': '3',
  '\u096a': '4',
  '\u096b': '5',
  '\u096c': '6',
  '\u096d': '7',
  '\u096e': '8',
  '\u096f': '9',
};

const BIDI_REGEX = /[\u200E\u200F\u202A-\u202E]/g;
const NON_BREAKING_SPACE_REGEX = /[\u202F\u00A0]/g;
const DIGIT_REGEX = /[\u0660-\u0669\u0966-\u096F]/g;
const NEWLINE_REGEX = /\r\n?/g;

/**
 * Normalizes WhatsApp raw text export:
 * 1. Strips bidirectional markers (LRM/RLM/directional isolates).
 * 2. Unifies narrow and non-breaking spaces before AM/PM to ASCII space.
 * 3. Normalizes Arabic-Indic and Devanagari numerals to ASCII digits.
 * 4. Normalizes line endings to '\n'.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeChatText(text) {
  if (!text) return '';

  return text
    .replace(BIDI_REGEX, '')
    .replace(NON_BREAKING_SPACE_REGEX, ' ')
    .replace(NEWLINE_REGEX, '\n')
    .replace(DIGIT_REGEX, (ch) => DIGIT_MAP[ch] || ch);
}

/**
 * Normalizes a single line (preserves line-level formatting without changing newlines).
 * @param {string} line
 * @returns {string}
 */
export function normalizeLine(line) {
  if (!line) return '';
  return line
    .replace(BIDI_REGEX, '')
    .replace(NON_BREAKING_SPACE_REGEX, ' ')
    .replace(DIGIT_REGEX, (ch) => DIGIT_MAP[ch] || ch);
}
