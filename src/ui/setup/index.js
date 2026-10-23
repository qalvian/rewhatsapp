// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';
import { getAvatarGradient } from '../../util/hash.js';
import { formatDateChip } from '../../util/format.js';
import { revealText, retext } from '../motion/text-reveal.js';

/**
 * Creates the guided 3-step Setup Wizard.
 * Follows strict specifications:
 * - Desktop: centered dialog 560px, max-height 90dvh, header / scrollable body / fixed footer.
 * - Mobile: full-height bottom sheet with drag handle.
 * - Primary button always visible in fixed footer. No clipping or page scrolling.
 * - Step 1: Large selectable cards (min 72px tall), 48px gradient avatars, check icon. Group search if >6 people.
 * - Step 2: Segmented controls (not chip soup). Live preview cards with label below.
 * - Step 3: Summary list with consistent SVG icons, prominent "Travel back" button.
 * - Focus trapped, Esc closes, focus returns to trigger on close.
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
 * @param {HTMLElement} [params.triggerEl]
 * @returns {HTMLElement}
 */
export function createSetupDialog({ chat, onStartReplay, onCancel, triggerEl }) {
  const previouslyFocused = triggerEl || /** @type {HTMLElement} */ (document.activeElement);

  const overlay = el('div', {
    className: 'wa-setup-overlay',
    role: 'dialog',
    aria: {
      modal: 'true',
      labelledby: 'setup-dialog-title',
    },
  });

  const card = el('div', { className: 'wa-setup-card' });

  // Mobile Drag Handle
  const dragHandle = el('div', { className: 'wa-setup-drag-handle', aria: { hidden: 'true' } });

  // Dialog Header
  const header = el('div', { className: 'wa-setup-header' });

  // Progress Indicator (hidden in single-step modal)
  const progressContainer = el('div', {
    className: 'wa-setup-progress-bar',
    role: 'progressbar',
    style: 'display: none;',
    aria: { valuemin: '1', valuemax: '3', valuenow: '1' },
  });
  const progressFill = el('div', {
    className: 'wa-setup-progress-fill',
    style: 'width: 100%;',
  });
  progressContainer.appendChild(progressFill);

  const headerTitleRow = el('div', { className: 'wa-setup-title-row' });
  const titleContainer = el('div', { className: 'wa-setup-title-container' });
  const title = el('h2', {
    id: 'setup-dialog-title',
    className: 'wa-setup-title',
    text: 'Who are you?',
  });
  titleContainer.append(title);

  /** @type {import('../motion/text-reveal.js').RevealHandle} */
  let titleHandle = revealText(title, {
    effect: 'blur',
    animateBy: 'words',
    trigger: 'load',
    delay: 40,
    duration: 450,
  });

  const closeBtn = el(
    'button',
    {
      className: 'wa-setup-close-btn',
      type: 'button',
      aria: { label: 'Close setup and return' },
    },
    createIcon('close', { width: 14, height: 14 }),
  );

  headerTitleRow.append(titleContainer, closeBtn);
  header.append(dragHandle, progressContainer, headerTitleRow);

  // Configuration State
  let currentStep = 1;
  const participantList = chat.participants;
  let selectedPersona = participantList[0]?.raw || '';
  /** @type {'light' | 'dark'} */
  let selectedTheme = 'light';
  /** @type {'smart' | 'realtime' | 'fixed'} */
  const selectedGapMode = 'smart';
  let selectedSpeed = 1;
  let swapDateFormat = false;

  // Scrollable Body Container
  const body = el('div', { className: 'wa-setup-body' });

  // =========================================================================
  // STEP 1: Who are you?
  // =========================================================================
  const step1 = el('div', { className: 'wa-setup-step wa-setup-step-1' });
  const step1Desc = el('p', {
    className: 'wa-setup-desc',
    text: 'Choose which participant is you. Your messages will appear on the right with outgoing status ticks.',
  });

  const personaListContainer = el('div', { className: 'wa-persona-list-container' });

  // Search input if > 6 participants
  /** @type {HTMLInputElement | null} */
  let searchInput = null;
  if (participantList.length > 6) {
    const searchWrapper = el('div', { className: 'wa-persona-search-wrapper' });
    const searchIcon = createIcon('search', { width: 16, height: 16, className: 'wa-search-icon' });
    searchInput = /** @type {HTMLInputElement} */ (
      el('input', {
        type: 'search',
        placeholder: 'Search participants...',
        className: 'wa-persona-search-input',
        aria: { label: 'Search participants' },
      })
    );
    searchWrapper.append(searchIcon, searchInput);
    step1.append(step1Desc, searchWrapper);
  } else {
    step1.appendChild(step1Desc);
  }

  const personaGrid = el('div', { className: 'wa-persona-grid', role: 'radiogroup' });

  /** @type {HTMLElement[]} */
  const personaCards = [];

  participantList.forEach((participant, idx) => {
    const isSelected = idx === 0;
    const [gradStart, gradEnd] = getAvatarGradient(participant.raw);

    const avatar = el('div', {
      className: 'wa-persona-avatar',
      style: `background: linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
      text: (participant.displayName[0] || '?').toUpperCase(),
    });

    const info = el(
      'div',
      { className: 'wa-persona-info' },
      el('span', { className: 'wa-persona-name', text: participant.displayName }),
      el('span', {
        className: 'wa-persona-count',
        text: `${participant.messageCount.toLocaleString()} messages`,
      }),
    );

    const checkmark = el(
      'div',
      { className: 'wa-persona-check' },
      createIcon('check', { width: 14, height: 14, className: 'wa-persona-check-icon' }),
    );

    const cardEl = el(
      'button',
      {
        className: `wa-persona-card ${isSelected ? 'selected' : ''}`,
        type: 'button',
        role: 'radio',
        aria: { checked: String(isSelected) },
        dataset: { name: participant.displayName.toLowerCase() },
      },
      avatar,
      info,
      checkmark,
    );

    cardEl.addEventListener('click', () => {
      personaCards.forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      cardEl.classList.add('selected');
      cardEl.setAttribute('aria-checked', 'true');
      selectedPersona = participant.raw;
      updateStep1ConsentState();
    });

    personaCards.push(cardEl);
    personaGrid.appendChild(cardEl);
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput?.value.trim().toLowerCase() || '';
      personaCards.forEach((c) => {
        const name = c.dataset.name || '';
        c.style.display = name.includes(q) ? 'flex' : 'none';
      });
    });
  }

  personaListContainer.appendChild(personaGrid);
  step1.appendChild(personaListContainer);

  // Legal consent checkbox with custom styling
  const consentBox = el('div', { className: 'wa-setup-consent-box' });
  const consentLabel = el('label', {
    htmlFor: 'wa-legal-consent-cb',
    className: 'wa-custom-checkbox-label',
  });
  const consentCheckbox = /** @type {HTMLInputElement} */ (
    el('input', {
      type: 'checkbox',
      id: 'wa-legal-consent-cb',
      className: 'wa-custom-checkbox-input',
      aria: { label: 'Acknowledge lawful chat use, Privacy Policy and Terms' },
    })
  );
  consentCheckbox.checked = true;

  const customBox = el('span', { className: 'wa-custom-checkbox-box' });
  const consentText = el(
    'span',
    { className: 'wa-consent-text' },
    el('span', { text: "I'm using a chat I'm part of, and I've read the " }),
    el('a', {
      href: 'privacy.html',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'wa-legal-link',
      text: 'Privacy Policy',
    }),
    el('span', { text: ' and ' }),
    el('a', {
      href: 'terms.html',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'wa-legal-link',
      text: 'Terms',
    }),
    el('span', { text: '.' }),
  );

  consentLabel.append(consentCheckbox, customBox, consentText);
  consentBox.appendChild(consentLabel);
  step1.appendChild(consentBox);

  // =========================================================================
  // STEP 2: Make it yours
  // =========================================================================
  const step2 = el('div', { className: 'wa-setup-step wa-setup-step-2', style: 'display: none;' });

  // Theme section: 2 live preview cards with label BELOW card
  const themeSection = el('div', { className: 'wa-setup-section' });
  const themeLabel = el('span', { className: 'wa-section-heading', text: 'Theme' });
  const themeGrid = el('div', { className: 'wa-theme-preview-grid', role: 'radiogroup' });

  // Light Theme Preview Card
  const lightPreviewBox = el(
    'div',
    { className: 'wa-theme-preview-box wa-preview-light' },
    el('div', { className: 'wa-preview-header' }, el('span', { text: 'Maya' })),
    el('div', { className: 'wa-preview-bubble-in', text: 'Hey there' }),
    el('div', { className: 'wa-preview-bubble-out', text: 'See you there!' }),
  );
  const lightCard = el(
    'button',
    {
      className: 'wa-theme-card selected',
      type: 'button',
      role: 'radio',
      aria: { checked: 'true' },
    },
    lightPreviewBox,
    el('span', { className: 'wa-theme-name', text: 'WhatsApp Light' }),
  );

  // Dark Theme Preview Card
  const darkPreviewBox = el(
    'div',
    { className: 'wa-theme-preview-box wa-preview-dark' },
    el('div', { className: 'wa-preview-header' }, el('span', { text: 'Maya' })),
    el('div', { className: 'wa-preview-bubble-in', text: 'Hey there' }),
    el('div', { className: 'wa-preview-bubble-out', text: 'See you there!' }),
  );
  const darkCard = el(
    'button',
    {
      className: 'wa-theme-card',
      type: 'button',
      role: 'radio',
      aria: { checked: 'false' },
    },
    darkPreviewBox,
    el('span', { className: 'wa-theme-name', text: 'WhatsApp Dark' }),
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

  themeGrid.append(lightCard, darkCard);
  themeSection.append(themeLabel, themeGrid);

  // Speed Segmented Control
  const speedSection = el('div', { className: 'wa-setup-section' });
  const speedLabel = el('span', { className: 'wa-section-heading', text: 'Replay Speed' });
  const speedSegment = el('div', { className: 'wa-segmented-control', role: 'radiogroup' });
  const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
  /** @type {HTMLElement[]} */
  const speedBtns = [];

  SPEEDS.forEach((s) => {
    const btn = el('button', {
      className: `wa-segment-btn ${s === 1 ? 'selected' : ''}`,
      type: 'button',
      role: 'radio',
      aria: { checked: String(s === 1) },
      text: `${s}×`,
    });

    btn.addEventListener('click', () => {
      speedBtns.forEach((b) => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      selectedSpeed = s;
    });

    speedBtns.push(btn);
    speedSegment.appendChild(btn);
  });

  speedSection.append(speedLabel, speedSegment);

  step2.append(themeSection, speedSection);

  // Date format toggle: show ONLY when detection confidence is low or ambiguous
  const firstMsg = chat.messages[0];
  const lastMsg = chat.messages[chat.messages.length - 1];
  const hasLowDateConfidence =
    chat.dateConfidence < 0.8 ||
    (firstMsg && lastMsg && new Date(firstMsg.timestamp).getFullYear() < 2005);

  if (hasLowDateConfidence && firstMsg && lastMsg) {
    const dateToggleBox = el('div', { className: 'wa-date-format-card' });
    const dateHeader = el('span', {
      className: 'wa-date-card-title',
      text: 'Date Format Confirmation',
    });

    const dateToggleBtn = el(
      'button',
      {
        className: 'wa-date-switch-btn',
        type: 'button',
        aria: { label: 'Switch between Day/Month and Month/Day date order' },
      },
      el('span', { className: 'wa-date-switch-title', text: 'Swap Day and Month (DD/MM ↔ MM/DD)' }),
      el('span', {
        className: 'wa-date-preview-range',
        text: `First: ${formatDateChip(firstMsg.timestamp)} · Last: ${formatDateChip(lastMsg.timestamp)}`,
      }),
    );

    dateToggleBtn.addEventListener('click', () => {
      swapDateFormat = !swapDateFormat;
      dateToggleBtn.classList.toggle('active', swapDateFormat);
    });

    dateToggleBox.append(dateHeader, dateToggleBtn);
    step2.appendChild(dateToggleBox);
  }

  // =========================================================================
  // STEP 3: Ready
  // =========================================================================
  const step3 = el('div', { className: 'wa-setup-step wa-setup-step-3', style: 'display: none;' });

  const totalMsgs = chat.messages.length;
  const daysSpanned =
    firstMsg && lastMsg
      ? Math.max(1, Math.round((lastMsg.timestamp - firstMsg.timestamp) / (1000 * 60 * 60 * 24)))
      : 1;
  const summaryList = el('div', { className: 'wa-setup-summary-list' });

  /**
   * Dynamically renders Step 3 summary based on user selections
   */
  function updateStep3Summary() {
    summaryList.textContent = '';

    const selectedParticipant =
      participantList.find((p) => p.raw === selectedPersona) || participantList[0];
    const [gradStart, gradEnd] = getAvatarGradient(selectedParticipant?.raw || '');

    // 1. Replaying as
    const personaRow = el(
      'div',
      { className: 'wa-summary-item' },
      el('div', {
        className: 'wa-persona-avatar',
        style: `width: 38px; height: 38px; min-width: 38px; font-size: 14px; background: linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
        text: (selectedParticipant?.displayName[0] || '?').toUpperCase(),
      }),
      el(
        'div',
        { className: 'wa-summary-text' },
        el('span', {
          className: 'wa-summary-primary',
          text: `Replaying as ${selectedParticipant?.displayName}`,
        }),
        el('span', {
          className: 'wa-summary-secondary',
          text: 'Outgoing messages on right with double ticks',
        }),
      ),
    );

    // 2. Playback settings
    const themeName = selectedTheme === 'dark' ? 'WhatsApp Dark' : 'WhatsApp Light';
    const settingsRow = el(
      'div',
      { className: 'wa-summary-item' },
      el('div', { className: 'wa-summary-icon' }, createIcon('clock', { width: 20, height: 20 })),
      el(
        'div',
        { className: 'wa-summary-text' },
        el('span', {
          className: 'wa-summary-primary',
          text: `${themeName} · ${selectedSpeed}× speed`,
        }),
        el('span', {
          className: 'wa-summary-secondary',
          text: 'Dynamic typing simulation proportional to message length',
        }),
      ),
    );

    // 3. Messages & timeline
    const msgRow = el(
      'div',
      { className: 'wa-summary-item' },
      el('div', { className: 'wa-summary-icon' }, createIcon('message', { width: 20, height: 20 })),
      el(
        'div',
        { className: 'wa-summary-text' },
        el('span', {
          className: 'wa-summary-primary',
          text: `${totalMsgs.toLocaleString()} messages across ${daysSpanned} days`,
        }),
        el('span', {
          className: 'wa-summary-secondary',
          text:
            firstMsg && lastMsg
              ? `${formatDateChip(firstMsg.timestamp)} – ${formatDateChip(lastMsg.timestamp)}`
              : 'Full conversation history preserved',
        }),
      ),
    );

    summaryList.append(personaRow, settingsRow, msgRow);
  }

  // Initial render
  updateStep3Summary();

  const readyNote = el('p', {
    className: 'wa-ready-note',
    text: 'Your conversation will replay in an immersive view. Take a breath and travel back.',
  });

  step3.append(summaryList, readyNote);

  body.append(step1, step2, step3);

  // =========================================================================
  // Fixed Footer: The Primary Button ALWAYS stays visible in the fixed footer
  // =========================================================================
  const footer = el('div', { className: 'wa-setup-footer' });

  const backBtn = el(
    'button',
    {
      className: 'wa-nav-btn wa-nav-back',
      type: 'button',
      style: 'display: none;',
      aria: { label: 'Go back to previous step' },
    },
    createIcon('arrow-left', { width: 16, height: 16 }),
    el('span', { text: 'Back' }),
  );

  const nextBtn = el(
    'button',
    {
      className: 'wa-nav-btn wa-nav-next',
      type: 'button',
      aria: { label: 'Proceed to next step' },
    },
    el('span', { text: 'Next' }),
    createIcon('arrow-right', { width: 16, height: 16 }),
  );

  /**
   * Updates view when changing step
   * @param {number} newStep
   * @param {'forward' | 'backward'} [direction='forward']
   */
  function setStep(newStep, direction = 'forward') {
    currentStep = newStep;

    // Smooth Continuous progress bar update
    const stepPercents = ['33.33%', '66.66%', '100%'];
    progressFill.style.width = stepPercents[currentStep - 1] || '33.33%';
    progressContainer.setAttribute('aria-valuenow', String(currentStep));

    // When reaching step 3, refresh summary
    if (currentStep === 3) {
      updateStep3Summary();
    }

    // Animate steps
    const animClass = direction === 'forward' ? 'wa-slide-in-right' : 'wa-slide-in-left';

    step1.style.display = currentStep === 1 ? 'flex' : 'none';
    step2.style.display = currentStep === 2 ? 'flex' : 'none';
    step3.style.display = currentStep === 3 ? 'flex' : 'none';

    const activeEl = currentStep === 1 ? step1 : currentStep === 2 ? step2 : step3;
    activeEl.classList.remove('wa-slide-in-right', 'wa-slide-in-left');
    // Force reflow
    void activeEl.offsetWidth;
    activeEl.classList.add(animClass);

    // Scroll body back to top on step change
    body.scrollTop = 0;

    // Update buttons & titles
    backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

    const nextTitle =
      currentStep === 1 ? 'Who are you?' : currentStep === 2 ? 'Make it yours' : 'Ready';
    titleHandle = retext(title, titleHandle, nextTitle, {
      effect: 'blur',
      animateBy: 'words',
      trigger: 'load',
      delay: 40,
      duration: 450,
    });

    if (currentStep === 1) {
      nextBtn.className = 'wa-nav-btn wa-nav-next';
      nextBtn.textContent = '';
      nextBtn.append(
        el('span', { text: 'Next' }),
        createIcon('arrow-right', { width: 16, height: 16 }),
      );
      updateStep1ConsentState();
    } else if (currentStep === 2) {
      nextBtn.disabled = false;
      nextBtn.removeAttribute('aria-disabled');
      nextBtn.className = 'wa-nav-btn wa-nav-next';
      nextBtn.textContent = '';
      nextBtn.append(
        el('span', { text: 'Next' }),
        createIcon('arrow-right', { width: 16, height: 16 }),
      );
    } else {
      nextBtn.disabled = false;
      nextBtn.removeAttribute('aria-disabled');
      nextBtn.className = 'wa-nav-btn wa-nav-travel';
      nextBtn.textContent = '';
      nextBtn.append(
        createIcon('play', { width: 16, height: 16 }),
        el('span', { text: 'Travel back' }),
      );
    }
  }

  function updateStep1ConsentState() {
    if (currentStep === 1) {
      const isChecked = consentCheckbox.checked;
      const hasPersona = Boolean(selectedPersona);
      const canProceed = isChecked && hasPersona;
      nextBtn.disabled = !canProceed;
      if (!canProceed) {
        nextBtn.classList.add('disabled');
        nextBtn.setAttribute('aria-disabled', 'true');
      } else {
        nextBtn.classList.remove('disabled');
        nextBtn.removeAttribute('aria-disabled');
      }
    }
  }

  // Initial validation for step 1
  updateStep1ConsentState();

  consentCheckbox.addEventListener('change', () => {
    try {
      if (consentCheckbox.checked) {
        localStorage.setItem('rewhatsapp_legal_consent_v1', 'true');
      }
    } catch {
      // Ignore
    }
    updateStep1ConsentState();
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      setStep(currentStep - 1, 'backward');
    }
  });

  nextBtn.addEventListener('click', () => {
    if (!consentCheckbox.checked) {
      consentCheckbox.focus();
      return;
    }
    if (!selectedPersona) {
      return;
    }

    try {
      localStorage.setItem('rewhatsapp_legal_consent_v1', 'true');
    } catch {
      // Ignore fallback
    }

    overlay.remove();
    onStartReplay({
      userPersonaRaw: selectedPersona,
      theme: selectedTheme,
      gapMode: selectedGapMode,
      speed: selectedSpeed,
      swapDateFormat,
    });
  });

  footer.append(backBtn, nextBtn);

  // Visible Keyboard Hints Row
  const keyboardHints = el(
    'div',
    { className: 'wa-setup-keyboard-hints', aria: { hidden: 'true' } },
    el('span', {}, el('kbd', { text: 'Tab' }), ' to navigate'),
    el('span', {}, el('kbd', { text: 'Enter' }), ' to select/proceed'),
    el('span', {}, el('kbd', { text: 'Esc' }), ' to close'),
  );

  card.append(header, body, footer, keyboardHints);
  overlay.appendChild(card);

  // Close & Cancel handling with focus return
  function handleClose() {
    overlay.remove();
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
    onCancel();
  }

  closeBtn.addEventListener('click', handleClose);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      handleClose();
    }
  });

  // Focus Trapping and Keyboard navigation
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableEls = card.querySelectorAll(
        'button:not([disabled]):not([style*="display: none"]), input:not([disabled]):not([style*="display: none"]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusableEls.length === 0) return;

      const firstEl = /** @type {HTMLElement} */ (focusableEls[0]);
      const lastEl = /** @type {HTMLElement} */ (focusableEls[focusableEls.length - 1]);

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  updateStep1ConsentState();

  // Focus the first action on mount
  setTimeout(() => {
    if (!nextBtn.disabled) {
      nextBtn.focus();
    } else {
      consentCheckbox.focus();
    }
  }, 100);

  return overlay;
}
