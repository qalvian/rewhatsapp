// @ts-check

import { computeChatStats } from '../core/analytics/stats.js';
import { computeScrubberBuckets } from '../core/analytics/sentiment.js';

/**
 * Web Worker for heavy analytics computations:
 * - 7x24 weekday-hour heatmap
 * - Median response times
 * - Emotion sparkline scrubber bucketing
 */

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === 'compute') {
    try {
      const { messages, participants, numBuckets = 100 } = payload;

      const stats = computeChatStats(messages, participants);
      const sentimentBuckets = computeScrubberBuckets(messages, numBuckets);

      self.postMessage({
        type: 'complete',
        payload: {
          stats,
          sentimentBuckets,
        },
      });
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unknown analytics error',
      });
    }
  }
};
