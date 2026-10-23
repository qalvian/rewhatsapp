// @ts-check

/**
 * @typedef {Object} ParticipantStat
 * @property {string} displayName
 * @property {number} messageCount
 * @property {number} wordCount
 * @property {number} charCount
 * @property {number} messageRatio
 * @property {number} wordRatio
 * @property {number} charRatio
 * @property {number} conversationsStarted
 * @property {number} conversationsEnded
 * @property {number} medianResponseTimeMinutes
 * @property {Array<{ emoji: string; count: number }>} topEmojis
 */

/**
 * @typedef {Object} ChatInsights
 * @property {number} totalMessages
 * @property {number} totalWords
 * @property {number} totalChars
 * @property {number} totalDaysSpanned
 * @property {number} longestStreakDays
 * @property {{ durationMs: number; fromDate: number; toDate: number; fromSender: string; toSender: string }} longestSilence
 * @property {number[][]} heatmap 7 (weekdays: 0=Sun..6=Sat) x 24 (hours: 0..23)
 * @property {Record<string, number>} calendarVolume Map of 'YYYY-MM-DD' -> count
 * @property {ParticipantStat[]} participantStats
 * @property {Array<{ emoji: string; count: number }>} overallTopEmojis
 * @property {{ daysSpanned: number; totalMessages: number; peakHour: number; topEmoji: string; longestStreakDays: number }} epilogue
 */

const EMOJI_EXTRACTOR = /\p{Extended_Pictographic}/gu;

/**
 * Helper to compute median of an array of numbers.
 * @param {number[]} numbers
 * @returns {number}
 */
function computeMedian(numbers) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Analyzes full chat history and generates comprehensive statistical and emotional insights.
 * Pure computation, zero DOM, designed to run seamlessly inside a Web Worker.
 *
 * @param {import('../parser/index.js').ChatMessage[]} messages
 * @param {import('../parser/participants.js').Participant[]} participants
 * @returns {ChatInsights}
 */
