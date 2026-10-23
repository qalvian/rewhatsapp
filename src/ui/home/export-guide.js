// @ts-check

import { el, svgEl } from '../../util/dom.js';

/**
 * Creates the collapsible "How do I export my chat?" guide.
 * Clean, respectful steps with original SVG illustrations for iOS & Android.
 *
 * @returns {HTMLElement}
 */
export function createExportGuide() {
  const container = el('div', { className: 'wa-export-guide' });

  // Toggle button / accordion trigger
  const toggleBtn = el(
    'button',
    {
      className: 'wa-export-toggle-btn',
      type: 'button',
      aria: { expanded: 'false' },
    },
    el('span', { text: 'How do I export my chat?' }),
    svgEl(
      'svg',
      {
        className: 'wa-export-toggle-icon',
        viewBox: '0 0 24 24',
        width: '18',
        height: '18',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      svgEl('polyline', { points: '6 9 12 15 18 9' }),
    ),
  );

  const contentPanel = el('div', {
    className: 'wa-export-panel wa-export-hidden',
    aria: { hidden: 'true' },
  });

  // Tab switchers: iPhone (iOS) and Android
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
        el('strong', { text: 'Open the chat' }),
        el('span', { text: ' in WhatsApp and tap the contact or group name at the top.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Scroll down' }),
        el('span', { text: ' and tap ' }),
        el('code', { text: 'Export Chat' }),
        el('span', { text: '.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Choose "Without Media"' }),
        el('span', { text: ' for an instant .txt file, or "Attach Media" for a .zip.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Save to Files' }),
        el('span', { text: ' or AirDrop/share it to this computer or browser.' }),
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
        el('strong', { text: 'Open the chat' }),
        el('span', { text: ' in WhatsApp and tap the three-dot menu (⋮) at top right.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Tap More' }),
        el('span', { text: ' → ' }),
        el('code', { text: 'Export chat' }),
        el('span', { text: '.' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Select "Without media"' }),
        el('span', { text: ' (recommended for fastest parsing).' }),
      ),
      el(
        'li',
        {},
        el('strong', { text: 'Save or share' }),
        el('span', { text: ' the resulting ' }),
        el('code', { text: '.txt' }),
        el('span', { text: ' file to your device or cloud storage.' }),
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

  // Wire Accordion Toggle
  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    if (isExpanded) {
      contentPanel.classList.add('wa-export-hidden');
      contentPanel.setAttribute('aria-hidden', 'true');
    } else {
      contentPanel.classList.remove('wa-export-hidden');
      contentPanel.setAttribute('aria-hidden', 'false');
    }
  });

  contentPanel.append(tabs, iosSteps, androidSteps);
  container.append(toggleBtn, contentPanel);

  return container;
}
