// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';

/**
 * Creates the staged product shot centerpiece for the rewhatsapp home page:
 * - Staged setup: soft warm radial spotlight, rounded plinth/backdrop panel, gentle ground shadow.
 * - Premium neutral phone frame (thin bezel, dynamic island, volume & power side buttons).
 * - Full WhatsApp-faithful UI: status bar, contact header, calm wallpaper, messages, composer, and scrubber.
 * - Always renders a complete 4-message poster frame on first paint (never blank or empty).
 * - Compact mobile height (max ~440px) with bottom soft crop/fade.
 * - Date ticker pinned inside device top (no floating detachment or collision).
 * - Orbiting floating annotation chips (max 2 visible on mobile).
 * - Looping ~25-second Maya Chen & Leo Silva narrative.
 * - Stage caption includes the rotating emotional line.
 *
 * @returns {{
 *   element: HTMLElement;
 *   captionEl: HTMLElement;
 *   rollTickerBackward: (durationMs?: number) => Promise<void>;
 *   destroy: () => void;
 * }}
 */
export function createPhoneMockup() {
  // Main stage wrapper
  const stage = el('div', { className: 'wa-hero-stage' });

  // 1. Soft warm radial spotlight behind phone
  const spotlight = el('div', { className: 'wa-stage-spotlight', aria: { hidden: 'true' } });

  // 2. Rounded plinth / backdrop panel
  const plinth = el('div', { className: 'wa-stage-plinth', aria: { hidden: 'true' } });

  // 3. Gentle ground shadow
  const groundShadow = el('div', { className: 'wa-stage-ground-shadow', aria: { hidden: 'true' } });

  // Stage content wrapper (for parallax tilt)
  const phoneWrapper = el('div', { className: 'wa-phone-stage-wrapper' });

  // Phone Frame
  const phone = el('div', { className: 'wa-phone-frame' });

  // Side buttons on phone frame
  const btnVolUp = el('div', {
    className: 'wa-phone-btn wa-phone-btn-vol-up',
    aria: { hidden: 'true' },
  });
  const btnVolDown = el('div', {
    className: 'wa-phone-btn wa-phone-btn-vol-down',
    aria: { hidden: 'true' },
  });
  const btnPower = el('div', {
    className: 'wa-phone-btn wa-phone-btn-power',
    aria: { hidden: 'true' },
  });
  phone.append(btnVolUp, btnVolDown, btnPower);

  // Dynamic Island with realistic lens reflection
  const island = el(
    'div',
    { className: 'wa-phone-island' },
    el('div', { className: 'wa-island-lens' }),
  );

  // Status Bar (Using SVG signal bars to avoid text < 12px)
  const signalSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  signalSvg.setAttribute('viewBox', '0 0 16 12');
  signalSvg.setAttribute('width', '14');
  signalSvg.setAttribute('height', '10');
  signalSvg.setAttribute('fill', 'currentColor');
  signalSvg.setAttribute('aria-hidden', 'true');
  signalSvg.innerHTML =
    '<rect x="1" y="9" width="2.2" height="3" rx="0.5"/><rect x="5" y="6" width="2.2" height="6" rx="0.5"/><rect x="9" y="3" width="2.2" height="9" rx="0.5"/><rect x="13" y="0" width="2.2" height="12" rx="0.5"/>';

  const statusBar = el(
    'div',
    { className: 'wa-phone-status-bar' },
    el('span', { className: 'wa-status-time', text: '9:41' }),
    el(
      'div',
      { className: 'wa-status-icons' },
      signalSvg,
      el('span', { className: 'wa-status-pill' }),
    ),
  );

  // Date Ticker: Pinned cleanly inside the top of the chat area (Brief v6: no separate floating chip)
  const tickerContainer = el('div', {
    className: 'wa-date-ticker wa-date-ticker-pinned',
    aria: { live: 'polite', label: 'Timeline date' },
  });
  const tickerIcon = createIcon('clock', { width: 13, height: 13, className: 'wa-ticker-icon' });
  const tickerDate = el('span', { className: 'wa-ticker-date', text: '14 Feb 2024' });
  tickerContainer.append(tickerIcon, tickerDate);

  // Authentic WhatsApp Header with Back Arrow, Avatar, Maya Chen, and Call/Menu Icons
  const backBtn = el(
    'div',
    { className: 'wa-mini-back-btn', aria: { hidden: 'true' } },
    createIcon('arrow-left', { width: 14, height: 14 }),
  );
  const miniAvatar = el(
    'div',
    { className: 'wa-mini-avatar' },
    el('span', { text: 'M' }),
    el('span', { className: 'wa-mini-avatar-status' }),
  );
  const miniName = el('span', { className: 'wa-mini-name', text: 'Maya Chen' });
  const miniStatus = el('span', { className: 'wa-mini-status', text: 'online' });
  const headerActions = el(
    'div',
    { className: 'wa-mini-header-actions' },
    createIcon('video', { width: 14, height: 14, className: 'wa-mini-action-icon' }),
    createIcon('phone', { width: 13, height: 13, className: 'wa-mini-action-icon' }),
    createIcon('more-vertical', { width: 13, height: 13, className: 'wa-mini-action-icon' }),
  );

  const miniHeader = el(
    'div',
    { className: 'wa-mini-header' },
    el(
      'div',
      { className: 'wa-mini-profile-wrap' },
      backBtn,
      el(
        'div',
        { className: 'wa-mini-profile' },
        miniAvatar,
        el('div', { className: 'wa-mini-meta' }, miniName, miniStatus),
      ),
    ),
    headerActions,
  );

  // Chat Canvas with calm wallpaper
  const chatArea = el('div', { className: 'wa-mini-chat' });

  // Date chip inside chat
  const dateChip = el('div', {
    className: 'wa-mini-date-chip',
    text: '14 February 2024',
  });

  // In-chat typing indicator bubble
  const typingBubble = el(
    'div',
    {
      className: 'wa-mini-typing-bubble incoming',
      style: 'display: none;',
      aria: { hidden: 'true' },
    },
    el('span', { className: 'wa-typing-dot' }),
    el('span', { className: 'wa-typing-dot' }),
    el('span', { className: 'wa-typing-dot' }),
  );

  // Mini WhatsApp Composer (never blank)
  const miniComposer = el(
    'div',
    { className: 'wa-mini-composer', aria: { hidden: 'true' } },
    el('div', { className: 'wa-mini-composer-emoji' }, el('span', { text: '😊' })),
    el('div', { className: 'wa-mini-composer-input' }, el('span', { text: 'Message' })),
    el(
      'div',
      { className: 'wa-mini-composer-mic' },
      createIcon('mic', { width: 14, height: 14, className: 'wa-mini-mic-icon' }),
    ),
  );

  // Bottom Scrubber Bar with emotion sparkline
  const scrubberContainer = el('div', { className: 'wa-mini-scrubber-container' });
  const scrubberSparklineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  scrubberSparklineSvg.setAttribute('class', 'wa-mini-sparkline');
  scrubberSparklineSvg.setAttribute('viewBox', '0 0 240 16');
  scrubberSparklineSvg.setAttribute('preserveAspectRatio', 'none');

  const sparklinePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  sparklinePath.setAttribute('d', 'M 0,12 Q 30,5 60,9 T 120,4 T 160,13 T 200,5 T 240,9');
  sparklinePath.setAttribute('fill', 'none');
  sparklinePath.setAttribute('stroke', 'rgba(217, 119, 87, 0.4)');
  sparklinePath.setAttribute('stroke-width', '1.5');
  scrubberSparklineSvg.appendChild(sparklinePath);

  const scrubberTrack = el('div', { className: 'wa-mini-scrubber-track' });
  const scrubberFill = el('div', { className: 'wa-mini-scrubber-fill' });
  scrubberTrack.appendChild(scrubberFill);
  scrubberContainer.append(scrubberSparklineSvg, scrubberTrack);

  phone.append(
    island,
    statusBar,
    miniHeader,
    tickerContainer,
    chatArea,
    miniComposer,
    scrubberContainer,
  );
  phoneWrapper.append(phone);

  // Orbiting Floating Annotation Chips (Max 2 visible on mobile via CSS)
  const chipsLayer = el('div', { className: 'wa-stage-chips-layer' });
  const chipTyping = createStageChip('typing', 'zap', 'Typing…', 'chip-pos-top-left');
  const chipRead = createStageChip('read', 'check', 'Read ✓✓', 'chip-pos-mid-right');
  const chipTimeSkip = createStageChip('skip', 'clock', '3 days later', 'chip-pos-mid-left');
  const chipLateNight = createStageChip('late', 'clock', '2:03 AM', 'chip-pos-bottom-right');
  chipsLayer.append(chipTyping, chipRead, chipTimeSkip, chipLateNight);

  // Stage caption below with rotating emotional line (Brief v6)
  const stageCaption = el('p', { className: 'wa-stage-caption' });
  const captionLead = el('span', { className: 'wa-caption-lead', text: 'A sample memory. ' });
  const captionRotating = el('span', {
    className: 'wa-caption-rotating-line',
    text: 'With that friend who moved away.',
  });
  stageCaption.append(captionLead, captionRotating);

  stage.append(spotlight, plinth, groundShadow, chipsLayer, phoneWrapper, stageCaption);

  // Render initial poster frame immediately (never empty!)
  renderPosterFrame();

  // Desktop Pointer Parallax (tilt <= 4deg)
  if (typeof window !== 'undefined') {
    stage.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 1024) return;
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = Math.max(-4, Math.min(4, (-y / rect.height) * 8));
      const tiltY = Math.max(-4, Math.min(4, (x / rect.width) * 8));
      phoneWrapper.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    stage.addEventListener('mouseleave', () => {
      phoneWrapper.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // State Management
  let isDestroyed = false;
  let isPaused = false;
  /** @type {any} */
  let loopTimer = null;

  /** @param {number} ms */
  const sleep = (ms) =>
    new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if (isDestroyed) return resolve(undefined);
        if (isPaused) {
          setTimeout(check, 100);
          return;
        }
        if (Date.now() - start >= ms) {
          resolve(undefined);
        } else {
          setTimeout(check, 50);
        }
      };
      setTimeout(check, 50);
    });

  /**
   * Renders at least 4 messages immediately as the poster frame
   */
  function renderPosterFrame() {
    chatArea.innerHTML = '';
    dateChip.style.opacity = '1';
    chatArea.appendChild(dateChip);
    chatArea.appendChild(typingBubble);
    typingBubble.style.display = 'none';

    const p1 = createMockupBubble("Hey Maya. It's Leo. Found your sketchbook 🌧️", true, '9:05 PM');
    const p2 = createMockupBubble(
      'You saved my entire semester! 🙈 Coffee tomorrow?',
      false,
      '9:07 PM',
    );
    const p3 = createMockupBubble("8:30 at Cafe Nervosa. It's a date! ☕🤝", true, '9:08 PM');
    const p4 = createMockupBubble(
      'Bringing your favorite cinnamon croissants 🥐',
      false,
      '9:09 PM',
    );

    turnTicksBlue(p1);
    turnTicksBlue(p3);

    chatArea.insertBefore(p1, typingBubble);
    chatArea.insertBefore(p2, typingBubble);
    chatArea.insertBefore(p3, typingBubble);
    chatArea.insertBefore(p4, typingBubble);

    scrubberFill.style.width = '48%';
    miniStatus.textContent = 'online';
    tickerDate.textContent = '14 Feb 2024';
  }

  /**
   * Whirls the date ticker backward smoothly
   * @param {number} durationMs
   */
  async function rollTickerBackward(durationMs = 900) {
    const dates = [
      'Today, 11:24 PM',
      'Yesterday, 4:15 PM',
      '18 Feb 2024',
      '16 Feb 2024',
      '15 Feb 2024',
      '14 Feb 2024',
    ];
    const stepTime = Math.max(30, durationMs / dates.length);
    for (const d of dates) {
      if (isDestroyed) break;
      tickerDate.textContent = d;
      tickerContainer.classList.add('whirling');
      await sleep(stepTime);
    }
    tickerContainer.classList.remove('whirling');

    // Bloom pulse on arrival
    const bloom = el('div', { className: 'wa-date-bloom' });
    tickerContainer.appendChild(bloom);
    bloom.animate(
      [
        { opacity: 0, transform: 'scale(0.96)' },
        { opacity: 0.75, transform: 'scale(1.03)' },
        { opacity: 0, transform: 'scale(1.08)' },
      ],
      { duration: 400, easing: 'ease-out' },
    );
    await sleep(400);
    bloom.remove();
  }

  /**
   * Shows an annotation chip with smooth entrance
   * @param {HTMLElement} chipEl
   */
  function showChip(chipEl) {
    chipEl.classList.add('is-visible');
    const textEl = chipEl.querySelector('.wa-chip-text');
    if (textEl instanceof HTMLElement && textEl.dataset.original) {
      textEl.textContent = textEl.dataset.original;
    }
  }

  /**
   * Hides an annotation chip
   * @param {HTMLElement} chipEl
   */
  function hideChip(chipEl) {
    chipEl.classList.remove('is-visible');
  }

  function hideAllChips() {
    hideChip(chipTyping);
    hideChip(chipRead);
    hideChip(chipTimeSkip);
    hideChip(chipLateNight);
  }

  /**
   * Pause animation when phone is scrolled out of viewport.
   */
  if (typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'undefined') {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isPaused = !entry.isIntersecting;
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(stage);
  }

  /**
   * Runs the rich ~25-second looping narrative in the phone mockup.
   */
  async function runReplayCycle() {
    if (isDestroyed) return;

    // Check reduced motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      renderPosterFrame();
      return;
    }

    // Reset chat DOM and chips
    chatArea.innerHTML = '';
    dateChip.style.opacity = '0';
    chatArea.appendChild(dateChip);
    chatArea.appendChild(typingBubble);
    typingBubble.style.display = 'none';
    miniStatus.textContent = 'online';
    scrubberFill.style.width = '0%';
    hideAllChips();

    // 1. Roll backward
    await rollTickerBackward(900);
    if (isDestroyed) return;

    // 2. Reveal initial date chip
    dateChip.style.transition = 'opacity 300ms ease';
    dateChip.style.opacity = '1';
    await sleep(500);
    if (isDestroyed) return;

    // Story Beat 1: Leo speaks (outgoing)
    const b1 = createMockupBubble("Hey Maya. It's Leo. Found your sketchbook 🌧️", true, '9:05 PM');
    chatArea.insertBefore(b1, typingBubble);
    animateBubbleEntrance(b1);
    scrubberFill.style.width = '12%';
    await sleep(400);
    turnTicksBlue(b1);
    showChip(chipRead);
    await sleep(900);
    if (isDestroyed) return;

    // Story Beat 2: Maya types...
    setTypingState(true);
    showChip(chipTyping);
    await sleep(1200);
    if (isDestroyed) return;
    setTypingState(false);
    hideChip(chipTyping);

    const b2 = createMockupBubble(
      'You saved my entire semester! 🙈 Coffee tomorrow?',
      false,
      '9:07 PM',
    );
    chatArea.insertBefore(b2, typingBubble);
    animateBubbleEntrance(b2);
    scrubberFill.style.width = '24%';
    await sleep(1000);
    if (isDestroyed) return;

    // Story Beat 3: Leo accepts
    const b3 = createMockupBubble("8:30 at Cafe Nervosa. It's a date! ☕🤝", true, '9:08 PM');
    chatArea.insertBefore(b3, typingBubble);
    animateBubbleEntrance(b3);
    scrubberFill.style.width = '36%';
    await sleep(350);
    turnTicksBlue(b3);
    await sleep(900);
    if (isDestroyed) return;

    // Story Beat 4: Maya answers
    const b4 = createMockupBubble(
      'Bringing your favorite cinnamon croissants 🥐',
      false,
      '9:09 PM',
    );
    chatArea.insertBefore(b4, typingBubble);
    animateBubbleEntrance(b4);
    scrubberFill.style.width = '48%';
    await sleep(1200);
    hideChip(chipRead);
    if (isDestroyed) return;

    // Story Beat 5: Time Skip (3 days later)
    showChip(chipTimeSkip);
    const timeSkipPill = createTimeSkipPill('3 days later · 17 Feb 2024');
    chatArea.insertBefore(timeSkipPill, typingBubble);
    animateBubbleEntrance(timeSkipPill);
    tickerDate.textContent = '17 Feb 2024';
    scrubberFill.style.width = '62%';
    await sleep(1400);
    hideChip(chipTimeSkip);
    if (isDestroyed) return;

    // Story Beat 6: Late night audio note
    showChip(chipLateNight);
    tickerDate.textContent = '17 Feb · 2:03 AM';
    const voiceNote = createVoiceNoteBubble(true, '2:03 AM', '0:24');
    chatArea.insertBefore(voiceNote, typingBubble);
    animateBubbleEntrance(voiceNote);
    scrubberFill.style.width = '76%';
    await sleep(500);
    turnTicksBlue(voiceNote);
    await sleep(1400);
    hideChip(chipLateNight);
    if (isDestroyed) return;

    // Story Beat 7: Maya laughs
    setTypingState(true);
    await sleep(1100);
    if (isDestroyed) return;
    setTypingState(false);

    const b5 = createMockupBubble('Listening on repeat... goodnight Leo ✨😴', false, '2:05 AM');
    chatArea.insertBefore(b5, typingBubble);
    animateBubbleEntrance(b5);
    scrubberFill.style.width = '92%';
    await sleep(2200);
    if (isDestroyed) return;

    // Hold final warm scene
    scrubberFill.style.width = '100%';
    await sleep(3000);
    if (isDestroyed) return;

    // Loop
    runReplayCycle();
  }

  /**
   * Sets typing indicator in chat and status bar
   * @param {boolean} isTyping
   */
  function setTypingState(isTyping) {
    if (isTyping) {
      typingBubble.style.display = 'inline-flex';
      miniStatus.textContent = 'typing…';
      miniStatus.classList.add('typing');
      chatArea.scrollTop = chatArea.scrollHeight;
    } else {
      typingBubble.style.display = 'none';
      miniStatus.textContent = 'online';
      miniStatus.classList.remove('typing');
    }
  }

  /**
   * Creates a mock message bubble
   * @param {string} text
   * @param {boolean} isOutgoing
   * @param {string} time
   */
  function createMockupBubble(text, isOutgoing, time) {
    const bubble = el('div', {
      className: `wa-mini-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`,
    });
    const bubbleText = el('div', { className: 'wa-mini-bubble-text', text });
    const footer = el('div', { className: 'wa-mini-bubble-footer' });
    const timeEl = el('span', { className: 'wa-mini-bubble-time', text: time });
    footer.appendChild(timeEl);

    if (isOutgoing) {
      const ticks = el('span', { className: 'wa-mini-bubble-ticks grey', text: '✓✓' });
      footer.appendChild(ticks);
    }

    bubble.append(bubbleText, footer);
    return bubble;
  }

  /**
   * Creates a mock voice note bubble
   * @param {boolean} isOutgoing
   * @param {string} time
   * @param {string} duration
   */
  function createVoiceNoteBubble(isOutgoing, time, duration) {
    const bubble = el('div', {
      className: `wa-mini-bubble wa-mini-audio-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`,
    });

    const playBtn = el(
      'div',
      { className: 'wa-mini-audio-play' },
      createIcon('play', { width: 12, height: 12 }),
    );

    const waveformSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    waveformSvg.setAttribute('class', 'wa-mini-audio-waveform');
    waveformSvg.setAttribute('viewBox', '0 0 100 24');
    waveformSvg.setAttribute('preserveAspectRatio', 'none');

    const bars = [4, 8, 14, 18, 12, 6, 16, 20, 15, 8, 12, 17, 10, 5, 14, 19, 13, 7, 15, 11];
    bars.forEach((h, i) => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(i * 5));
      rect.setAttribute('y', String((24 - h) / 2));
      rect.setAttribute('width', '2.5');
      rect.setAttribute('height', String(h));
      rect.setAttribute('rx', '1');
      rect.setAttribute('fill', isOutgoing ? '#008069' : '#8696a0');
      waveformSvg.appendChild(rect);
    });

    const audioMeta = el(
      'div',
      { className: 'wa-mini-audio-meta' },
      waveformSvg,
      el(
        'div',
        { className: 'wa-mini-bubble-footer' },
        el('span', { className: 'wa-mini-audio-duration', text: duration }),
        el('span', { className: 'wa-mini-bubble-time', text: time }),
        isOutgoing ? el('span', { className: 'wa-mini-bubble-ticks grey', text: '✓✓' }) : null,
      ),
    );

    bubble.append(playBtn, audioMeta);
    return bubble;
  }

  /**
   * Creates a mock time skip pill with clock icon
   * @param {string} text
   */
  function createTimeSkipPill(text) {
    return el(
      'div',
      { className: 'wa-mini-time-skip-pill' },
      createIcon('clock', { width: 12, height: 12, className: 'wa-mini-clock-sweep' }),
      el('span', { text }),
    );
  }

  /**
   * Animates a bubble entrance smoothly
   * @param {HTMLElement} bubble
   */
  function animateBubbleEntrance(bubble) {
    bubble.style.transition =
      'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(0)';
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  /**
   * Transitions ticks from grey to blue with scale pop
   * @param {HTMLElement} bubble
   */
  function turnTicksBlue(bubble) {
    const ticks = bubble.querySelector('.wa-mini-bubble-ticks');
    if (ticks) {
      ticks.classList.remove('grey');
      ticks.classList.add('blue');
      ticks.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
        { duration: 250, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)' },
      );
    }
  }

  /**
   * Creates an orbiting floating annotation chip with a hairline leader
   * @param {string} id
   * @param {string} iconName
   * @param {string} label
   * @param {string} posClass
   */
  function createStageChip(id, iconName, label, posClass) {
    const leader = el('div', { className: 'wa-chip-leader', aria: { hidden: 'true' } });
    const textEl = el('span', { className: 'wa-chip-text', text: label });
    textEl.dataset.original = label;
    const chipBody = el(
      'div',
      { className: 'wa-stage-chip-body' },
      createIcon(iconName, { width: 13, height: 13, className: 'wa-chip-icon' }),
      textEl,
    );

    return el('div', { className: `wa-stage-chip ${posClass} wa-chip-${id}` }, chipBody, leader);
  }

  // Start loop after an initial viewing of the complete poster frame
  loopTimer = setTimeout(() => {
    runReplayCycle();
  }, 2500);

  return {
    element: stage,
    captionEl: captionRotating,
    rollTickerBackward,
    destroy: () => {
      isDestroyed = true;
      if (loopTimer) clearTimeout(loopTimer);
    },
  };
}