export function computeChatStats(messages, participants) {
  const totalMessages = messages.length;
  if (totalMessages === 0) {
    return {
      totalMessages: 0,
      totalWords: 0,
      totalChars: 0,
      totalDaysSpanned: 0,
      longestStreakDays: 0,
      longestSilence: { durationMs: 0, fromDate: 0, toDate: 0, fromSender: '', toSender: '' },
      heatmap: Array.from({ length: 7 }, () => new Array(24).fill(0)),
      calendarVolume: {},
      participantStats: [],
      overallTopEmojis: [],
      epilogue: {
        daysSpanned: 0,
        totalMessages: 0,
        peakHour: 12,
        topEmoji: '✨',
        longestStreakDays: 0,
      },
    };
  }

  // 1. Initialize 7x24 heatmap and participant buckets
  /** @type {number[][]} */
  const heatmap = Array.from({ length: 7 }, () => new Array(24).fill(0));
  /** @type {Record<string, number>} */
  const calendarVolume = {};
  /** @type {Map<string, { wordCount: number; charCount: number; messageCount: number; responseTimesMs: number[]; started: number; ended: number; emojiCounts: Map<string, number> }>} */
  const pBuckets = new Map();
  /** @type {Map<string, number>} */
  const overallEmojiCounts = new Map();

  for (const p of participants) {
    pBuckets.set(p.raw, {
      wordCount: 0,
      charCount: 0,
      messageCount: 0,
      responseTimesMs: [],
      started: 0,
      ended: 0,
      emojiCounts: new Map(),
    });
  }

  let totalWords = 0;
  let totalChars = 0;
  let maxSilenceMs = 0;
  let silenceFromDate = messages[0].timestamp;
  let silenceToDate = messages[0].timestamp;
  let silenceFromSender = '';
  let silenceToSender = '';

  const CONVERSATION_GAP_MS = 4 * 3600 * 1000; // 4 hours defines conversation boundary
  let lastSenderRaw = '';

  // 2. Single-pass iteration across all messages
  for (let i = 0; i < totalMessages; i++) {
    const msg = messages[i];
    if (msg.type === 'system') continue;

    const date = new Date(msg.timestamp);
    const dayOfWeek = date.getUTCDay(); // 0 = Sun .. 6 = Sat
    const hour = date.getUTCHours();
    heatmap[dayOfWeek][hour]++;

    const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    calendarVolume[dateKey] = (calendarVolume[dateKey] || 0) + 1;

    // Word and character count
    const chars = (msg.text || '').length;
    totalChars += chars;
    const words = msg.text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    totalWords += words;

    // Emojis
    const emojis = msg.text.match(EMOJI_EXTRACTOR) || [];
    for (const em of emojis) {
      overallEmojiCounts.set(em, (overallEmojiCounts.get(em) || 0) + 1);
    }

    const bucket = pBuckets.get(msg.senderRaw);
    if (bucket) {
      bucket.messageCount++;
      bucket.wordCount += words;
      bucket.charCount += chars;
      for (const em of emojis) {
        bucket.emojiCounts.set(em, (bucket.emojiCounts.get(em) || 0) + 1);
      }
    }

    // Response times and conversation boundaries
    if (i > 0) {
      const prev = messages[i - 1];
      const gap = msg.timestamp - prev.timestamp;

      if (gap > maxSilenceMs) {
        maxSilenceMs = gap;
        silenceFromDate = prev.timestamp;
        silenceToDate = msg.timestamp;
        silenceFromSender = prev.senderDisplayName;
        silenceToSender = msg.senderDisplayName;
      }

      if (gap >= CONVERSATION_GAP_MS) {
        // Previous conversation ended
        if (lastSenderRaw && pBuckets.has(lastSenderRaw)) {
          const prevBucket = pBuckets.get(lastSenderRaw);
          if (prevBucket) prevBucket.ended++;
        }
        // New conversation started
        if (bucket) {
          bucket.started++;
        }
      } else if (prev.senderRaw && prev.senderRaw !== msg.senderRaw && bucket) {
        // Valid response within same conversation
        bucket.responseTimesMs.push(gap);
      }
    } else {
      // First message started first conversation
      if (bucket) bucket.started++;
    }

    lastSenderRaw = msg.senderRaw;
  }

  // End of chat marks last conversation end
  if (lastSenderRaw && pBuckets.has(lastSenderRaw)) {
    const lastBucket = pBuckets.get(lastSenderRaw);
    if (lastBucket) lastBucket.ended++;
  }

  // 3. Compute calendar streak
  const uniqueDates = Object.keys(calendarVolume).sort();
  let longestStreakDays = 0;
  let currentStreak = 0;
  let prevDateMs = 0;

  for (const dateStr of uniqueDates) {
    const curDateMs = Date.parse(dateStr + 'T00:00:00Z');
    if (prevDateMs === 0 || curDateMs - prevDateMs === 86400000) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > longestStreakDays) {
      longestStreakDays = currentStreak;
    }
    prevDateMs = curDateMs;
  }

  // 4. Format participant statistics
  /** @type {ParticipantStat[]} */
  const participantStats = participants.map((p) => {
    const b = pBuckets.get(p.raw) || {
      wordCount: 0,
      charCount: 0,
      messageCount: 0,
      responseTimesMs: [],
      started: 0,
      ended: 0,
      emojiCounts: new Map(),
    };

    const sortedEmojis = Array.from(b.emojiCounts.entries())
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const medianMs = computeMedian(b.responseTimesMs);

    return {
      displayName: p.displayName,
      messageCount: b.messageCount,
      wordCount: b.wordCount,
      charCount: b.charCount,
      messageRatio: totalMessages > 0 ? b.messageCount / totalMessages : 0,
      wordRatio: totalWords > 0 ? b.wordCount / totalWords : 0,
      charRatio: totalChars > 0 ? b.charCount / totalChars : 0,
      conversationsStarted: b.started,
      conversationsEnded: b.ended,
      medianResponseTimeMinutes: Math.round((medianMs / 60000) * 10) / 10,
      topEmojis: sortedEmojis,
    };
  });

  // Overall top emojis
  const overallTopEmojis = Array.from(overallEmojiCounts.entries())
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Peak hour
  let peakHour = 12;
  let peakVolume = -1;
  for (let h = 0; h < 24; h++) {
    let hourSum = 0;
    for (let d = 0; d < 7; d++) {
      hourSum += heatmap[d][h];
    }
    if (hourSum > peakVolume) {
      peakVolume = hourSum;
      peakHour = h;
    }
  }

  const firstTs = messages[0].timestamp;
  const lastTs = messages[totalMessages - 1].timestamp;
  const totalDaysSpanned = Math.max(1, Math.ceil((lastTs - firstTs) / (24 * 3600 * 1000)));

  return {
    totalMessages,
    totalWords,
    totalChars,
    totalDaysSpanned,
    longestStreakDays,
    longestSilence: {
      durationMs: maxSilenceMs,
      fromDate: silenceFromDate,
      toDate: silenceToDate,
      fromSender: silenceFromSender,
      toSender: silenceToSender,
    },
    heatmap,
    calendarVolume,
    participantStats,
    overallTopEmojis,
    epilogue: {
      daysSpanned: totalDaysSpanned,
      totalMessages,
      peakHour,
      topEmoji: overallTopEmojis[0]?.emoji || '✨',
      longestStreakDays,
    },
  };
}
