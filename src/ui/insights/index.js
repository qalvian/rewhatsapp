// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';

const COLOR_LOWER = '#059669'; // Deep Emerald Green (Participant with fewer stats)
const COLOR_HIGHER = '#DC2626'; // Muted Crimson / Red (Participant with higher stats)

/**
 * Creates the Insights & Analytics Dashboard.
 * Includes:
 * - Who Replied More graph (Emerald Green for lower stats, Crimson for higher stats)
 * - Incoming vs. Outgoing Ratios (messages, words, characters)
 * - Comprehensive metrics grid
 * - 7x24 Activity heatmap
 * - Emoji leaderboard
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
    el('div', { className: 'wa-insights-title-wrap' },
      el('span', { className: 'wa-insights-badge', text: 'Chat Intelligence' }),
      el('h2', {
        id: 'insights-dialog-title',
        className: 'wa-insights-title',
        text: 'Conversation Analytics',
      }),
    ),
    el(
      'button',
      {
        className: 'wa-insights-close-btn',
        type: 'button',
        aria: { label: 'Close analytics panel' },
      },
      createIcon('close', { width: 20, height: 20 }),
    ),
  );

  header.querySelector('.wa-insights-close-btn')?.addEventListener('click', onClose);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  const content = el('div', { className: 'wa-insights-content' });

  // =========================================================================
  // 1. "Who Replied More" Graph & Incoming vs. Outgoing Ratios
  // =========================================================================
  const pStats = stats.participantStats;
  if (pStats.length >= 2) {
    const p1 = pStats[0];
    const p2 = pStats[1];

    // Determine colors: lower stat = Emerald (#059669), higher stat = Crimson (#DC2626)
    const isP1LowerMsg = p1.messageCount < p2.messageCount;
    const isTieMsg = p1.messageCount === p2.messageCount;

    const p1Color = isTieMsg ? COLOR_LOWER : isP1LowerMsg ? COLOR_LOWER : COLOR_HIGHER;
    const p2Color = isTieMsg ? COLOR_LOWER : isP1LowerMsg ? COLOR_HIGHER : COLOR_LOWER;

    const p1PctMsg = Math.round((p1.messageRatio || 0) * 100);
    const p2PctMsg = Math.max(0, 100 - p1PctMsg);

    // Who Replied More Section
    const replyGraphSection = el('div', { className: 'wa-insights-section wa-analytics-card' });
    replyGraphSection.appendChild(
      el('div', { className: 'wa-analytics-card-header' },
        el('h3', { className: 'wa-section-title', text: 'Who Replied More' }),
        el('span', {
          className: 'wa-analytics-pill',
          text: isTieMsg ? 'Evenly Balanced' : `${isP1LowerMsg ? p2.displayName : p1.displayName} sent more`,
        }),
      ),
    );

    // Participant comparison bar
    const barTrack = el('div', {
      className: 'wa-ratio-bar-track',
      role: 'meter',
      aria: {
        valuenow: String(p1PctMsg),
        valuemin: '0',
        valuemax: '100',
        label: `Message ratio: ${p1.displayName} ${p1PctMsg}%, ${p2.displayName} ${p2PctMsg}%`,
      },
    });

    const segmentP1 = el('div', {
      className: 'wa-ratio-bar-segment',
      style: `width: ${p1PctMsg}%; background-color: ${p1Color};`,
      title: `${p1.displayName}: ${p1.messageCount.toLocaleString()} messages (${p1PctMsg}%)`,
    });

    const segmentP2 = el('div', {
      className: 'wa-ratio-bar-segment',
      style: `width: ${p2PctMsg}%; background-color: ${p2Color};`,
      title: `${p2.displayName}: ${p2.messageCount.toLocaleString()} messages (${p2PctMsg}%)`,
    });

    barTrack.append(segmentP1, segmentP2);

    // Legend items below bar
    const legendRow = el('div', { className: 'wa-ratio-legend-row' });
    const legendP1 = el(
      'div',
      { className: 'wa-ratio-legend-item' },
      el('span', { className: 'wa-legend-dot', style: `background-color: ${p1Color};` }),
      el('span', { className: 'wa-legend-name', text: p1.displayName }),
      el('strong', { className: 'wa-legend-stat', text: `${p1.messageCount.toLocaleString()} msgs (${p1PctMsg}%)` }),
      el('span', {
        className: `wa-stat-tag ${isP1LowerMsg ? 'tag-lower' : 'tag-higher'}`,
        text: isTieMsg ? 'Equal' : isP1LowerMsg ? 'Fewer messages' : 'More messages',
      }),
    );

    const legendP2 = el(
      'div',
      { className: 'wa-ratio-legend-item' },
      el('span', { className: 'wa-legend-dot', style: `background-color: ${p2Color};` }),
      el('span', { className: 'wa-legend-name', text: p2.displayName }),
      el('strong', { className: 'wa-legend-stat', text: `${p2.messageCount.toLocaleString()} msgs (${p2PctMsg}%)` }),
      el('span', {
        className: `wa-stat-tag ${!isP1LowerMsg && !isTieMsg ? 'tag-lower' : 'tag-higher'}`,
        text: isTieMsg ? 'Equal' : !isP1LowerMsg ? 'Fewer messages' : 'More messages',
      }),
    );

    legendRow.append(legendP1, legendP2);
    replyGraphSection.append(barTrack, legendRow);
    content.appendChild(replyGraphSection);

    // Ratios Grid: Messages, Words, Characters
    const ratiosGrid = el('div', { className: 'wa-ratios-grid' });

    // 1. Message Ratio
    ratiosGrid.appendChild(
      createRatioCard({
        title: 'Message Ratio',
        p1Name: p1.displayName,
        p2Name: p2.displayName,
        p1Val: p1.messageCount,
        p2Val: p2.messageCount,
        p1Pct: p1PctMsg,
        p2Pct: p2PctMsg,
        unit: 'msgs',
      }),
    );

    // 2. Word Ratio
    const isP1LowerWords = p1.wordCount < p2.wordCount;
    const p1PctWords = Math.round((p1.wordRatio || 0) * 100);
    const p2PctWords = Math.max(0, 100 - p1PctWords);
    ratiosGrid.appendChild(
      createRatioCard({
        title: 'Words Shared',
        p1Name: p1.displayName,
        p2Name: p2.displayName,
        p1Val: p1.wordCount,
        p2Val: p2.wordCount,
        p1Pct: p1PctWords,
        p2Pct: p2PctWords,
        unit: 'words',
        isP1Lower: isP1LowerWords,
      }),
    );

    // 3. Character Ratio
    const isP1LowerChars = (p1.charCount || 0) < (p2.charCount || 0);
    const p1PctChars = Math.round((p1.charRatio || 0) * 100);
    const p2PctChars = Math.max(0, 100 - p1PctChars);
    ratiosGrid.appendChild(
      createRatioCard({
        title: 'Characters Typed',
        p1Name: p1.displayName,
        p2Name: p2.displayName,
        p1Val: p1.charCount || 0,
        p2Val: p2.charCount || 0,
        p1Pct: p1PctChars,
        p2Pct: p2PctChars,
        unit: 'chars',
        isP1Lower: isP1LowerChars,
      }),
    );

    content.appendChild(ratiosGrid);
  }

  // =========================================================================
  // 2. Overview Metric Cards Grid
  // =========================================================================
  const overviewGrid = el('div', { className: 'wa-insights-metrics-grid' });

  const silenceDays = Math.round(stats.longestSilence.durationMs / (1000 * 3600 * 24));
  const metrics = [
    { label: 'Total Messages', value: stats.totalMessages.toLocaleString() },
    { label: 'Words Shared', value: stats.totalWords.toLocaleString() },
    { label: 'Characters Typed', value: (stats.totalChars || 0).toLocaleString() },
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

  // =========================================================================
  // 3. Response Times & Conversation Flow
  // =========================================================================
  const flowSection = el('div', { className: 'wa-insights-section' });
  flowSection.appendChild(el('h3', { className: 'wa-section-title', text: 'Median Response Times' }));

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

  // =========================================================================
  // 4. 7x24 Hour × Weekday Heatmap
  // =========================================================================
  const heatmapSection = el('div', { className: 'wa-insights-section' });
  heatmapSection.appendChild(
    el('h3', { className: 'wa-section-title', text: 'When You Talked (Activity Heatmap)' }),
  );
  heatmapSection.appendChild(
    el('p', {
      className: 'wa-section-subtitle',
      text: 'Message frequency across hours of the day (0–23) and days of the week',
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
        style: count > 0 ? `background: rgba(5, 150, 105, ${intensity.toFixed(2)})` : '',
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

  // =========================================================================
  // 5. Emoji Leaderboard
  // =========================================================================
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

/**
 * Helper to build a clean comparison card for incoming vs outgoing ratios.
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.p1Name
 * @param {string} params.p2Name
 * @param {number} params.p1Val
 * @param {number} params.p2Val
 * @param {number} params.p1Pct
 * @param {number} params.p2Pct
 * @param {string} params.unit
 * @param {boolean} [params.isP1Lower]
 * @returns {HTMLElement}
 */
