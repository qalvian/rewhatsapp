// @ts-check

import { el } from '../../util/dom.js';
import { formatDateChip, formatMessageTime } from '../../util/format.js';

/**
 * Creates the dual-purpose progress bar and emotion sparkline scrubber.
 *
 * @param {Object} params
 * @param {import('../../core/timeline.js').Timeline} params.timeline
 * @param {import('../../core/analytics/sentiment.js').ScrubberBucket[]} params.buckets
 * @param {(progress: number) => void} params.onSeek
 * @returns {{
 *   element: HTMLElement;
 *   setProgress: (progress: number) => void;
 *   setBuckets: (buckets: import('../../core/analytics/sentiment.js').ScrubberBucket[]) => void;
 * }}
 */
export function createScrubber({ timeline, buckets, onSeek }) {
  const container = el('div', {
    className: 'wa-scrubber-container',
    aria: {
      role: 'slider',
      label: 'Playback timeline scrubber',
      valuenow: '0',
      valuemin: '0',
      valuemax: '100',
    },
  });

  // SVG Sparkline Canvas layer
  const sparklineContainer = el('div', { className: 'wa-scrubber-sparkline' });
  renderSparkline(sparklineContainer, buckets);

  // Active progress fill
  const progressFill = el('div', {
    className: 'wa-scrubber-fill',
    style: { width: '0%' },
  });

  // Current playhead scrubber thumb
  const playhead = el('div', {
    className: 'wa-scrubber-thumb',
    style: { left: '0%' },
  });

  // Hover date tooltip
  const tooltip = el('div', {
    className: 'wa-scrubber-tooltip',
    style: { display: 'none' },
  });

  container.appendChild(sparklineContainer);
  container.appendChild(progressFill);
  container.appendChild(playhead);
  container.appendChild(tooltip);

  let isDragging = false;

  /**
   * @param {MouseEvent | TouchEvent} e
   * @returns {number} Progress from 0.0 to 1.0
   */
  function calculateProgressFromEvent(e) {
    const rect = container.getBoundingClientRect();
    const clientX =
      'touches' in e && e.touches[0] ? e.touches[0].clientX : /** @type {MouseEvent} */ (e).clientX;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return rect.width > 0 ? offsetX / rect.width : 0;
  }

  /**
   * Updates tooltip content and horizontal position.
   * @param {number} progress
   */
  function updateTooltip(progress) {
    const { timeMs, index } = timeline.seekByProgress(progress);
    const msg = timeline.messages[index];
    const ts = msg ? msg.timestamp : timeMs;

    tooltip.textContent = `${formatDateChip(ts)} · ${formatMessageTime(ts)}`;
    tooltip.style.left = `${progress * 100}%`;
    tooltip.style.display = 'block';
  }

  // Mouse & Touch events
  container.addEventListener('mouseenter', () => {
    container.classList.add('wa-scrubber-active');
  });

  container.addEventListener('mouseleave', () => {
    if (!isDragging) {
      container.classList.remove('wa-scrubber-active');
      tooltip.style.display = 'none';
    }
  });

  container.addEventListener('mousemove', (e) => {
    const p = calculateProgressFromEvent(e);
    updateTooltip(p);
    if (isDragging) {
      onSeek(p);
    }
  });

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    container.classList.add('wa-scrubber-active');
    const p = calculateProgressFromEvent(e);
    updateTooltip(p);
    onSeek(p);

    const onMouseUp = () => {
      isDragging = false;
      container.classList.remove('wa-scrubber-active');
      tooltip.style.display = 'none';
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };

    /** @param {MouseEvent} moveEvent */
    const onMouseMove = (moveEvent) => {
      if (isDragging) {
        const moveP = calculateProgressFromEvent(moveEvent);
        updateTooltip(moveP);
        onSeek(moveP);
      }
    };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
  });

  // Touch support for mobile
  container.addEventListener(
    'touchstart',
    (e) => {
      isDragging = true;
      container.classList.add('wa-scrubber-active');
      const p = calculateProgressFromEvent(e);
      updateTooltip(p);
      onSeek(p);
    },
    { passive: true },
  );

  container.addEventListener(
    'touchmove',
    (e) => {
      if (isDragging) {
        const p = calculateProgressFromEvent(e);
        updateTooltip(p);
        onSeek(p);
      }
    },
    { passive: true },
  );

  container.addEventListener('touchend', () => {
    isDragging = false;
    container.classList.remove('wa-scrubber-active');
    tooltip.style.display = 'none';
  });

  return {
    element: container,
    setProgress: (progress) => {
      const pct = `${(progress * 100).toFixed(2)}%`;
      progressFill.style.width = pct;
      playhead.style.left = pct;
      container.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    },
    setBuckets: (newBuckets) => {
      renderSparkline(sparklineContainer, newBuckets);
    },
  };
}

/**
 * Renders emotional sparkline bars inside container.
 * @param {HTMLElement} container
 * @param {import('../../core/analytics/sentiment.js').ScrubberBucket[]} buckets
 */
function renderSparkline(container, buckets) {
  container.textContent = '';
  if (!buckets || buckets.length === 0) return;

  for (const b of buckets) {
    // Determine bar color based on sentiment valence
    let color = 'rgba(148, 163, 184, 0.4)'; // Neutral
    if (b.avgSentiment > 0.15) {
      color = b.avgSentiment > 0.4 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(245, 158, 11, 0.7)';
    } else if (b.avgSentiment < -0.15) {
      color = 'rgba(244, 63, 94, 0.75)';
    }

    const heightPct = Math.max(15, Math.round(b.density * 100));

    const bar = el('div', {
      className: 'wa-sparkline-bar',
      style: {
        height: `${heightPct}%`,
        backgroundColor: color,
      },
    });

    container.appendChild(bar);
  }
}
