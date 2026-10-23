// @ts-check

import { el, svgEl } from '../../util/dom.js';

/**
 * Creates the Epilogue Memory Card when replay reaches the end of the conversation.
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

  // Soft atmospheric icon / illustration
  const icon = el(
    'div',
    { className: 'wa-epilogue-icon' },
    svgEl(
      'svg',
      {
        viewBox: '0 0 24 24',
        width: '36',
        height: '36',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      svgEl('path', { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' }),
      svgEl('path', { d: 'M12 7v5l3 3' }),
    ),
  );

  const title = el('h2', {
    id: 'epilogue-title',
    className: 'wa-epilogue-title',
    text: 'And that brings us to the present.',
  });

  const narrativeText = el('p', {
    className: 'wa-epilogue-narrative',
    text: `You talked across ${stats.totalDaysSpanned} days, through ${stats.totalMessages.toLocaleString()} messages and ${stats.totalWords.toLocaleString()} words.`,
  });

  // Emotional highlights
  const highlights = el('div', { className: 'wa-epilogue-highlights' });

  highlights.appendChild(
    el(
      'div',
      { className: 'wa-epilogue-highlight-item' },
      el('span', { className: 'wa-highlight-emoji', text: '⚡' }),
      el('span', { text: `Your longest daily talking streak was ${stats.longestStreakDays} days.` }),
    ),
  );

  if (stats.epilogue.topEmoji) {
    highlights.appendChild(
      el(
        'div',
        { className: 'wa-epilogue-highlight-item' },
        el('span', { className: 'wa-highlight-emoji', text: stats.epilogue.topEmoji }),
        el('span', { text: 'Your most shared feeling.' }),
      ),
    );
  }

  highlights.appendChild(
    el(
      'div',
      { className: 'wa-epilogue-highlight-item' },
      el('span', { className: 'wa-highlight-emoji', text: '🌙' }),
      el('span', { text: `Peak conversation hour was ${stats.epilogue.peakHour}:00.` }),
    ),
  );

  // Action Buttons
  const actions = el('div', { className: 'wa-epilogue-actions' });

  const replayBtn = el(
    'button',
    {
      className: 'wa-epilogue-btn wa-epilogue-replay-btn',
      type: 'button',
      text: 'Replay from start ↺',
    },
  );
  replayBtn.addEventListener('click', onReplay);

  const insightsBtn = el(
    'button',
    {
      className: 'wa-epilogue-btn wa-epilogue-insights-btn',
      type: 'button',
      text: 'View all insights 📊',
    },
  );
  insightsBtn.addEventListener('click', onViewInsights);

  const exitBtn = el(
    'button',
    {
      className: 'wa-epilogue-btn wa-epilogue-exit-btn',
      type: 'button',
      text: 'Back to time machine 🌙',
    },
  );
  exitBtn.addEventListener('click', onExit);

  actions.append(replayBtn, insightsBtn, exitBtn);

  card.append(icon, title, narrativeText, highlights, actions);
  overlay.appendChild(card);

  return overlay;
}
