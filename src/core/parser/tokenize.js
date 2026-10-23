// @ts-check

import { matchHeader } from './grammar.js';

/**
 * @typedef {Object} RawMessageToken
 * @property {number} id Monotonically increasing record ID
 * @property {string} rawHeader
 * @property {string} datePart
 * @property {string} timePart
 * @property {string} body
 * @property {number} lineNumber 1-based original line number
 * @property {boolean} hasContinuation
 */

/**
 * Tokenizes normalized chat lines into raw message records.
 * Lines matching the header grammar begin a new message record.
 * Any non-matching line is appended as a continuation ('\n' + line) to the preceding message,
 * preserving internal line breaks and blank lines.
 *
 * @param {string[]} lines Array of normalized lines
 * @param {import('./grammar.js').HeaderGrammar} grammar Compiled header grammar
 * @returns {RawMessageToken[]}
 */
export function tokenizeChat(lines, grammar) {
  /** @type {RawMessageToken[]} */
  const tokens = [];
  let currentToken = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = matchHeader(line, grammar);

    if (match) {
      currentToken = {
        id: tokens.length,
        rawHeader: match.rawHeader,
        datePart: match.datePart,
        timePart: match.timePart,
        body: match.body,
        lineNumber: i + 1,
        hasContinuation: false,
      };
      tokens.push(currentToken);
    } else if (currentToken) {
      // Continuation of current message
      currentToken.body += '\n' + line;
      currentToken.hasContinuation = true;
    }
    // Lines preceding the first valid header (e.g. blank lines or export artifacts) are discarded
  }

  return tokens;
}
