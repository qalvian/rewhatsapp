// @ts-check

import { LEXICON_VALENCE } from './lexicon.js';

/**
 * Standard emoji valence lookup table.
 * Used for emotional timeline sparkline generation across all languages.
 * @type {Record<string, number>}
 */
const EMOJI_VALENCE = {
  '❤️': 0.95,
  '💖': 0.9,
  '💕': 0.85,
  '💓': 0.85,
  '🥰': 0.9,
  '😍': 0.9,
  '😘': 0.85,
  '💋': 0.8,
  '😂': 0.75,
  '🤣': 0.8,
  '😄': 0.7,
  '😁': 0.65,
  '😊': 0.6,
  '✨': 0.6,
  '🎉': 0.75,
  '🥳': 0.8,
  '🔥': 0.65,
  '🥺': 0.35,
  '🥹': 0.45,
  '☕': 0.4,
  '🌸': 0.5,
  '👍': 0.4,
  '🙌': 0.6,
  '🤗': 0.7,

  '💔': -0.9,
  '😭': -0.75,
  '😢': -0.7,
  '😔': -0.65,
  '😞': -0.65,
  '😡': -0.85,
  '🤬': -0.95,
  '😤': -0.7,
  '😠': -0.75,
  '😐': -0.3,
  '😕': -0.4,
  '🙄': -0.5,
  '🤦': -0.4,
  '👎': -0.5,
  '💀': -0.2,
};

/**
 * Computes emotional valence score for a single message (-1.0 to +1.0).
 * English text is matched against lexicon.json.
 * All languages benefit from emoji and punctuation emotional signals.
 *
 * @param {string} text
 * @returns {number} Score between -1.0 (deeply negative) and +1.0 (warmly positive)
 */
export function scoreMessageSentiment(text) {
  if (!text) return 0;

  let totalScore = 0;
  let signalCount = 0;

  // 1. Emoji valence signals
  for (const [emoji, valence] of Object.entries(EMOJI_VALENCE)) {
    if (text.includes(emoji)) {
      totalScore += valence * 1.5; // Emojis are strong emotional signals
      signalCount += 1.5;
    }
  }

  // 2. Word valence signals (lexicon)
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  for (const word of tokens) {
    if (Object.prototype.hasOwnProperty.call(LEXICON_VALENCE, word)) {
      totalScore += LEXICON_VALENCE[word];
      signalCount++;
    }
  }

  // 3. Punctuation amplifier
  if (text.includes('!') && signalCount > 0) {
    totalScore *= 1.15;
  }

  if (signalCount === 0) return 0;

  const rawScore = totalScore / signalCount;
  return Math.max(-1, Math.min(1, rawScore));
}

/**
 * @typedef {Object} ScrubberBucket
 * @property {number} index
 * @property {number} count
 * @property {number} avgSentiment -1.0 to +1.0
 * @property {number} density Normalized 0.0 to 1.0
 * @property {number} startTime
 * @property {number} endTime
 */

/**
 * Divides messages into N buckets for the emotion sparkline scrubber.
 * Each bucket represents message density and average sentiment.
 *
 * @param {Array<{ timestamp: number; text: string }>} messages
 * @param {number} [numBuckets=80]
 * @returns {ScrubberBucket[]}
 */
export function computeScrubberBuckets(messages, numBuckets = 80) {
  if (!messages || messages.length === 0) return [];

  const n = messages.length;
  const count = Math.min(numBuckets, n);
  const bucketSize = n / count;

  /** @type {ScrubberBucket[]} */
  const buckets = new Array(count);
  let maxCount = 1;

  for (let i = 0; i < count; i++) {
    const startIdx = Math.floor(i * bucketSize);
    const endIdx = Math.min(n, Math.floor((i + 1) * bucketSize));
    let sentimentSum = 0;
    let messageCount = 0;

    for (let j = startIdx; j < endIdx; j++) {
      const msg = messages[j];
      sentimentSum += scoreMessageSentiment(msg.text);
      messageCount++;
    }

    if (messageCount > maxCount) {
      maxCount = messageCount;
    }

    buckets[i] = {
      index: i,
      count: messageCount,
      avgSentiment: messageCount > 0 ? sentimentSum / messageCount : 0,
      density: 0, // normalized in next pass
      startTime: messages[startIdx]?.timestamp || 0,
      endTime: messages[endIdx - 1]?.timestamp || 0,
    };
  }

  // Normalize densities
  for (const b of buckets) {
    b.density = b.count / maxCount;
  }

  return buckets;
}
