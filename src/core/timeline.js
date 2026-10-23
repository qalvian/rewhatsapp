// @ts-check

/**
 * @typedef {'smart' | 'realtime' | 'fixed'} GapMode
 */

/**
 * @typedef {Object} GapPolicyOptions
 * @property {GapMode} [mode='smart']
 * @property {number} [speed=1]
 * @property {number} [floorMs=750] Minimum conversational delay
 * @property {number} [capMs=3200] Maximum compressed delay for long gaps
 * @property {number} [k=450] Logarithmic compression factor
 * @property {number} [fixedCadenceMs=1000] Delay for fixed cadence mode
 */

/**
 * Computes the wall-clock delay between two consecutive messages according to the chosen gap policy.
 *
 * @param {number} gapMs Physical time gap between messages in milliseconds
 * @param {GapPolicyOptions} [options]
 * @returns {number} Delay in milliseconds (adjusted for playback speed)
 */
export function computeGapDelay(gapMs, options = {}) {
  const mode = options.mode || 'smart';
  const speed = options.speed || 1;
  const floorMs = options.floorMs ?? 750;
  const capMs = options.capMs ?? 3200;
  const k = options.k ?? 450;
  const fixedCadenceMs = options.fixedCadenceMs ?? 1000;

  if (gapMs < 0) gapMs = 0;

  if (mode === 'realtime') {
    // In real-time mode, delay equals physical gap clamped to minimum 50ms
    return Math.max(50, gapMs) / speed;
  }

  if (mode === 'fixed') {
    return fixedCadenceMs / speed;
  }

  // Default: Smart dead-air compression
  // delayMs = min(cap, floor + k * ln(1 + gap_seconds))
  const gapSeconds = gapMs / 1000;
  const compressed = Math.min(capMs, floorMs + k * Math.log(1 + gapSeconds));
  return Math.max(50, compressed) / speed;
}

/**
 * Determines whether a physical time gap qualifies for an animated Time-Skip chip.
 * Threshold: 3 hours (10,800,000 ms).
 *
 * @param {number} gapMs
 * @returns {boolean}
 */
export function isTimeSkip(gapMs) {
  return gapMs >= 3 * 3600 * 1000;
}

export const BASE_TYPING_DELAY_MS = 400;
export const MS_PER_CHAR = 30;

/**
 * Computes dynamic typing delay based on exact character length:
 * Base delay (400ms) + (Character Count * 30ms).
 * E.g., a short "Hi" (2 chars) takes 460ms (~0.5s), a long paragraph (150 chars) takes 4900ms (~5.0s).
 *
 * @param {number} charCount
 * @returns {number} Delay in milliseconds
 */
export function computeMessageDelay(charCount = 0) {
  const safeChars = Math.max(0, charCount);
  return BASE_TYPING_DELAY_MS + safeChars * MS_PER_CHAR;
}

/**
 * Timeline data structure holding message records and typed arrays
 * for O(log N) binary search seeks and cumulative playback timing.
 */
export class Timeline {
  /**
   * @param {import('./parser/index.js').ChatMessage[]} messages
   * @param {GapPolicyOptions} [gapOptions]
   */
  constructor(messages, gapOptions = {}) {
    this.messages = messages;
    this.gapOptions = gapOptions;
    this.totalDuration = 0;

    const n = messages.length;
    this.timestamps = new Float64Array(n);
    this.cumulativeDuration = new Float64Array(n);
    this.senderIndices = new Uint32Array(n);

    this._buildTypedArrays();
  }

  /**
   * Recomputes cumulative playback time array.
   * @param {GapPolicyOptions} [gapOptions]
   */
  recomputeGapPolicy(gapOptions) {
    if (gapOptions) {
      this.gapOptions = { ...this.gapOptions, ...gapOptions };
    }
    this._buildTypedArrays();
  }

  _buildTypedArrays() {
    const n = this.messages.length;
    let accumulatedTime = 0;

    for (let i = 0; i < n; i++) {
      const msg = this.messages[i];
      if (!msg) continue;

      this.timestamps[i] = msg.timestamp;
      this.senderIndices[i] = msg.senderIndex >= 0 ? msg.senderIndex : 0;

      if (i > 0) {
        const charCount = (msg.text || '').length;
        // Dynamic typing speed: delay based on exact message character length
        const delay = computeMessageDelay(charCount);
        accumulatedTime += delay;
      }

      this.cumulativeDuration[i] = accumulatedTime;
    }

    this.totalDuration = accumulatedTime;
  }

  /**
   * Binary search for message index at cumulative virtual time t.
   * Returns the largest index i such that cumulativeDuration[i] <= virtualTimeMs.
   *
   * @param {number} virtualTimeMs
   * @returns {number}
   */
  findIndexAtTime(virtualTimeMs) {
    const n = this.cumulativeDuration.length;
    if (n === 0) return 0;
    if (virtualTimeMs <= 0) return 0;
    const lastDuration = this.cumulativeDuration[n - 1] ?? 0;
    if (virtualTimeMs >= lastDuration) return n - 1;

    let low = 0;
    let high = n - 1;
    let best = 0;

    while (low <= high) {
      const mid = (low + high) >>> 1;
      const midDuration = this.cumulativeDuration[mid] ?? 0;
      if (midDuration <= virtualTimeMs) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return best;
  }

  /**
   * Returns cumulative virtual time at a specific message index.
   * @param {number} index
   * @returns {number}
   */
  getTimeAtIndex(index) {
    if (index <= 0) return 0;
    if (index >= this.cumulativeDuration.length) return this.totalDuration;
    return this.cumulativeDuration[index] ?? 0;
  }

  /**
   * Converts virtual time into normalized progress (0.0 to 1.0).
   * @param {number} virtualTimeMs
   * @returns {number}
   */
  getProgress(virtualTimeMs) {
    if (this.totalDuration <= 0) return 0;
    return Math.max(0, Math.min(1, virtualTimeMs / this.totalDuration));
  }

  /**
   * Converts normalized progress (0.0 to 1.0) into virtual time and nearest message index.
   * @param {number} progress 0.0 to 1.0
   * @returns {{ timeMs: number; index: number }}
   */
  seekByProgress(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    const timeMs = clamped * this.totalDuration;
    const index = this.findIndexAtTime(timeMs);
    return { timeMs, index };
  }
}
