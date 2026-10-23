// @ts-check

import { SYSTEM_EVENT_PATTERNS } from './locales.js';

/**
 * @typedef {Object} Participant
 * @property {string} raw The exact raw sender string (used for Map keys)
 * @property {string} displayName Sanitized human-readable display name
 * @property {number} index Zero-based participant index
 * @property {number} messageCount Total messages sent in chat
 */

/**
 * @typedef {Object} ResolvedSender
 * @property {boolean} isSystem
 * @property {string} senderRaw
 * @property {string} senderDisplayName
 * @property {string} text
 */

/**
 * Normalizes a raw sender string for display only.
 * Strips leading '~' (WhatsApp non-contact indicator) and unifies extraneous whitespace.
 *
 * @param {string} raw
 * @returns {string}
 */
export function formatDisplayName(raw) {
  if (!raw) return '';
  return raw
    .replace(/^~+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Discovers and scores participants from raw message tokens using a two-pass algorithm.
 * Safely handles hazards: phone numbers, leading ~, colons/emoji in names, and '__proto__'.
 *
 * @param {Array<{ body: string }>} tokens
 * @returns {Map<string, Participant>} Map keyed strictly by senderRaw
 */
export function discoverParticipants(tokens) {
  /** @type {Map<string, number>} Safe Map keyed by exact raw sender string */
  const counts = new Map();

  for (const token of tokens) {
    const body = token.body;

    // Pass 1: Known system patterns always win and never produce sender candidates
    let isKnownSystem = false;
    for (const pattern of SYSTEM_EVENT_PATTERNS) {
      if (pattern.test(body)) {
        isKnownSystem = true;
        break;
      }
    }
    if (isKnownSystem) continue;

    // Pass 2: Look for ': ' separating sender and message text
    const colonIdx = body.indexOf(': ');
    if (colonIdx <= 0 || colonIdx > 60) continue;

    const candidate = body.slice(0, colonIdx).trim();

    // Reject candidates with sentence punctuation (indicates a system line containing a colon)
    if (/[.!?\n]/.test(candidate)) continue;

    // Plausible participant shape: <= 40 chars, or starts with phone '+' / digits, or contains non-punctuation
    counts.set(candidate, (counts.get(candidate) || 0) + 1);
  }

  // Filter participants:
  // Accept if frequency >= 2 OR if candidate is short (<= 40 chars) without sentence punctuation
  const filtered = Array.from(counts.entries())
    .filter(([name, count]) => count >= 2 || (name.length <= 40 && !/[.!?]/.test(name)))
    .sort((a, b) => b[1] - a[1]); // Most active participants first

  /** @type {Map<string, Participant>} */
  const participants = new Map();

  filtered.forEach(([raw, count], idx) => {
    participants.set(raw, {
      raw,
      displayName: formatDisplayName(raw),
      index: idx,
      messageCount: count,
    });
  });

  return participants;
}

/**
 * Resolves whether a message body is from a known participant or a system event.
 *
 * @param {string} body
 * @param {Map<string, Participant>} participants
 * @returns {ResolvedSender}
 */
export function resolveSender(body, participants) {
  // Check known system patterns first
  for (const pattern of SYSTEM_EVENT_PATTERNS) {
    if (pattern.test(body)) {
      return {
        isSystem: true,
        senderRaw: '',
        senderDisplayName: '',
        text: body,
      };
    }
  }

  const colonIdx = body.indexOf(': ');
  if (colonIdx > 0 && colonIdx <= 60) {
    const candidate = body.slice(0, colonIdx).trim();
    const participant = participants.get(candidate);
    if (participant) {
      return {
        isSystem: false,
        senderRaw: participant.raw,
        senderDisplayName: participant.displayName,
        text: body.slice(colonIdx + 2),
      };
    }
  }

  // No recognized participant prefix -> system event
  return {
    isSystem: true,
    senderRaw: '',
    senderDisplayName: '',
    text: body,
  };
}
