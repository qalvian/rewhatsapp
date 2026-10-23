// @ts-check

import { DELETED_MESSAGE_PATTERNS, MEDIA_PLACEHOLDER_PATTERNS } from './locales.js';
import { getEmojiOnlyCount } from '../../util/emoji.js';

/**
 * @typedef {'text' | 'system' | 'media' | 'voice' | 'call' | 'deleted'} MessageType
 */

/**
 * @typedef {Object} ClassificationResult
 * @property {MessageType} type
 * @property {string} text Cleaned text
 * @property {number} emojiOnlyCount 0 or 1..3
 * @property {{ kind: 'image' | 'video' | 'audio' | 'sticker' | 'document' | 'voice'; filename?: string } | undefined} mediaInfo
 */

const CALL_PATTERNS = [
  /Missed (?:voice|video)?\s*call/i,
  /Llamada (?:perdida|(?:de voz|de video) perdida)/i,
  /Chamada (?:perdida|(?:de voz|de vídeo) perdida)/i,
  /Verpasster (?:Sprachanruf|Videoanruf|Anruf)/i,
  /Appel (?:vocal|vidéo)?\s*manqué/i,
  /Chiamata (?:vocale|video)?\s*persa/i,
];

/**
 * Classifies a message into:
 * - 'call' (missed or ended audio/video call)
 * - 'deleted' (deleted by sender or recipient)
 * - 'voice' (voice note / audio message)
 * - 'media' (image, video, sticker, document placeholder)
 * - 'system' (group changes, encryption notice, etc.)
 * - 'text' (standard text message, with emojiOnlyCount check)
 *
 * @param {string} text
 * @param {boolean} isSystem
 * @returns {ClassificationResult}
 */
export function classifyMessage(text, isSystem) {
  const trimmed = text.trim();

  // Check for calls first (calls can appear with or without a sender prefix)
  for (const pattern of CALL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        type: 'call',
        text: trimmed,
        emojiOnlyCount: 0,
        mediaInfo: undefined,
      };
    }
  }

  if (isSystem) {
    return {
      type: 'system',
      text: trimmed,
      emojiOnlyCount: 0,
      mediaInfo: undefined,
    };
  }

  // Check for deleted message patterns
  for (const pattern of DELETED_MESSAGE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        type: 'deleted',
        text: trimmed,
        emojiOnlyCount: 0,
        mediaInfo: undefined,
      };
    }
  }

  // Check for media and voice note placeholders
  for (const { kind, pattern } of MEDIA_PLACEHOLDER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      // Extract possible filename (e.g. from <attached: filename> or IMG-xxx.jpg)
      let filename;
      const fileMatch = trimmed.match(
        /(?:<attached:\s*)?([A-Za-z0-9_-]+\.(?:jpg|jpeg|png|heic|webp|opus|m4a|aac|mp3|mp4|mov|pdf|docx?))>?/i,
      );
      if (fileMatch) {
        filename = fileMatch[1];
      }

      return {
        type: kind === 'voice' ? 'voice' : 'media',
        text: trimmed,
        emojiOnlyCount: 0,
        mediaInfo: {
          kind,
          filename,
        },
      };
    }
  }

  // Standard text message
  const emojiCount = getEmojiOnlyCount(trimmed);

  return {
    type: 'text',
    text,
    emojiOnlyCount: emojiCount,
    mediaInfo: undefined,
  };
}
