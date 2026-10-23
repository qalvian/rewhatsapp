// @ts-check

import { el, svgEl } from '../../util/dom.js';
import { getAvatarGradient } from '../../util/hash.js';
import { formatDateChip } from '../../util/format.js';

/**
 * Creates the guided 3-step Setup Sheet / Dialog.
 *
 * @param {Object} params
 * @param {import('../../core/parser/index.js').ParsedChatResult} params.chat
 * @param {(config: {
 *   userPersonaRaw: string;
 *   theme: 'light' | 'dark';
 *   gapMode: 'smart' | 'realtime' | 'fixed';
 *   speed: number;
 *   swapDateFormat: boolean;
 * }) => void} params.onStartReplay
 * @param {() => void} params.onCancel
 * @returns {HTMLElement}
 */
export function createSetupDialog({ chat, onStartReplay, onCancel }) {
  const overlay = el('div', {
    className: 'wa-setup-overlay',
    role: 'dialog',
    aria: {
      modal: 'true',
      labelledby: 'setup-dialog-title',
    },
  });

  const card = el('div', { className: 'wa-setup-card' });

  // Dialog Header with Step Indicators & Close Button
  const header = el('div', { className: 'wa-setup-header' });
  const title = el('h2', {
    id: 'setup-dialog-title',
    className: 'wa-setup-title',
    text: "Who's travelling?",
  });

  const closeBtn = el(
    'button',
    {
      className: 'wa-setup-close-btn',
      type: 'button',
      aria: { label: 'Cancel and return to home' },
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
  );
  closeBtn.addEventListener('click', onCancel);

  const stepDots = el('div', { className: 'wa-setup-step-dots' });
  const dot1 = el('span', { className: 'wa-step-dot active' });
  const dot2 = el('span', { className: 'wa-step-dot' });
  const dot3 = el('span', { className: 'wa-step-dot' });
  stepDots.append(dot1, dot2, dot3);

  header.append(title, stepDots, closeBtn);

  // Configuration State
  let currentStep = 1;
  const participantList = chat.participants;
  let selectedPersona = participantList[0]?.raw || '';
  /** @type {'light' | 'dark'} */
  let selectedTheme = 'light';
  /** @type {'smart' | 'realtime' | 'fixed'} */
  let selectedGapMode = 'smart';
  let selectedSpeed = 2;
  let swapDateFormat = false;

  // Step 1: Who's travelling?
  const step1Container = el('div', { className: 'wa-setup-step wa-setup-step-1' });
  const step1Subtitle = el('p', {
    className: 'wa-setup-instruction',
    text: 'Select which person is you. Your messages will appear on the right with outgoing ticks.',
  });

  const personaGrid = el('div', { className: 'wa-persona-grid', role: 'radiogroup' });

  participantList.forEach((participant, idx) => {
    const isSelected = idx === 0;
    const [gradStart, gradEnd] = getAvatarGradient(participant.raw);

    const avatar = el('div', {
      className: 'wa-persona-avatar',
      style: `background: linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
      text: (participant.displayName[0] || '?').toUpperCase(),
    });

    const name = el('span', {
      className: 'wa-persona-name',
      text: participant.displayName,
    });

    const chip = el(
      'button',
      {
        className: `wa-persona-chip ${isSelected ? 'selected' : ''}`,
        type: 'button',
        role: 'radio',
        aria: { checked: String(isSelected) },
      },
      avatar,
      name,
    );

    chip.addEventListener('click', () => {
      personaGrid.querySelectorAll('.wa-persona-chip').forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('selected');
      chip.setAttribute('aria-checked', 'true');
      selectedPersona = participant.raw;
    });

    personaGrid.appendChild(chip);
  });

  step1Container.append(step1Subtitle, personaGrid);

  // Step 2: Pick your world (Theme + Smart Time + Speed + Date Toggle)
  const step2Container = el('div', {
    className: 'wa-setup-step wa-setup-step-2',
    style: 'display: none;',
  });

  const step2Subtitle = el('p', {
    className: 'wa-setup-instruction',
    text: 'Choose your visual style and replay pacing.',
  });

  // Theme Previews
  const themeSectionTitle = el('span', { className: 'wa-setup-section-label', text: 'Theme' });
  const themeCardGrid = el('div', { className: 'wa-theme-card-grid', role: 'radiogroup' });

  // Light Theme Card
  const lightCard = el(
    'button',
    {
      className: 'wa-theme-card wa-theme-card-light selected',
      type: 'button',
      role: 'radio',
      aria: { checked: 'true' },
    },
    el('div', { className: 'wa-theme-preview-bubble wa-preview-incoming', text: 'Hey there' }),
    el('div', { className: 'wa-theme-preview-bubble wa-preview-outgoing', text: 'Hello! ✨' }),
    el('span', { className: 'wa-theme-label', text: 'WhatsApp Light' }),
  );

  // Dark Theme Card
  const darkCard = el(
    'button',
    {
      className: 'wa-theme-card wa-theme-card-dark',
      type: 'button',
      role: 'radio',
      aria: { checked: 'false' },
    },
    el('div', { className: 'wa-theme-preview-bubble wa-preview-incoming', text: 'Hey there' }),
    el('div', { className: 'wa-theme-preview-bubble wa-preview-outgoing', text: 'Hello! ✨' }),
    el('span', { className: 'wa-theme-label', text: 'WhatsApp Dark' }),
  );

  lightCard.addEventListener('click', () => {
    lightCard.classList.add('selected');
    lightCard.setAttribute('aria-checked', 'true');
    darkCard.classList.remove('selected');
    darkCard.setAttribute('aria-checked', 'false');
    selectedTheme = 'light';
  });

  darkCard.addEventListener('click', () => {
    darkCard.classList.add('selected');
    darkCard.setAttribute('aria-checked', 'true');
    lightCard.classList.remove('selected');
    lightCard.setAttribute('aria-checked', 'false');
    selectedTheme = 'dark';
  });

  themeCardGrid.append(lightCard, darkCard);

  // Smart Time Mode selector
  const modeSectionTitle = el('span', {
    className: 'wa-setup-section-label',
    text: 'Dead-air Compression',
  });
  const modeGrid = el('div', { className: 'wa-setup-chips-row', role: 'radiogroup' });

  const modes = [
    { id: 'smart', label: '⚡ Smart (Logarithmic)', default: true },
    { id: 'realtime', label: '⏱️ Real-time' },
    { id: 'fixed', label: '📏 Fixed Cadence' },
  ];

  modes.forEach((m) => {
    const chip = el('button', {
      className: `wa-setup-mode-chip ${m.default ? 'selected' : ''}`,
      type: 'button',
      role: 'radio',
      aria: { checked: String(!!m.default) },
      text: m.label,
    });

    chip.addEventListener('click', () => {
      modeGrid.querySelectorAll('.wa-setup-mode-chip').forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('selected');
      chip.setAttribute('aria-checked', 'true');
      selectedGapMode = /** @type {'smart' | 'realtime' | 'fixed'} */ (m.id);
    });

    modeGrid.appendChild(chip);
  });

  // Starting Speed Chips
  const speedSectionTitle = el('span', {
    className: 'wa-setup-section-label',
    text: 'Starting Speed',
  });
  const speedGrid = el('div', { className: 'wa-setup-chips-row', role: 'radiogroup' });
  const speeds = [1, 2, 5, 10];

  speeds.forEach((s) => {
    const chip = el('button', {
      className: `wa-setup-speed-chip ${s === 2 ? 'selected' : ''}`,
      type: 'button',
      role: 'radio',
      aria: { checked: String(s === 2) },
      text: `${s}×`,
    });

    chip.addEventListener('click', () => {
      speedGrid.querySelectorAll('.wa-setup-speed-chip').forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('selected');
      chip.setAttribute('aria-checked', 'true');
      selectedSpeed = s;
    });

    speedGrid.appendChild(chip);
  });

  step2Container.append(
    step2Subtitle,
    themeSectionTitle,
    themeCardGrid,
    modeSectionTitle,
    modeGrid,
    speedSectionTitle,
    speedGrid,
  );

  // If date order had low confidence or ambiguous dates, add date confirmation toggle
  const firstMsg = chat.messages[0];
  const lastMsg = chat.messages[chat.messages.length - 1];

  if (firstMsg && lastMsg) {
    const dateToggleBox = el('div', { className: 'wa-date-toggle-box' });
    const toggleLabel = el('span', {
      className: 'wa-setup-section-label',
      text: 'Date Format Confirmation',
    });

    const toggleBtn = el(
      'button',
      {
        className: 'wa-date-toggle-btn',
        type: 'button',
        aria: { label: 'Toggle day and month order' },
      },
      el('span', { className: 'wa-date-toggle-title', text: 'Dates read as DD/MM ↔ MM/DD' }),
      el('span', {
        className: 'wa-date-preview-text',
        text: `First: ${formatDateChip(firstMsg.timestamp)} · Last: ${formatDateChip(lastMsg.timestamp)}`,
      }),
    );

    toggleBtn.addEventListener('click', () => {
      swapDateFormat = !swapDateFormat;
      toggleBtn.classList.toggle('active', swapDateFormat);
    });

    dateToggleBox.append(toggleLabel, toggleBtn);
    step2Container.appendChild(dateToggleBox);
  }

  // Step 3: Ready Summary
  const step3Container = el('div', {
    className: 'wa-setup-step wa-setup-step-3',
    style: 'display: none;',
  });

  const totalMsgs = chat.messages.length;
  const daysSpanned =
    firstMsg && lastMsg
      ? Math.max(1, Math.round((lastMsg.timestamp - firstMsg.timestamp) / (1000 * 60 * 60 * 24)))
      : 1;
  const numPeople = participantList.length;

  const summaryPill = el(
    'div',
    { className: 'wa-summary-pill' },
    el('span', { className: 'wa-summary-count', text: `${totalMsgs.toLocaleString()}` }),
    el('span', { className: 'wa-summary-label', text: ' messages · ' }),
    el('span', { className: 'wa-summary-count', text: `${daysSpanned}` }),
    el('span', { className: 'wa-summary-label', text: ' days · ' }),
    el('span', { className: 'wa-summary-count', text: `${numPeople}` }),
    el('span', { className: 'wa-summary-label', text: ' people' }),
  );

  const quote = el('p', {
    className: 'wa-summary-quote',
    text: "Everything is loaded. Take a breath — you're about to travel back.",
  });

  step3Container.append(summaryPill, quote);

  // Dialog Footer Navigation (Back, Next / Travel Back)
  const footer = el('div', { className: 'wa-setup-footer' });

  const backBtn = el('button', {
    className: 'wa-setup-nav-btn wa-btn-back',
    type: 'button',
    style: 'visibility: hidden;',
    text: 'Back',
  });

  const nextBtn = el('button', {
    className: 'wa-setup-nav-btn wa-btn-next',
    type: 'button',
    text: 'Next →',
  });

  function updateStepView() {
    [dot1, dot2, dot3].forEach((d, i) => d.classList.toggle('active', i === currentStep - 1));

    step1Container.style.display = currentStep === 1 ? 'block' : 'none';
    step2Container.style.display = currentStep === 2 ? 'block' : 'none';
    step3Container.style.display = currentStep === 3 ? 'block' : 'none';

    backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

    if (currentStep === 1) {
      title.textContent = "Who's travelling?";
      nextBtn.textContent = 'Next →';
      nextBtn.classList.remove('wa-btn-travel');
    } else if (currentStep === 2) {
      title.textContent = 'Pick your world';
      nextBtn.textContent = 'Next →';
      nextBtn.classList.remove('wa-btn-travel');
    } else {
      title.textContent = 'Ready to travel';
      nextBtn.textContent = 'Travel back ✨';
      nextBtn.classList.add('wa-btn-travel');
    }
  }

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepView();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentStep < 3) {
      currentStep++;
      updateStepView();
    } else {
      // Step 3 Travel Back Clicked!
      // Request Fullscreen immediately during user gesture
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else if (/** @type {any} */ (document.documentElement).webkitRequestFullscreen) {
            /** @type {any} */ (document.documentElement).webkitRequestFullscreen();
          }
        }
      } catch {
        // Fallback gracefully to immersive mode
      }

      onStartReplay({
        userPersonaRaw: selectedPersona,
        theme: selectedTheme,
        gapMode: selectedGapMode,
        speed: selectedSpeed,
        swapDateFormat,
      });
    }
  });

  footer.append(backBtn, nextBtn);
  card.append(header, step1Container, step2Container, step3Container, footer);
  overlay.appendChild(card);

  return overlay;
}
