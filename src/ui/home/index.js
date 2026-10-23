// @ts-check

import { el, svgEl } from '../../util/dom.js';
import { createTimeDial } from './dial.js';
import { createExportGuide } from './export-guide.js';

const HEADLINES = [
  'Remember when it was just the two of you?',
  "Every 'good morning' deserves a rewind.",
  'Go back to the night it all started.',
  'Some conversations are too good to stay in the past.',
];

const GHOST_BUBBLES = [
  { text: 'meet me at the fountain 🌧️', isRight: false },
  { text: 'haha stop 🙈', isRight: true },
  { text: 'are you still up?', isRight: false },
  { text: 'listen to this with headphones 🎧', isRight: true },
  { text: 'goodnight architect 🌙', isRight: false },
  { text: 'wild horses couldn’t drag me away ❤️', isRight: true },
];

/**
 * Creates the Home / Time Machine landing view.
 *
 * @param {Object} params
 * @param {(file: File) => void} params.onFileSelected
 * @param {() => void} params.onDemoSelected
 * @param {() => void} [params.onOpenPrivacy]
 * @returns {{
 *   element: HTMLElement;
 *   whirlDial: (durationMs: number) => Promise<void>;
 *   destroy: () => void;
 * }}
 */
export function createHomeView({ onFileSelected, onDemoSelected, onOpenPrivacy }) {
  const container = el('div', { className: 'wa-home-container' });

  // Drifting Bokeh & Ghost Bubbles background layer
  const bgLayer = el('div', { className: 'wa-home-bg-layer', aria: { hidden: 'true' } });

  // Floating ghost memories
  const ghostContainer = el('div', { className: 'wa-ghost-container' });
  GHOST_BUBBLES.forEach((ghost, i) => {
    const bubble = el('div', {
      className: `wa-ghost-bubble ${ghost.isRight ? 'wa-ghost-right' : 'wa-ghost-left'} wa-ghost-${i % 4}`,
      text: ghost.text,
    });
    ghostContainer.appendChild(bubble);
  });
  bgLayer.appendChild(ghostContainer);

  // Time Dial in the center background
  const timeDial = createTimeDial();
  bgLayer.appendChild(timeDial.element);
  container.appendChild(bgLayer);

  // Foreground content wrapper
  const content = el('main', { className: 'wa-home-content' });

  // Brand Header
  const brandBadge = el(
    'div',
    { className: 'wa-brand-badge' },
    el('span', { className: 'wa-brand-dot' }),
    el('span', { text: 'rewhatsapp · private conversation replayer' }),
  );

  // Rotating Headline
  const headlineEl = el('h1', {
    className: 'wa-home-headline',
    text: HEADLINES[0] || '',
  });

  let headlineIndex = 0;
  const _headlineTimer = setInterval(() => {
    headlineIndex = (headlineIndex + 1) % HEADLINES.length;
    headlineEl.classList.add('wa-headline-fade-out');
    setTimeout(() => {
      headlineEl.textContent = HEADLINES[headlineIndex] || '';
      headlineEl.classList.remove('wa-headline-fade-out');
    }, 400);
  }, 6000);

  // Subcopy
  const subcopy = el('p', {
    className: 'wa-home-subcopy',
    text: "Drop in your chat and watch it happen all over again — every late reply, every 'haha stop 🙈', every 2 a.m. 'you up?'",
  });

  // Hidden File Input
  const fileInput = /** @type {HTMLInputElement} */ (
    el('input', {
      type: 'file',
      accept: '.txt,.zip,text/plain,application/zip',
      style: 'display: none;',
      aria: { label: 'Upload exported WhatsApp chat file' },
    })
  );
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      onFileSelected(fileInput.files[0]);
    }
  });

  // The Portal (Circular Glowing Dropzone)
  const portal = el(
    'div',
    {
      className: 'wa-portal-dropzone',
      role: 'button',
      tabindex: '0',
      aria: {
        label: 'Drop WhatsApp chat file here or click to browse',
      },
    },
    el('div', { className: 'wa-portal-glow' }),
    el('div', { className: 'wa-portal-ring-outer' }),
    el('div', { className: 'wa-portal-ring-inner' }),
    el(
      'div',
      { className: 'wa-portal-content' },
      svgEl(
        'svg',
        {
          className: 'wa-portal-icon',
          viewBox: '0 0 24 24',
          width: '32',
          height: '32',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        },
        svgEl('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        svgEl('polyline', { points: '17 8 12 3 7 8' }),
        svgEl('line', { x1: '12', y1: '3', x2: '12', y2: '15' }),
      ),
      el('span', { className: 'wa-portal-title', text: 'Drop your chat here' }),
      el('span', { className: 'wa-portal-subtitle', text: 'or tap to choose .txt or .zip' }),
    ),
  );

  // Portal Interaction Handlers
  portal.addEventListener('click', () => fileInput.click());
  portal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Drag and Drop
  portal.addEventListener('dragover', (e) => {
    e.preventDefault();
    portal.classList.add('wa-portal-dragover');
    timeDial.setSpinSpeed(4);
  });

  portal.addEventListener('dragleave', (e) => {
    e.preventDefault();
    portal.classList.remove('wa-portal-dragover');
    timeDial.setSpinSpeed(1);
  });

  portal.addEventListener('drop', (e) => {
    e.preventDefault();
    portal.classList.remove('wa-portal-dragover');
    timeDial.setSpinSpeed(1);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  });

  // Secondary CTAs container
  const ctaRow = el('div', { className: 'wa-home-cta-row' });

  // "Try a sample memory" Button
  const demoBtn = el(
    'button',
    {
      className: 'wa-demo-btn',
      type: 'button',
    },
    svgEl(
      'svg',
      {
        viewBox: '0 0 24 24',
        width: '18',
        height: '18',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      svgEl('polygon', { points: '5 3 19 12 5 21 5 3' }),
    ),
    el('span', { text: 'Try a sample memory' }),
  );
  demoBtn.addEventListener('click', () => onDemoSelected());
  ctaRow.appendChild(demoBtn);

  // Privacy Reassurance & Badge
  const privacySection = el('div', { className: 'wa-home-privacy-section' });

  const privacyText = el('p', {
    className: 'wa-privacy-text',
    text: 'Your memories never leave this device. Not even a little.',
  });

  const privacyBadge = el(
    'button',
    {
      className: 'wa-privacy-badge',
      type: 'button',
      aria: { label: 'Learn how privacy is verified on this device' },
    },
    svgEl(
      'svg',
      {
        viewBox: '0 0 24 24',
        width: '14',
        height: '14',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      svgEl('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
    ),
    el('span', { text: 'Nothing leaves this device' }),
  );

  if (onOpenPrivacy) {
    privacyBadge.addEventListener('click', onOpenPrivacy);
  }

  privacySection.append(privacyText, privacyBadge);

  // Collapsible Export Guide
  const exportGuide = createExportGuide();

  // Footer Disclaimer
  const footer = el(
    'footer',
    { className: 'wa-home-footer' },
    el('p', {
      text: 'Not affiliated with, associated with, or endorsed by WhatsApp or Meta. 100% client-side open source.',
    }),
  );

  content.append(
    brandBadge,
    headlineEl,
    subcopy,
    portal,
    fileInput,
    ctaRow,
    privacySection,
    exportGuide,
    footer,
  );

  container.appendChild(content);

  return {
    element: container,
    whirlDial: (durationMs) => timeDial.whirlBackward(durationMs),
    destroy: () => clearInterval(_headlineTimer),
  };
}
