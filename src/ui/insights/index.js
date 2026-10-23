// @ts-check

import { el, svgEl } from '../../util/dom.js';

/**
 * Creates the Insights Dashboard (bottom sheet on mobile, side panel on desktop).
 *
 * @param {Object} params
 * @param {import('../../core/analytics/stats.js').ChatInsights} params.stats
 * @param {() => void} params.onClose
 * @returns {HTMLElement}
 */
export function createInsightsDashboard({ stats, onClose }) {
  const overlay = el('div', {
    className: 'wa-insights-overlay',
    role: 'dialog',
    aria: {
      modal: 'true',
      labelledby: 'insights-dialog-title',
    },
  });

  const panel = el('div', { className: 'wa-insights-panel' });

  // Header
  const header = el(
    'div',
    { className: 'wa-insights-header' },
    el('h2', {
      id: 'insights-dialog-title',
      className: 'wa-insights-title',
      text: 'Conversation Insights',
    }),
    el(
      'button',
      {
        className: 'wa-insights-close-btn',
        type: 'button',
        aria: { label: 'Close insights panel' },
      },
      svgEl(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: '20',
          height: '20',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        },
        svgEl('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
        svgEl('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
      ),
    ),
  );

  header.querySelector('.wa-insights-close-btn')?.addEventListener('click', onClose);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  const content = el('div', { className: 'wa-insights-content' });

  // 1. Overview Metric Cards Grid
  const overviewGrid = el('div', { className: 'wa-insights-metrics-grid' });

  const silenceDays = Math.round(stats.longestSilence.durationMs / (1000 * 3600 * 24));
  const metrics = [
    { label: 'Total Messages', value: stats.totalMessages.toLocaleString() },
    { label: 'Words Shared', value: stats.totalWords.toLocaleString() },
    { label: 'Days Spanned', value: `${stats.totalDaysSpanned} days` },
    { label: 'Longest Streak', value: `${stats.longestStreakDays} days` },
    { label: 'Longest Silence', value: silenceDays > 0 ? `${silenceDays} days` : 'None' },
    { label: 'Peak Hour', value: `${stats.epilogue.peakHour}:00` },
  ];

  metrics.forEach((m) => {
    const card = el(
      'div',
      { className: 'wa-metric-card' },
      el('span', { className: 'wa-metric-value', text: m.value }),
      el('span', { className: 'wa-metric-label', text: m.label }),
    );
    overviewGrid.appendChild(card);
  });
  content.appendChild(overviewGrid);

  // 2. Response Times & Conversation Flow
  const flowSection = el('div', { className: 'wa-insights-section' });
  flowSection.appendChild(el('h3', { className: 'wa-section-title', text: 'Response Times' }));

  const responseList = el('div', { className: 'wa-response-list' });
  stats.participantStats.forEach((p) => {
    const timeFormatted =
      p.medianResponseTimeMinutes > 0 ? `${p.medianResponseTimeMinutes} min` : '—';

    const row = el(
      'div',
      { className: 'wa-response-row' },
      el('span', { className: 'wa-response-name', text: p.displayName }),
      el(
        'div',
        { className: 'wa-response-bar-track' },
        el('div', { className: 'wa-response-bar' }),
      ),
      el('span', {
        className: 'wa-response-time',
        text: timeFormatted,
      }),
    );
    responseList.appendChild(row);
  });
  flowSection.appendChild(responseList);
  content.appendChild(flowSection);

  // 3. 7x24 Hour × Weekday Heatmap
  const heatmapSection = el('div', { className: 'wa-insights-section' });
  heatmapSection.appendChild(
    el('h3', { className: 'wa-section-title', text: 'When You Talked (Heatmap)' }),
  );
  heatmapSection.appendChild(
    el('p', {
      className: 'wa-section-subtitle',
      text: 'Hour of day (0–23) across days of the week',
    }),
  );

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const heatmapContainer = el('div', { className: 'wa-heatmap-container' });

  // Find max cell count for color scaling
  let maxCount = 1;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const count = stats.heatmap[d]?.[h] || 0;
      if (count > maxCount) maxCount = count;
    }
  }

  days.forEach((dayName, dayIndex) => {
    const row = el('div', { className: 'wa-heatmap-row' });
    row.appendChild(el('span', { className: 'wa-heatmap-day-label', text: dayName }));

    for (let hour = 0; hour < 24; hour++) {
      const count = stats.heatmap[dayIndex]?.[hour] || 0;
      const intensity = count > 0 ? Math.max(0.15, count / maxCount) : 0;

      const cell = el('div', {
        className: 'wa-heatmap-cell',
        style: count > 0 ? `background: rgba(37, 211, 102, ${intensity.toFixed(2)})` : '',
        title: `${dayName} ${String(hour).padStart(2, '0')}:00 · ${count} messages`,
        tabindex: '0',
        aria: {
          label: `${dayName} ${hour}:00, ${count} messages`,
        },
      });

      row.appendChild(cell);
    }
    heatmapContainer.appendChild(row);
  });

  heatmapSection.appendChild(heatmapContainer);
  content.appendChild(heatmapSection);

  // 4. Emoji Leaderboard
  if (stats.overallTopEmojis && stats.overallTopEmojis.length > 0) {
    const emojiSection = el('div', { className: 'wa-insights-section' });
    emojiSection.appendChild(el('h3', { className: 'wa-section-title', text: 'Top Emojis' }));

    const emojiGrid = el('div', { className: 'wa-emoji-leaderboard-grid' });
    stats.overallTopEmojis.slice(0, 8).forEach((item, index) => {
      const chip = el(
        'div',
        { className: 'wa-emoji-chip' },
        el('span', { className: 'wa-emoji-rank', text: `#${index + 1}` }),
        el('span', { className: 'wa-emoji-char', text: item.emoji }),
        el('span', { className: 'wa-emoji-count', text: `${item.count}×` }),
      );
      emojiGrid.appendChild(chip);
    });
    emojiSection.appendChild(emojiGrid);
    content.appendChild(emojiSection);
  }

  panel.append(header, content);
  overlay.appendChild(panel);

  return overlay;
}
