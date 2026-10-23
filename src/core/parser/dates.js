// @ts-check

/**
 * @typedef {'DMY' | 'MDY' | 'YMD'} DateOrder
 */

/**
 * @typedef {Object} DateOrderInferenceResult
 * @property {DateOrder} order
 * @property {number} confidence Between 0.0 and 1.0 (1.0 = mathematically certain)
 * @property {string} reason
 */

/**
 * Splits a date string into numeric parts (supports '/', '.', '-').
 * @param {string} dateStr
 * @returns {number[]}
 */
export function splitDateParts(dateStr) {
  return dateStr
    .split(/[/.-]/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

/**
 * Normalizes clock string into hours (0-23), minutes (0-59), seconds (0-59).
 * Handles 12-hour AM/PM variations (e.g., 'a.m.', 'p. m.', 'AM', 'PM') and 24-hour clocks.
 *
 * @param {string} timeStr
 * @returns {{ hours: number; minutes: number; seconds: number }}
 */
export function parseClock(timeStr) {
  const normalized = timeStr.replace(/[\s\u00A0\u202F]+/g, ' ').trim();
  const isPm = /[pP]\.?\s*[mM]?\.?/.test(normalized);
  const isAm = /[aA]\.?\s*[mM]?\.?/.test(normalized);

  // Strip AM/PM suffixes
  const numericPart = normalized.replace(/[a-zA-Z.\s]/g, '').trim();
  const parts = numericPart.split(':').map((s) => parseInt(s, 10));

  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  if (isPm) {
    if (hours < 12) hours += 12;
  } else if (isAm) {
    if (hours === 12) hours = 0;
  }

  return { hours, minutes, seconds };
}

/**
 * Infers date order ('DMY' vs 'MDY' vs 'YMD') across all extracted date strings.
 * Follows strict constraint-solving rules:
 * 1. 4-digit first field => YMD (Certainty 1.0).
 * 2. Any first field > 12 => DMY (Certainty 1.0).
 * 3. Any second field > 12 => MDY (Certainty 1.0).
 * 4. Chronological monotonicity evaluation if ambiguous (fewer backwards time jumps).
 * 5. Weak prior fallback (12-hour AM/PM leans MDY; 24-hour leans DMY).
 *
 * @param {string[]} dateStrings All date strings in file order
 * @param {boolean} [is12Hour=false] Whether the detected grammar uses 12-hour clock
 * @returns {DateOrderInferenceResult}
 */
export function inferDateOrder(dateStrings, is12Hour = false) {
  if (dateStrings.length === 0) {
    return {
      order: is12Hour ? 'MDY' : 'DMY',
      confidence: 0.5,
      reason: 'No date strings found, used default prior',
    };
  }

  // Check for 4-digit year first (e.g. 2024-01-15 or 2024/01/15)
  for (const str of dateStrings) {
    const parts = splitDateParts(str);
    if (parts.length >= 3 && parts[0] > 1000) {
      return {
        order: 'YMD',
        confidence: 1.0,
        reason: 'Four-digit year detected in the first field',
      };
    }
  }

  // Check for boundary violations (> 12)
  let foundFirstFieldOver12 = false;
  let foundSecondFieldOver12 = false;

  for (const str of dateStrings) {
    const parts = splitDateParts(str);
    if (parts.length >= 2) {
      if (parts[0] > 12) foundFirstFieldOver12 = true;
      if (parts[1] > 12) foundSecondFieldOver12 = true;
    }
  }

  if (foundFirstFieldOver12 && !foundSecondFieldOver12) {
    return {
      order: 'DMY',
      confidence: 1.0,
      reason: 'Day numbers exceeding 12 observed in the first field',
    };
  }

  if (foundSecondFieldOver12 && !foundFirstFieldOver12) {
    return {
      order: 'MDY',
      confidence: 1.0,
      reason: 'Day numbers exceeding 12 observed in the second field',
    };
  }

  // Ambiguity resolution: Evaluate both hypotheses against chronological monotonicity
  let dmyInversions = 0;
  let mdyInversions = 0;
  let prevDmy = -Infinity;
  let prevMdy = -Infinity;

  // Sample up to 1000 dates for fast constraint evaluation
  const step = Math.max(1, Math.floor(dateStrings.length / 1000));
  for (let i = 0; i < dateStrings.length; i += step) {
    const str = dateStrings[i];
    const parts = splitDateParts(str);
    if (parts.length < 3) continue;

    const rawY = parts[2] < 100 ? 2000 + parts[2] : parts[2];

    // Hypothesis DMY: parts[0] = day, parts[1] = month
    const dmyTs = Date.UTC(rawY, parts[1] - 1, parts[0]);
    if (dmyTs < prevDmy) dmyInversions++;
    prevDmy = dmyTs;

    // Hypothesis MDY: parts[0] = month, parts[1] = day
    const mdyTs = Date.UTC(rawY, parts[0] - 1, parts[1]);
    if (mdyTs < prevMdy) mdyInversions++;
    prevMdy = mdyTs;
  }

  if (dmyInversions < mdyInversions) {
    return {
      order: 'DMY',
      confidence: 0.85,
      reason: `DMY yielded fewer backward time jumps (${dmyInversions} vs ${mdyInversions})`,
    };
  } else if (mdyInversions < dmyInversions) {
    return {
      order: 'MDY',
      confidence: 0.85,
      reason: `MDY yielded fewer backward time jumps (${mdyInversions} vs ${dmyInversions})`,
    };
  }

  // Exact tie: use weak cultural prior
  return {
    order: is12Hour ? 'MDY' : 'DMY',
    confidence: 0.6,
    reason: is12Hour
      ? 'Ambiguous dates with 12h clock; defaulted to US MDY prior'
      : 'Ambiguous dates with 24h clock; defaulted to international DMY prior',
  };
}

/**
 * Constructs UTC timestamp from parsed date string and time string.
 * Uses 'floating UTC' so exports have no phantom daylight saving time jumps.
 *
 * @param {string} dateStr
 * @param {string} timeStr
 * @param {DateOrder} dateOrder
 * @returns {number} UTC epoch milliseconds
 */
export function parseDateTimeToUtc(dateStr, timeStr, dateOrder) {
  const parts = splitDateParts(dateStr);
  const { hours, minutes, seconds } = parseClock(timeStr);

  let year = 2000;
  let month = 1;
  let day = 1;

  if (dateOrder === 'YMD') {
    year = parts[0] < 100 ? 2000 + parts[0] : parts[0];
    month = parts[1] || 1;
    day = parts[2] || 1;
  } else if (dateOrder === 'MDY') {
    month = parts[0] || 1;
    day = parts[1] || 1;
    year = (parts[2] || 0) < 100 ? 2000 + (parts[2] || 0) : parts[2];
  } else {
    // DMY (default)
    day = parts[0] || 1;
    month = parts[1] || 1;
    year = (parts[2] || 0) < 100 ? 2000 + (parts[2] || 0) : parts[2];
  }

  // Bounds checks
  const safeMonth = Math.max(0, Math.min(11, month - 1));
  const safeDay = Math.max(1, Math.min(31, day));

  return Date.UTC(year, safeMonth, safeDay, hours, minutes, seconds);
}
