// @ts-check

const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

/**
 * Formats a UTC epoch millisecond timestamp into a clean WhatsApp time string (e.g. "10:45 AM" or "14:30").
 *
 * @param {number} timestampUtc
 * @param {boolean} [is12Hour=true]
 * @returns {string}
 */
export function formatMessageTime(timestampUtc, is12Hour = true) {
  const d = new Date(timestampUtc);
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');

  if (is12Hour) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Formats a UTC timestamp into a WhatsApp date chip string (e.g. "15 OCTOBER 2023").
 *
 * @param {number} timestampUtc
 * @returns {string}
 */
export function formatDateChip(timestampUtc) {
  const d = new Date(timestampUtc);
  const day = d.getUTCDate();
  const month = MONTH_NAMES[d.getUTCMonth()];
  const year = d.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Checks if two UTC timestamps are on different calendar days.
 *
 * @param {number} tsA
 * @param {number} tsB
 * @returns {boolean}
 */
export function isDifferentDay(tsA, tsB) {
  const a = new Date(tsA);
  const b = new Date(tsB);
  return (
    a.getUTCDate() !== b.getUTCDate() ||
    a.getUTCMonth() !== b.getUTCMonth() ||
    a.getUTCFullYear() !== b.getUTCFullYear()
  );
}

/**
 * Formats a long silence gap into a descriptive Time-Skip chip string.
 * Examples: "🌙 3 days later", "🌙 14 hours later", "🌙 2 weeks later".
 *
 * @param {number} gapMs
 * @returns {string}
 */
export function formatTimeSkipText(gapMs) {
  const hours = Math.round(gapMs / (3600 * 1000));
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} later`;
  }

  const days = Math.round(hours / 24);
  if (days < 14) {
    return `${days} day${days === 1 ? '' : 's'} later`;
  }

  const weeks = Math.round(days / 7);
  if (weeks < 8) {
    return `${weeks} week${weeks === 1 ? '' : 's'} later`;
  }

  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'} later`;
}

/**
 * Formats duration in seconds into 'm:ss' (e.g. 42 -> '0:42', 95 -> '1:35').
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatAudioDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats byte size into human readable string (KB, MB).
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
