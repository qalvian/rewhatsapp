import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreMessageSentiment, computeScrubberBuckets } from '../src/core/analytics/sentiment.js';
import { computeChatStats } from '../src/core/analytics/stats.js';

test('scoreMessageSentiment: positive words and love emojis', () => {
  const score1 = scoreMessageSentiment('I love this so much! ❤️');
  assert.ok(score1 > 0.6, `Expected > 0.6, got ${score1}`);

  const score2 = scoreMessageSentiment('Haha that was hilarious 😂');
  assert.ok(score2 > 0.4, `Expected > 0.4, got ${score2}`);
});

test('scoreMessageSentiment: apology and negative words', () => {
  const score1 = scoreMessageSentiment('I am so sorry I hurt you 💔');
  assert.ok(score1 < -0.3, `Expected < -0.3, got ${score1}`);

  const score2 = scoreMessageSentiment('I am really angry and upset');
  assert.ok(score2 < -0.5, `Expected < -0.5, got ${score2}`);
});

test('computeScrubberBuckets: segments timeline into buckets', () => {
  const mockMessages = [
    { timestamp: 1000, text: 'Hello! Happy day! ❤️' },
    { timestamp: 2000, text: 'This is awful and sad 😭' },
    { timestamp: 3000, text: 'Good morning sunshine ✨' },
  ];

  const buckets = computeScrubberBuckets(mockMessages, 3);
  assert.equal(buckets.length, 3);
  assert.ok(buckets[0].avgSentiment > 0);
  assert.ok(buckets[1].avgSentiment < 0);
  assert.ok(buckets[2].avgSentiment > 0);
});

test('computeChatStats: generates 7x24 heatmap, response times, and epilogue', () => {
  /** @type {import('../src/core/parser/participants.js').Participant[]} */
  const participants = [
    { raw: 'Alice', displayName: 'Alice', index: 0, messageCount: 2 },
    { raw: 'Bob', displayName: 'Bob', index: 1, messageCount: 2 },
  ];

  /** @type {import('../src/core/parser/index.js').ChatMessage[]} */
  const messages = [
    {
      id: 0,
      rawTimestamp: '10:00',
      timestamp: Date.UTC(2024, 0, 15, 10, 0, 0), // Monday 10:00 UTC
      senderRaw: 'Alice',
      senderDisplayName: 'Alice',
      senderIndex: 0,
      isOutgoing: false,
      type: 'text',
      text: 'Good morning! ❤️',
      isContinuation: false,
      emojiOnlyCount: 0,
      sentimentValence: 0,
      mediaInfo: undefined,
    },
    {
      id: 1,
      rawTimestamp: '10:02',
      timestamp: Date.UTC(2024, 0, 15, 10, 2, 0), // 2 min response
      senderRaw: 'Bob',
      senderDisplayName: 'Bob',
      senderIndex: 1,
      isOutgoing: true,
      type: 'text',
      text: 'Morning Alice! How are you? ✨',
      isContinuation: false,
      emojiOnlyCount: 0,
      sentimentValence: 0,
      mediaInfo: undefined,
    },
    {
      id: 2,
      rawTimestamp: '10:05',
      timestamp: Date.UTC(2024, 0, 15, 10, 5, 0), // 3 min response
      senderRaw: 'Alice',
      senderDisplayName: 'Alice',
      senderIndex: 0,
      isOutgoing: false,
      type: 'text',
      text: 'Doing fantastic! ☕',
      isContinuation: false,
      emojiOnlyCount: 0,
      sentimentValence: 0,
      mediaInfo: undefined,
    },
  ];

  const stats = computeChatStats(messages, participants);

  assert.equal(stats.totalMessages, 3);
  assert.ok(stats.totalWords > 0);
  assert.equal(stats.participantStats.length, 2);

  // Bob's median response time was 2 minutes
  const bobStat = stats.participantStats.find((p) => p.displayName === 'Bob');
  assert.ok(bobStat);
  assert.equal(bobStat.medianResponseTimeMinutes, 2);

  // Heatmap check: Monday (day 1), 10:00 should have volume
  assert.ok(stats.heatmap[1][10] >= 3);

  // Epilogue checks
  assert.equal(stats.epilogue.peakHour, 10);
  assert.ok(stats.epilogue.daysSpanned >= 1);
});
