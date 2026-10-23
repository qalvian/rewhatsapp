// @ts-check

/**
 * 32-bit FNV-1a hash function.
 * Fast, deterministic, and uniform distribution for string seeds.
 *
 * @param {string} str
 * @returns {number} 32-bit unsigned integer
 */
export function hashString(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Curated gradient palettes for participant avatars.
 * Modern, vibrant, and accessible combinations.
 * @type {Array<[string, string]>}
 */
export const AVATAR_GRADIENTS = [
  ['#ec4899', '#f43f5e'], // Rose / Pink
  ['#8b5cf6', '#6366f1'], // Violet / Indigo
  ['#3b82f6', '#06b6d4'], // Blue / Cyan
  ['#10b981', '#059669'], // Emerald / Teal
  ['#f59e0b', '#d97706'], // Amber / Orange
  ['#14b8a6', '#0d9488'], // Teal
  ['#a855f7', '#7c3aed'], // Purple
  ['#0ea5e9', '#0284c7'], // Sky Blue
  ['#f97316', '#ea580c'], // Orange / Red
  ['#64748b', '#475569'], // Slate
];

/**
 * WhatsApp group sender name colors (designed to contrast against both light and dark bubbles).
 */
export const SENDER_COLORS = [
  '#e542a3', // Pink
  '#02a698', // Teal
  '#8a5df7', // Purple
  '#257ee6', // Blue
  '#df7318', // Orange
  '#06a358', // Green
  '#b33396', // Magenta
  '#c79200', // Gold
  '#5967f6', // Indigo
  '#00a7b5', // Cyan
];

/**
 * Deterministically picks an avatar gradient for a participant based on their name.
 *
 * @param {string} name
 * @returns {[string, string]} [startColor, endColor]
 */
export function getAvatarGradient(name) {
  const hash = hashString(name || 'Unknown');
  const index = hash % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index] || AVATAR_GRADIENTS[0];
}

/**
 * Deterministically picks a sender name color for group chats.
 *
 * @param {string} name
 * @param {number} [senderIndex]
 * @returns {string} Hex color
 */
export function getSenderColor(name, senderIndex) {
  if (typeof senderIndex === 'number' && senderIndex >= 0) {
    return SENDER_COLORS[senderIndex % SENDER_COLORS.length];
  }
  const hash = hashString(name || 'Unknown');
  return SENDER_COLORS[hash % SENDER_COLORS.length];
}

/**
 * Computes 1-2 letter uppercase initials from a participant's display name.
 * Handles phone numbers, non-Latin text, and single names gracefully.
 *
 * @param {string} displayName
 * @returns {string}
 */
export function getInitials(displayName) {
  if (!displayName) return '?';
  const clean = displayName.replace(/^~+\s*/, '').trim();

  // If phone number
  if (/^\+?\d/.test(clean)) {
    return clean.slice(-2);
  }

  const parts = clean.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length === 1) {
    // Single word name -> first 2 letters
    return clean.slice(0, 2).toUpperCase();
  }

  // Multiple words -> first letter of first word and last word
  const first = parts[0]?.charAt(0) || '';
  const last = parts[parts.length - 1]?.charAt(0) || '';
  return (first + last).toUpperCase();
}
