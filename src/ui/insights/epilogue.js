// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';
import { initReveals } from '../motion/text-reveal.js';

/**
 * Creates the elevated Epilogue Memory Card when replay reaches the end of the conversation.
 * Conforms to Brief v3:
 * - Count-up statistics
 * - Mini heatmap visualizer
 * - "Replay" and "Close" actions
 *
 * @param {Object} params
 * @param {import('../../core/analytics/stats.js').ChatInsights} params.stats
 * @param {() => void} params.onReplay
 * @param {() => void} params.onViewInsights
 * @param {() => void} params.onExit
 * @returns {HTMLElement}
 */
export function createEpilogueCard({ stats, onReplay, onViewInsights, onExit }) {
  const overlay = el('div', {
    className: 'wa-epilogue-overlay',
    role: 'dialog',
    aria: {
      modal: 'true',
      labelledby: 'epilogue-title',
    },
  });

  const card = el('div', { className: 'wa-epilogue-card' });

  // Atmospheric icon
  const icon = el(
    'div',
    { className: 'wa-epilogue-icon' },
    createIcon('clock', { width: 36, height: 36 }),
  );

  const title = el('h2', {
    id: 'epilogue-title',
    className: 'wa-epilogue-title',
    text: 'And that brings us to the present.',
    data: {
      reveal: 'tilt',
      revealBy: 'words',
      revealTrigger: 'load',
    },
  });

  // Count-up stats row
  const statsRow = el('div', { className: 'wa-epilogue-stats-row' });

  const daysCol = createCountUpCard(stats.totalDaysSpanned, 'Days Spanned');
  const msgsCol = createCountUpCard(stats.totalMessages, 'Messages Relived');
  const wordsCol = createCountUpCard(stats.totalWords, 'Words Exchanged');

  statsRow.append(daysCol, msgsCol, wordsCol);

  // Mini 7x24 Heatmap preview
  const heatmapSection = el('div', { className: 'wa-epilogue-heatmap-section' });
  const heatmapLabel = el('span', {
    className: 'wa-epilogue-heatmap-title',
    text: 'Conversation Rhythm (7×24)',
  });
  const miniHeatmap = createMiniHeatmap(stats.heatmap);
  heatmapSection.append(heatmapLabel, miniHeatmap);

  // Emotional highlights list
  const highlights = el('div', { className: 'wa-epilogue-highlights' });

  highlights.appendChild(
    el(
      'div',
      { className: 'wa-epilogue-highlight-item' },
      el('span', { className: 'wa-highlight-icon' }, createIcon('zap', { width: 16, height: 16 })),
      el('span', {
        text: `Longest daily talking streak: ${stats.longestStreakDays} consecutive days.`,
      }),
    ),
  );

  if (stats.epilogue.topEmoji) {
    highlights.appendChild(
      el(
        'div',
        { className: 'wa-epilogue-highlight-item' },
        el('span', { className: 'wa-highlight-emoji', text: stats.epilogue.topEmoji }),
        el('span', { text: 'Most shared emotion throughout this memory.' }),
      ),
    );
  }

  highlights.appendChild(
    el(
      'div',
      { className: 'wa-epilogue-highlight-item' },
      el(
        'span',
        { className: 'wa-highlight-icon' },
        createIcon('clock', { width: 16, height: 16 }),
      ),
      el('span', { text: `Peak conversation hour: ${stats.epilogue.peakHour}:00.` }),
    ),
  );

  // Action Buttons
  const actions = el('div', { className: 'wa-epilogue-actions' });

  const replayBtn = el(
    'button',
    {
      className: 'wa-btn-primary wa-epilogue-btn',
      type: 'button',
      onClick: onReplay,
    },
    createIcon('play', { width: 16, height: 16 }),
    el('span', { text: 'Replay Memory' }),
  );

  const insightsBtn = el(
    'button',
    {
      className: 'wa-btn-secondary wa-epilogue-btn',
      type: 'button',
      onClick: onViewInsights,
    },
    createIcon('insights', { width: 16, height: 16 }),
    el('span', { text: 'Full Insights' }),
  );

  const exitBtn = el(
    'button',
    {
      className: 'wa-btn-secondary wa-epilogue-btn',
      type: 'button',
      onClick: onExit,
    },
    createIcon('close', { width: 16, height: 16 }),
    el('span', { text: 'Close' }),
  );

  actions.append(replayBtn, insightsBtn, exitBtn);

  card.append(icon, title, statsRow, heatmapSection, highlights, actions);
  overlay.appendChild(card);
  setTimeout(() => initReveals(overlay), 50);

  return overlay;
}

/**
 * Creates an animated count-up statistic tile
 * @param {number} targetValue
 * @param {string} label
 */
function createCountUpCard(targetValue, label) {
  const valueEl = el('span', { className: 'wa-countup-value', text: '0' });
  const labelEl = el('span', {
    className: 'wa-countup-label',
    text: label,
    data: {
      reveal: 'tilt',
      revealBy: 'words',
      revealTrigger: 'load',
    },
  });
  const tile = el('div', { className: 'wa-countup-card' }, valueEl, labelEl);

  // Animate count-up
  const start = performance.now();
  const duration = 1200;

  /**
   * @param {number} now
   */
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);
    // Ease out expo
    const eased = 1 - Math.pow(2, -10 * progress);
    const current = Math.floor(eased * targetValue);
    valueEl.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      valueEl.textContent = targetValue.toLocaleString();
    }
  }

  requestAnimationFrame(tick);
  return tile;
}

/**
 * Renders a compact 7x24 heatmap grid preview
 * @param {number[][]} heatmap 7 days x 24 hours
 */
function createMiniHeatmap(heatmap) {
  const container = el('div', { className: 'wa-epilogue-mini-heatmap' });

  // Find max value
  let max = 1;
  heatmap.forEach((row) => {
    row.forEach((v) => {
      if (v > max) max = v;
    });
  });

  for (let d = 0; d < 7; d++) {
    const rowEl = el('div', { className: 'wa-mini-heat-row' });
    for (let h = 0; h < 24; h++) {
      const val = heatmap[d]?.[h] || 0;
      const ratio = val / max;
      let level = 0;
      if (ratio > 0.7) level = 4;
      else if (ratio > 0.4) level = 3;
      else if (ratio > 0.15) level = 2;
      else if (ratio > 0) level = 1;

      const cell = el('div', {
        className: `wa-mini-heat-cell l${level}`,
        title: `${val} messages`,
      });
      rowEl.appendChild(cell);
    }
    container.appendChild(rowEl);
  }

  return container;
}
