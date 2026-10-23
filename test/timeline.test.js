import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeGapDelay, isTimeSkip, Timeline } from '../src/core/timeline.js';

test('computeGapDelay: smart mode logarithmic compression', () => {
  // Gaps under 1s: delay should stay near floor (750ms)
  const smallGap = computeGapDelay(500, { mode: 'smart', speed: 1 });
  assert.ok(smallGap >= 750 && smallGap <= 1200);

  // Large gaps (e.g. 3 days): compressed and capped at capMs (3200ms)
  const hugeGap = computeGapDelay(3 * 24 * 3600 * 1000, { mode: 'smart', speed: 1 });
  assert.equal(hugeGap, 3200);

  // Speed scaling: 2x speed halves the delay
  const at2x = computeGapDelay(3 * 24 * 3600 * 1000, { mode: 'smart', speed: 2 });
  assert.equal(at2x, 1600);
});

test('computeGapDelay: realtime and fixed modes', () => {
  const realtime = computeGapDelay(5000, { mode: 'realtime', speed: 1 });
  assert.equal(realtime, 5000);

  const fixed = computeGapDelay(500000, { mode: 'fixed', speed: 2, fixedCadenceMs: 800 });
  assert.equal(fixed, 400);
});

test('isTimeSkip: triggers for gaps >= 3 hours', () => {
  assert.equal(isTimeSkip(2 * 3600 * 1000), false);
  assert.equal(isTimeSkip(3 * 3600 * 1000), true);
  assert.equal(isTimeSkip(24 * 3600 * 1000), true);
});

test('Timeline: binary search seek and cumulative playback duration', () => {
  /** @type {import('../src/core/parser/index.js').ChatMessage[]} */
  const mockMessages = [
    {
      id: 0,
      rawTimestamp: '10:00',
      timestamp: 1000000,
      senderRaw: 'A',
      senderDisplayName: 'A',
      senderIndex: 0,
      isOutgoing: false,
      type: 'text',
      text: 'First',
      isContinuation: false,
      emojiOnlyCount: 0,
      sentimentValence: 0,
      mediaInfo: undefined,
    },
    {
      id: 1,
      rawTimestamp: '10:05',
      timestamp: 1000000 + 300000,
      senderRaw: 'B',
      senderDisplayName: 'B',
      senderIndex: 1,
      isOutgoing: true,
      type: 'text',
      text: 'Second',
      isContinuation: false,
      emojiOnlyCount: 0,
      sentimentValence: 0,
      mediaInfo: undefined,
    },
    {
      id: 2,
      rawTimestamp: '10:10',
      timestamp: 1000000 + 600000,
      senderRaw: 'A',
      senderDisplayName: 'A',
      senderIndex: 0,
      isOutgoing: false,
      type: 'text',
      text: 'Third',
      isContinuation: false,
      emojiOnlyCount: 0,
      sentimentValence: 0,
      mediaInfo: undefined,
    },
  ];

  const timeline = new Timeline(mockMessages, { mode: 'smart' });
  assert.equal(timeline.timestamps.length, 3);
  assert.equal(timeline.cumulativeDuration.length, 3);
  assert.equal(timeline.cumulativeDuration[0], 0);

  const dur1 = timeline.cumulativeDuration[1] || 0;
  const dur2 = timeline.cumulativeDuration[2] || 0;
  assert.ok(dur1 > 0);
  assert.ok(dur2 > dur1);

  // Binary search test
  assert.equal(timeline.findIndexAtTime(0), 0);
  assert.equal(timeline.findIndexAtTime(dur1 - 1), 0);
  assert.equal(timeline.findIndexAtTime(dur1), 1);
  assert.equal(timeline.findIndexAtTime(dur2), 2);
  assert.equal(timeline.findIndexAtTime(99999999), 2);

  // Progress conversion
  assert.equal(timeline.getProgress(0), 0);
  assert.equal(timeline.getProgress(timeline.totalDuration), 1);
});
