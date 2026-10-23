// @ts-check

/**
 * Modern grapheme segmenter for accurate emoji and multi-byte character segmentation.
 */
const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

/** Regex matching unicode extended pictographic characters */
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

/**
 * Counts the exact number of user-perceived grapheme clusters in a string.
 * Accurately handles complex emoji (skin tones, ZWJ sequences, flags).
 *
 * @param {string} str
 * @returns {number}
 */
export function countGraphemes(str) {
  if (!str) return 0;
  if (!segmenter) {
    // Fallback if Intl.Segmenter is unavailable in old environments
    return Array.from(str).length;
  }
  let count = 0;
  const segments = segmenter.segment(str);
  for (const _ of segments) {
    count++;
  }
  return count;
}

/**
 * Evaluates whether a text string contains ONLY 1, 2, or 3 emoji graphemes (with optional whitespace).
 * If so, returns the grapheme count (1, 2, or 3) for enlarged rendering. Otherwise returns 0.
 *
 * @param {string} text
 * @returns {number} 0 if not emoji-only, or 1 | 2 | 3
 */
export function getEmojiOnlyCount(text) {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  if (!segmenter) {
    const chars = Array.from(trimmed);
    if (chars.length <= 3 && chars.every((c) => EMOJI_REGEX.test(c))) {
      return chars.length;
    }
    return 0;
  }

  const segments = Array.from(segmenter.segment(trimmed));
  // Filter out any purely whitespace segments
  const meaningfulSegments = segments.filter((s) => s.segment.trim().length > 0);

  if (meaningfulSegments.length >= 1 && meaningfulSegments.length <= 3) {
    const allEmoji = meaningfulSegments.every((s) => EMOJI_REGEX.test(s.segment));
    if (allEmoji) {
      return meaningfulSegments.length;
    }
  }

  return 0;
}
