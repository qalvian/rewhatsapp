// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';

/**
 * Creates the complete "How to use it" section component:
 * 1. Android / iOS tabbed export guide with compact numbered steps.
 * 2. "What to do next" inline strip (A: Choose who you are, B: Pick pacing, C: Press Travel back).
 * 3. Keyboard shortcuts (small 2-column list on desktop, collapsed on mobile).
 *
 * @returns {HTMLElement}
 */
export function createExportGuide() {
  const container = el('div', { className: 'wa-how-to-use-container' });

  // Section Header (Left aligned, serif H2)
  const sectionHeader = el(
    'div',
    { className: 'wa-section-header' },
    el('span', { className: 'wa-section-eyebrow', text: 'EXPORT GUIDE' }),
    el('h2', {
      className: 'wa-section-title',
      text: 'How to export your chat.',
      data: {
        reveal: 'blur',
        revealDir: 'bottom',
        revealDelay: '60',
      },
    }),
    el('p', {
      className: 'wa-section-sub',
      text: 'Export from your phone in 20 seconds. Nothing is uploaded — it stays on your device.',
    }),
  );

  // Main layout grid: Export Guide left, Next Steps & Shortcuts right on desktop
  const grid = el('div', { className: 'wa-how-to-use-grid' });

  // =========================================================================
  // Column 1: Tabbed WhatsApp Export Guide (iOS / Android)
  // =========================================================================
  const exportCard = el('div', { className: 'wa-guide-main-card' });

  // Tab switchers: iOS / Android
  const tabs = el('div', { className: 'wa-export-tabs', role: 'tablist' });
  const iosTab = el('button', {
    className: 'wa-export-tab-btn active',
    type: 'button',
    role: 'tab',
    aria: { selected: 'true' },
    text: 'iPhone (iOS)',
  });
  const androidTab = el('button', {
    className: 'wa-export-tab-btn',
    type: 'button',
    role: 'tab',
    aria: { selected: 'false' },
    text: 'Android',
  });
  tabs.append(iosTab, androidTab);

  // iOS Steps
  const iosSteps = el(
    'div',
    { className: 'wa-export-steps wa-export-steps-ios' },
    el(
      'ol',
      { className: 'wa-steps-list' },
      el(
        'li',
        {},
        el('strong', { text: 'Open chat: ' }),
        el('span', { text: 'Tap the contact or group name at the top of the chat.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Export chat: ' }),
        el('span', { text: 'Scroll down to the bottom and tap ' }),
        el('code', { text: 'Export Chat' }),
        el('span', { text: '.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Without Media: ' }),
        el('span', { text: 'Choose "Without Media" to create a lightweight .txt file.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Save & drop: ' }),
        el('span', { text: 'Tap Save to Files or AirDrop it, then drop it into rewhatsapp.' }),
      ),
    ),
  );

  // Android Steps
  const androidSteps = el(
    'div',
    { className: 'wa-export-steps wa-export-steps-android', style: 'display: none;' },
    el(
      'ol',
      { className: 'wa-steps-list' },
      el(
        'li',
        {},
        el('strong', { text: 'Open chat: ' }),
        el('span', { text: 'Tap the three dots menu (⋮) in the top-right corner.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'More → Export: ' }),
        el('span', { text: 'Tap ' }),
        el('code', { text: 'More' }),
        el('span', { text: ' → ' }),
        el('code', { text: 'Export chat' }),
        el('span', { text: '.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Without media: ' }),
        el('span', { text: 'Select "Without media" for fastest reading and smallest file size.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Save & drop: ' }),
        el('span', { text: 'Save the resulting .txt file to your device, then drop it here.' }),
      ),
    ),
  );

  // Wire Tab Switching
  iosTab.addEventListener('click', () => {
    iosTab.classList.add('active');
    iosTab.setAttribute('aria-selected', 'true');
    androidTab.classList.remove('active');
    androidTab.setAttribute('aria-selected', 'false');
    iosSteps.style.display = 'block';
    androidSteps.style.display = 'none';
  });

  androidTab.addEventListener('click', () => {
    androidTab.classList.add('active');
    androidTab.setAttribute('aria-selected', 'true');
    iosTab.classList.remove('active');
    iosTab.setAttribute('aria-selected', 'false');
    androidSteps.style.display = 'block';
    iosSteps.style.display = 'none';
  });

  exportCard.append(tabs, iosSteps, androidSteps);

  // =========================================================================
  // Column 2: "What to do next" inline strip + Collapsible Shortcuts
  // =========================================================================
  const rightCol = el('div', { className: 'wa-guide-right-col' });

  // 1. What to do next Card
  const nextStepsCard = el(
    'div',
    { className: 'wa-guide-next-box' },
    el('h3', { className: 'wa-guide-subheading', text: 'What to do next' }),
    el(
      'ol',
      { className: 'wa-guide-numbered-steps' },
      el(
        'li',
        { className: 'wa-guide-step-item' },
        el('span', { className: 'wa-step-badge', text: 'A' }),
        el(
          'div',
          { className: 'wa-step-detail' },
          el('strong', { text: 'Choose your side: ' }),
          el('span', { text: 'Select your name so your messages appear on the right.' }),
        ),
      ),
      el(
        'li',
        { className: 'wa-guide-step-item' },
        el('span', { className: 'wa-step-badge', text: 'B' }),
        el(
          'div',
          { className: 'wa-step-detail' },
          el('strong', { text: 'Dynamic Speed: ' }),
          el('span', {
            text: 'Playback delay is calculated from message length, with -4x to +4x speed controls.',
          }),
        ),
      ),
      el(
        'li',
        { className: 'wa-guide-step-item' },
        el('span', { className: 'wa-step-badge', text: 'C' }),
        el(
          'div',
          { className: 'wa-step-detail' },
          el('strong', { text: 'Press Travel back: ' }),
          el('span', { text: 'Sit back and watch the conversation replay with typing and sound.' }),
        ),
      ),
    ),
  );

  // 2. Keyboard Shortcuts: Small 2-column list on desktop, collapsed on mobile
  const shortcutsDetails = el(
    'details',
    { className: 'wa-shortcuts-collapse' },
    el(
      'summary',
      { className: 'wa-shortcuts-summary' },
      el('span', { text: 'Keyboard shortcuts' }),
      createIcon('chevron-down', { width: 14, height: 14, className: 'wa-shortcuts-chevron' }),
    ),
    el(
      'div',
      { className: 'wa-shortcuts-grid' },
      el(
        'div',
        { className: 'wa-shortcut-item' },
        el('kbd', { text: 'Space' }),
        el('span', { text: 'Play / Pause' }),
      ),
      el(
        'div',
        { className: 'wa-shortcut-item' },
        el('kbd', { text: '← / →' }),
        el('span', { text: 'Step messages' }),
      ),
      el(
        'div',
        { className: 'wa-shortcut-item' },
        el('kbd', { text: '[ / ]' }),
        el('span', { text: 'Speed up / down' }),
      ),
      el(
        'div',
        { className: 'wa-shortcut-item' },
        el('kbd', { text: 'F' }),
        el('span', { text: 'Fullscreen' }),
      ),
      el(
        'div',
        { className: 'wa-shortcut-item' },
        el('kbd', { text: 'I' }),
        el('span', { text: 'Insights' }),
      ),
      el(
        'div',
        { className: 'wa-shortcut-item' },
        el('kbd', { text: 'M' }),
        el('span', { text: 'Mute audio' }),
      ),
    ),
  );

  rightCol.append(nextStepsCard, shortcutsDetails);
  grid.append(exportCard, rightCol);
  container.append(sectionHeader, grid);

  return container;
}
