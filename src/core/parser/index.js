// @ts-check

import { decodeChatContent } from './decode.js';
import { normalizeChatText } from './normalize.js';
import { detectGrammar } from './grammar.js';
import { tokenizeChat } from './tokenize.js';
import { inferDateOrder, parseDateTimeToUtc } from './dates.js';
import { discoverParticipants, resolveSender } from './participants.js';
import { classifyMessage } from './classify.js';
import { spreadSubMinuteTimestamps } from './spread.js';
import { isZipArchive, extractChatFromZip } from '../zip.js';

/**
 * @typedef {import('./dates.js').DateOrder} DateOrder
 * @typedef {import('./participants.js').Participant} Participant
 * @typedef {import('./classify.js').MessageType} MessageType
 */

/**
 * @typedef {Object} ChatMessage
 * @property {number} id
 * @property {string} rawTimestamp
 * @property {number} timestamp
 * @property {string} senderRaw
 * @property {string} senderDisplayName
 * @property {number} senderIndex
 * @property {boolean} isOutgoing
 * @property {MessageType} type
 * @property {string} text
 * @property {boolean} isContinuation
 * @property {number} emojiOnlyCount
 * @property {{ kind: 'image' | 'video' | 'audio' | 'sticker' | 'document' | 'voice'; filename?: string } | undefined} mediaInfo
 * @property {number} sentimentValence
 */

/**
 * @typedef {Object} ParsedChatResult
 * @property {ChatMessage[]} messages
 * @property {Participant[]} participants
 * @property {DateOrder} dateOrder
 * @property {number} dateConfidence
 * @property {string} grammarId
 * @property {number} totalCount
 */

/**
 * @typedef {Object} ParseChatOptions
 * @property {DateOrder} [overrideDateOrder]
 * @property {(meta: { participants: Participant[]; dateOrder: DateOrder; dateConfidence: number; totalEstimated: number; firstDate?: string; lastDate?: string }) => void} [onEarlyMeta]
 */

/**
 * High-performance, zero-dependency WhatsApp chat parser.
 * Handles text streams, ArrayBuffers, strings, and iOS ZIP archives.
 *
 * @param {ArrayBuffer | Uint8Array | string} input
 * @param {ParseChatOptions} [options]
 * @returns {Promise<ParsedChatResult>}
 */
export async function parseChat(input, options = {}) {
  let rawText = '';

  // 1. Check if input is a ZIP archive
  if (typeof input !== 'string' && isZipArchive(input)) {
    const arrayBuffer =
      input instanceof Uint8Array
        ? input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength)
        : input;
    const { chatText } = await extractChatFromZip(/** @type {ArrayBuffer} */ (arrayBuffer));
    rawText = chatText;
  } else {
    rawText = decodeChatContent(input);
  }

  // 2. Normalize text (bidi controls, spacing, digits, newlines)
  const normalized = normalizeChatText(rawText);
  const lines = normalized.split('\n');

  // 3. Grammar detection by scoring against sample lines
  const grammar = detectGrammar(lines);

  // 4. Tokenize header vs multi-line continuations
  const tokens = tokenizeChat(lines, grammar);

  if (tokens.length === 0) {
    throw new Error('No valid WhatsApp message headers were detected in this file.');
  }

  // 5. Two-pass participant discovery
  const participantsMap = discoverParticipants(tokens);
  const participants = Array.from(participantsMap.values());

  // 6. Date order inference (DMY vs MDY vs YMD)
  const dateStrings = tokens.map((t) => t.datePart);
  const dateInference = inferDateOrder(dateStrings, grammar.is12Hour);
  const dateOrder = options.overrideDateOrder || dateInference.order;

  // Emit early metadata if listener provided
  if (options.onEarlyMeta) {
    options.onEarlyMeta({
      participants,
      dateOrder,
      dateConfidence: dateInference.confidence,
      totalEstimated: tokens.length,
      firstDate: tokens[0]?.datePart,
      lastDate: tokens[tokens.length - 1]?.datePart,
    });
  }

  // 7. Parse raw UTC timestamps
  const rawTimestamps = new Array(tokens.length);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    rawTimestamps[i] = parseDateTimeToUtc(t.datePart, t.timePart, dateOrder);
  }

  // 8. Deterministic sub-minute offset spreading for Android second-less runs
  const spreadTimestamps = spreadSubMinuteTimestamps(rawTimestamps, grammar.hasSeconds);

  // 9. Classify, resolve sender, and construct final message models
  /** @type {ChatMessage[]} */
  const messages = new Array(tokens.length);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const resolved = resolveSender(t.body, participantsMap);
    const classification = classifyMessage(resolved.text, resolved.isSystem);

    const participant = resolved.senderRaw ? participantsMap.get(resolved.senderRaw) : null;
    const senderIndex = participant ? participant.index : -1;

    messages[i] = {
      id: i,
      rawTimestamp: `${t.datePart}, ${t.timePart}`,
      timestamp: spreadTimestamps[i],
      senderRaw: resolved.senderRaw,
      senderDisplayName: resolved.senderDisplayName,
      senderIndex,
      isOutgoing: false, // Set when persona is chosen
      type: classification.type,
      text: classification.text,
      isContinuation: t.hasContinuation,
      emojiOnlyCount: classification.emojiOnlyCount,
      mediaInfo: classification.mediaInfo,
      sentimentValence: 0, // Computed in engine
    };
  }

  return {
    messages,
    participants,
    dateOrder,
    dateConfidence: dateInference.confidence,
    grammarId: grammar.id,
    totalCount: messages.length,
  };
}