function createRatioCard({ title, p1Name, p2Name, p1Val, p2Val, p1Pct, p2Pct, unit, isP1Lower }) {
  const p1Lower = isP1Lower !== undefined ? isP1Lower : p1Val < p2Val;
  const isTie = p1Val === p2Val;

  const color1 = isTie ? COLOR_LOWER : p1Lower ? COLOR_LOWER : COLOR_HIGHER;
  const color2 = isTie ? COLOR_LOWER : p1Lower ? COLOR_HIGHER : COLOR_LOWER;

  return el(
    'div',
    { className: 'wa-ratio-card' },
    el('div', { className: 'wa-ratio-card-head' },
      el('span', { className: 'wa-ratio-card-title', text: title }),
      el('span', { className: 'wa-ratio-card-split', text: `${p1Pct}% vs ${p2Pct}%` }),
    ),
    el(
      'div',
      { className: 'wa-mini-ratio-track' },
      el('div', {
        className: 'wa-mini-ratio-fill',
        style: `width: ${p1Pct}%; background-color: ${color1};`,
      }),
      el('div', {
        className: 'wa-mini-ratio-fill',
        style: `width: ${p2Pct}%; background-color: ${color2};`,
      }),
    ),
    el(
      'div',
      { className: 'wa-ratio-card-labels' },
      el('span', {
        className: 'wa-ratio-participant',
        style: `color: ${color1}; font-weight: 600;`,
        text: `${p1Name}: ${p1Val.toLocaleString()} ${unit}`,
      }),
      el('span', {
        className: 'wa-ratio-participant',
        style: `color: ${color2}; font-weight: 600;`,
        text: `${p2Name}: ${p2Val.toLocaleString()} ${unit}`,
      }),
    ),
  );
}
