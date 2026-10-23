// @ts-check

/**
 * Deterministic pseudo-random jitter function seeded by message index.
 * Returns a value between -maxJitter and +maxJitter.
 *
 * @param {number} seed
 * @param {number} maxJitterMs
 * @returns {number}
 */
function deterministicJitter(seed, maxJitterMs) {
  // Knuth multiplicative hash
  const hash = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  const normalized = ((hash >>> 0) % 2000) / 1000 - 1; // -1.0 to +1.0
  return normalized * maxJitterMs;
}

/**
 * Spreads sub-minute offsets for consecutive messages that share the same minute
 * (common on Android exports which lack seconds).
 *
 * Guarantees:
 * 1. Monotonically strictly increasing timestamps within each minute run (preserving file order).
 * 2. Deterministic: identical inputs always yield identical timestamps.
 * 3. Never crosses the 59.9-second boundary into the next minute.
 * 4. Preserves messages that already have explicit second resolution (from iOS).
 *
 * @param {number[]} timestamps Array of UTC timestamps in milliseconds
 * @param {boolean} hasSeconds Whether the detected grammar includes seconds
 * @returns {Float64Array}
 */
export function spreadSubMinuteTimestamps(timestamps, hasSeconds) {
  const n = timestamps.length;
  const result = new Float64Array(n);

  if (n === 0) return result;
  if (hasSeconds) {
    // Already has seconds from header: copy directly
    for (let i = 0; i < n; i++) {
      result[i] = timestamps[i];
    }
    return result;
  }

  let runStart = 0;

  while (runStart < n) {
    const minuteBucket = Math.floor(timestamps[runStart] / 60000);
    let runEnd = runStart + 1;

    while (runEnd < n && Math.floor(timestamps[runEnd] / 60000) === minuteBucket) {
      runEnd++;
    }

    const runLength = runEnd - runStart;
    const baseMinuteMs = minuteBucket * 60000;

    if (runLength === 1) {
      result[runStart] = baseMinuteMs;
    } else {
      // Allocate up to 58 seconds across runLength items
      const intervalMs = 57000 / runLength;
      let prevOffset = 0;

      for (let i = 0; i < runLength; i++) {
        const idx = runStart + i;
        const targetOffset = i * intervalMs;
        const jitter = deterministicJitter(idx, Math.min(800, intervalMs * 0.25));
        let offset = Math.max(prevOffset + 100, targetOffset + jitter);

        // Cap at 58.5s
        if (offset > 58500) {
          offset = 58500;
        }

        result[idx] = baseMinuteMs + offset;
        prevOffset = offset;
      }
    }

    runStart = runEnd;
  }

  return result;
}
