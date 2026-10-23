// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';
import { createPhoneMockup } from './phone-mockup.js';
import { createExportGuide } from './export-guide.js';
import { revealText, retext } from '../motion/text-reveal.js';
import { playSendSound, playReceiveSound } from '../../audio/synth.js';

/**
 * Creates the complete Home View conforming strictly to Brief v4, v5, and v6:
 * - Density, proportion, and rhythm pass (Brief v6).
 * - Exact 9-part editorial structure.
 * - 56px sticky blurred header (no theme toggle, no GitHub link).
 * - Compact mobile hero with first-screen fit (headline, body, CTAs, top ~40% of phone).
 * - Phone stage with poster frame on first paint, inside date ticker, max 2 chips on mobile, bottom fade.
 * - Rotating emotional line moved into the phone-stage caption.
 * - Compact list for "How it works" (<=420px mobile).
 * - Compact tabbed guide for "How to use it".
 * - Horizontal scroll-snap carousel for Features on mobile (cards <=220px), 2x2 bento on desktop.
 * - Single container for Privacy (no nested cards, compact stat row).
 * - 8-item FAQ accordion (one open at a time, 48-52px closed rows).
 * - Compact final CTA band ("Your chat is waiting.").
 * - Smart mobile sticky bottom bar with 1 primary button, hidden at top and over CTA/footer.
 * - Clean footer with CSS-only separators (no dangling dots).
 *
 * @param {Object} params
 * @param {() => void} params.onDemoSelected
 * @param {(file: File) => void} params.onFileSelected
 * @param {() => void} [params.onOpenPrivacy]
 * @returns {{
 *   element: HTMLElement;
 *   whirlDial: (durationMs?: number) => Promise<void>;
 *   travelTransition: (durationMs?: number) => Promise<void>;
 *   setParsingState: (fileName: string) => void;
 *   setErrorState: (msg: string) => void;
 *   resetUploadCard: () => void;
 *   destroy: () => void;
 * }}
 */
export function createHomeView({ onDemoSelected, onFileSelected, onOpenPrivacy }) {
  const container = el('div', { className: 'wa-home-container' });

  // 1. Subtle warm ambient radial background wash
  const ambientBg = el('div', { className: 'wa-home-ambient-bg', aria: { hidden: 'true' } });
  container.appendChild(ambientBg);

  // 2. Sticky Blurred Header (56px) with Navigation Anchors (No theme toggle, no GitHub link)
  const header = el('header', { className: 'wa-home-header' });
  const brand = el('a', {
    className: 'wa-brand-wordmark',
    href: '#',
    text: 'rewhatsapp',
    aria: { label: 'rewhatsapp home' },
  });

  const navLinks = el(
    'nav',
    { className: 'wa-header-nav', aria: { label: 'Main navigation' } },
    el('a', { className: 'wa-nav-link', href: '#why', text: 'Why' }),
    el('a', { className: 'wa-nav-link', href: '#how-it-works', text: 'How it works' }),
    el('a', { className: 'wa-nav-link', href: '#how-to-use', text: 'Guide' }),
    el('a', { className: 'wa-nav-link', href: '#features', text: 'Features' }),
    el('a', { className: 'wa-nav-link', href: '#privacy', text: 'Privacy' }),
    el('a', { className: 'wa-nav-link', href: '#faq', text: 'FAQ' }),
  );

  const headerActions = el('div', { className: 'wa-header-actions' });

  // "Watch sample" button in header (appears after hero scrolls away)
  const headerSampleBtn = el(
    'button',
    {
      className: 'wa-btn-primary wa-header-sample-btn',
      type: 'button',
      aria: { label: 'Watch sample memory' },
      style: 'opacity: 0; pointer-events: none; transition: opacity 200ms ease;',
    },
    createIcon('play', { width: 14, height: 14 }),
    el('span', { text: 'Watch sample' }),
  );
  headerSampleBtn.addEventListener('click', () => onDemoSelected());
  headerActions.appendChild(headerSampleBtn);

  header.append(brand, navLinks, headerActions);
  container.appendChild(header);

  // Scroll listener for liquid glass navbar and card stacking scale/fade
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    const cards = container.querySelectorAll('.wa-feature-card');
    if (cards.length > 0) {
      for (let i = 0; i < cards.length - 1; i++) {
        const nextCard = cards[i + 1];
        const nextRect = nextCard.getBoundingClientRect();
        if (nextRect.top <= 170) {
          cards[i].classList.add('wa-card-collapsed');
        } else {
          cards[i].classList.remove('wa-card-collapsed');
        }
      }
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // =========================================================================
  // SECTION 1: Hero (Copy left, Staged Phone right on desktop; Stacked on mobile)
  // =========================================================================
  const heroSection = el('main', { className: 'wa-home-hero' });
  const leftCol = el('div', { className: 'wa-hero-left' });

  // Glowing Pill Badge
  const eyebrow = el(
    'div',
    { className: 'wa-hero-badge' },
    el('span', { className: 'wa-badge-dot' }),
    el('span', { className: 'wa-badge-text', text: 'PRIVACY-FIRST' }),
    el('span', { className: 'wa-badge-sep', text: '·' }),
    el('span', { className: 'wa-badge-sub', text: '100% Offline Replayer' }),
  );

  // Headline: "Let's rewind those smiles." with silver text highlight and reveal
  const headlineEl = el(
    'h1',
    {
      className: 'wa-hero-headline',
      data: {
        reveal: 'blur',
        revealDir: 'top',
        revealBy: 'words',
        revealDelay: '90',
        revealTrigger: 'load',
      },
    },
    el('span', { text: "Let's rewind " }),
    el('span', { className: 'wa-text-silver', text: 'those smiles.' }),
  );

  // Body copy (max 3 lines, comfortable line height)
  const bodyCopy = el('p', {
    className: 'wa-hero-subcopy',
    text: 'Drop in an exported WhatsApp chat to replay it message by message — with the original typing cadence, pauses, and late-night replies. 100% private in your browser.',
  });

  // =========================================================================
  // Hero CTAs Row (One row on >=360px: Primary flex 1.3, Secondary flex 1.0, 44px)
  // =========================================================================
  const ctaGroup = el('div', { className: 'wa-hero-cta-group' });

  // Primary Action Button: "Select chat file" with Gold shimmer gradient
  const uploadBtn = el(
    'button',
    {
      className: 'wa-btn-primary wa-hero-cta-primary wa-btn-gold',
      type: 'button',
      aria: { label: 'Select WhatsApp chat export file' },
    },
    createIcon('upload', { width: 16, height: 16, className: 'wa-cta-upload-icon' }),
    el('span', { className: 'wa-btn-text-desktop', text: 'Select chat file' }),
    el('span', { className: 'wa-btn-text-mobile', text: 'Select chat file' }),
  );

  // Secondary Action Button: "Watch sample"
  const primarySampleBtn = el(
    'button',
    {
      className: 'wa-btn-secondary wa-hero-cta-secondary wa-sample-memory-btn',
      type: 'button',
      aria: { label: 'Watch a sample memory' },
    },
    createIcon('play', { width: 16, height: 16, className: 'wa-cta-play-icon' }),
    el('span', { className: 'wa-btn-text-desktop', text: 'Watch sample memory' }),
    el('span', { className: 'wa-btn-text-mobile', text: 'Watch sample' }),
  );
  primarySampleBtn.addEventListener('click', () => onDemoSelected());

  // Hidden Accessible File Input
  const fileInput = /** @type {HTMLInputElement} */ (
    el('input', {
      type: 'file',
      accept: '.txt,text/plain',
      className: 'visually-hidden',
      tabindex: '-1',
      aria: { label: 'Upload WhatsApp export file' },
    })
  );

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      setParsingState(file.name);
      onFileSelected(file);
    }
  });

  ctaGroup.append(uploadBtn, primarySampleBtn, fileInput);

  // One-line trust microcopy (12px)
  const trustMicroline = el(
    'div',
    { className: 'wa-hero-trust-badge' },
    createIcon('shield', { width: 13, height: 13, className: 'wa-trust-icon' }),
    el('span', { text: '100% offline · Your data never leaves your device' }),
  );

  leftCol.append(eyebrow, headlineEl, bodyCopy, ctaGroup, trustMicroline);

  // Right Column: Staged Product Shot Phone Preview (with rotating line in caption)
  const rightCol = el('div', { className: 'wa-hero-right' });
  const phoneMockup = createPhoneMockup();
  rightCol.appendChild(phoneMockup.element);

  heroSection.append(leftCol, rightCol);
  container.appendChild(heroSection);

  // Rotating emotional lines in the phone-stage caption (Brief v6)
  const EMOTIONAL_LINES = [
    'With that friend who moved away.',
    'With the one who texted you until 3 AM.',
    'With someone who never stopped making you laugh.',
    'With the group chat from that unforgettable summer.',
    'With words you never want to forget.',
  ];

  /** @type {import('../motion/text-reveal.js').RevealHandle} */
  let rotatingHandle = revealText(phoneMockup.captionEl, {
    effect: 'focus',
    animateBy: 'words',
    trigger: 'load',
  });

  let emotionalIndex = 0;
  const lineTimer = setInterval(() => {
    emotionalIndex = (emotionalIndex + 1) % EMOTIONAL_LINES.length;
    const nextLine = EMOTIONAL_LINES[emotionalIndex] || '';
    rotatingHandle = retext(phoneMockup.captionEl, rotatingHandle, nextLine, {
      effect: 'focus',
      animateBy: 'words',
      trigger: 'load',
      duration: 500,
    });
  }, 4500);

  // Upload feedback state helpers
  /** @param {string} fileName */
  function setParsingState(fileName) {
    uploadBtn.disabled = true;
    const span = uploadBtn.querySelector('.wa-btn-text-desktop') || uploadBtn.querySelector('span');
    if (span) span.textContent = `Reading ${fileName.slice(0, 16)}...`;
  }

  /** @param {string} msg */
  function setErrorState(msg) {
    uploadBtn.disabled = false;
    const span = uploadBtn.querySelector('.wa-btn-text-desktop') || uploadBtn.querySelector('span');
    if (span) span.textContent = `Error: ${msg.slice(0, 20)}`;
  }

  function resetUploadCard() {
    uploadBtn.disabled = false;
    const desktopSpan = uploadBtn.querySelector('.wa-btn-text-desktop');
    const mobileSpan = uploadBtn.querySelector('.wa-btn-text-mobile');
    if (desktopSpan) desktopSpan.textContent = 'Select chat file';
    if (mobileSpan) mobileSpan.textContent = 'Select chat file';
    fileInput.value = '';
  }

  // =========================================================================
  // SECTION 2: "Why rewhatsapp exists" (Editorial motive & intention)
  // =========================================================================
  const whySection = el('section', {
    id: 'why',
    className: 'wa-section wa-why-section wa-reveal-item',
  });

  const whyContent = el(
    'div',
    { className: 'wa-why-editorial-layout' },
    el(
      'div',
      { className: 'wa-section-header' },
      el('span', { className: 'wa-section-eyebrow', text: 'THE MOTIVE' }),
      el('h2', {
        className: 'wa-section-title',
        text: 'Because chats are stories, not spreadsheets.',
        data: {
          reveal: 'blur',
          revealDir: 'bottom',
          revealDelay: '60',
        },
      }),
    ),
    el('blockquote', {
      className: 'wa-why-pull-quote',
      text: 'When someone you love sends a message, you didn’t just read words. You waited, watched them type, felt the pause.',
      data: {
        reveal: 'drift',
      },
    }),
    el('p', {
      className: 'wa-why-body-paragraph',
      text: 'WhatsApp exports are plain text files — timestamps, names, cold brackets. But memories don’t live in columns. They live in the pauses between messages, the late-night bursts, and the voice notes you replay three times. rewhatsapp restores the rhythm, the pacing, and the feeling — 100% offline on your device.',
    }),
  );

  whySection.appendChild(whyContent);
  container.appendChild(whySection);

  // =========================================================================
  // SECTION 3: How it works (Compact list <= 420px mobile)
  // =========================================================================
  const howSection = el('section', {
    id: 'how-it-works',
    className: 'wa-section wa-how-section wa-reveal-item',
  });

  const howHeader = el(
    'div',
    { className: 'wa-section-header' },
    el('span', { className: 'wa-section-eyebrow', text: 'HOW IT WORKS' }),
    el('h2', {
      className: 'wa-section-title',
      text: 'Three steps. Nothing leaves your phone.',
      data: {
        reveal: 'blur',
        revealDir: 'bottom',
        revealDelay: '60',
      },
    }),
  );

  const stepItems = [
    {
      num: '01',
      icon: 'upload',
      title: 'Export your chat',
      desc: 'Open any WhatsApp conversation, tap Export chat, and pick "Without Media" for instant .txt.',
    },
    {
      num: '02',
      icon: 'sparkles',
      title: 'Drop into rewhatsapp',
      desc: 'Everything parses right in browser memory in milliseconds. Zero servers, zero uploads.',
    },
    {
      num: '03',
      icon: 'rewind',
      title: 'Relive the timeline',
      desc: 'Watch messages unfold with typing cadence, audio chimes, pauses, and sentiment trajectory.',
    },
  ];

  const stepsList = el(
    'div',
    { className: 'wa-compact-steps-list' },
    ...stepItems.map((st) =>
      el(
        'div',
        { className: 'wa-compact-step-row' },
        el(
          'div',
          { className: 'wa-compact-step-icon-tile' },
          createIcon(st.icon, { width: 18, height: 18 }),
        ),
        el(
          'div',
          { className: 'wa-compact-step-content' },
          el('h3', { className: 'wa-compact-step-title', text: `${st.num}. ${st.title}` }),
          el('p', { className: 'wa-compact-step-desc', text: st.desc }),
        ),
      ),
    ),
  );

  howSection.append(howHeader, stepsList);
  container.appendChild(howSection);

  // =========================================================================
  // SECTION 4: How to use it (Tabbed export guide + next steps + shortcuts)
  // =========================================================================
  const useSection = el('section', {
    id: 'how-to-use',
    className: 'wa-section wa-use-section wa-reveal-item',
  });
  useSection.appendChild(createExportGuide());
  container.appendChild(useSection);

  // =========================================================================
  // SECTION 5: Features (Mobile horizontal scroll-snap carousel; Desktop 2x2 bento)
  // =========================================================================
  const featuresSection = el('section', {
    id: 'features',
    className: 'wa-section wa-features-section wa-reveal-item',
  });

  const featuresHeader = el(
    'div',
    { className: 'wa-section-header' },
    el('span', { className: 'wa-section-eyebrow', text: 'FEATURES' }),
    el('h2', {
      className: 'wa-section-title',
      text: 'Crafted for real emotional fidelity.',
      data: {
        reveal: 'blur',
        revealDir: 'bottom',
        revealDelay: '60',
      },
    }),
  );

  // 4 Features
  const feat1 = el(
    'div',
    { className: 'wa-feature-card', role: 'group', aria: { label: 'Dynamic Typing Speed' } },
    el(
      'div',
      { className: 'wa-feature-demo-area' },
      el('div', { className: 'wa-demo-time-label', text: 'Dynamic: Base + 30ms/char' }),
      el('div', { className: 'wa-demo-time-bar-track' }, el('div', { className: 'wa-demo-time-bar-fill' })),
    ),
    el('h3', { className: 'wa-feature-title', text: 'Dynamic Typing Speed' }),
    el('p', {
      className: 'wa-feature-desc',
      text: 'Every message calculates typing duration proportional to length (-4x to +4x speed).',
    }),
  );

  const feat2 = el(
    'div',
    { className: 'wa-feature-card', role: 'group', aria: { label: 'Typing and Read Receipts' } },
    el(
      'div',
      { className: 'wa-feature-demo-area' },
      el(
        'div',
        { className: 'wa-demo-ticks-box' },
        el('span', { className: 'wa-demo-ticks-text', text: 'Are you free tomorrow?' }),
        el(
          'div',
          { className: 'wa-demo-ticks-row' },
          el('span', { className: 'wa-demo-ticks-time', text: '12:30 PM' }),
          el('span', { className: 'wa-demo-ticks-icons', text: '✓✓' }),
        ),
      ),
    ),
    el('h3', { className: 'wa-feature-title', text: 'Typing & Read Receipts' }),
    el('p', {
      className: 'wa-feature-desc',
      text: 'Natural typing dots and double-ticks that crossfade from sent grey to read blue.',
    }),
  );

  const feat3 = el(
    'div',
    { className: 'wa-feature-card', role: 'group', aria: { label: 'Conversation Insights' } },
    el(
      'div',
      { className: 'wa-feature-demo-area' },
      el(
        'div',
        { className: 'wa-demo-heatmap-grid' },
        ...Array.from({ length: 28 }, (_, i) =>
          el('div', { className: `wa-demo-heat-cell l${(i * 7) % 5}` }),
        ),
      ),
    ),
    el('h3', { className: 'wa-feature-title', text: 'Conversation Insights' }),
    el('p', {
      className: 'wa-feature-desc',
      text: 'Private 7×24 activity heatmaps, response times, and sentiment trajectory.',
    }),
  );

  const soundDemoBtn = el(
    'button',
    {
      className: 'wa-btn-secondary wa-sound-demo-btn',
      type: 'button',
      aria: { label: 'Listen to procedural sound pop' },
    },
    createIcon('volume', { width: 14, height: 14 }),
    el('span', { text: 'Test soft sound' }),
  );
  soundDemoBtn.addEventListener('click', () => {
    playSendSound();
    setTimeout(() => playReceiveSound(), 260);
  });

  const feat4 = el(
    'div',
    { className: 'wa-feature-card', role: 'group', aria: { label: 'Soft Procedural Audio' } },
    el('div', { className: 'wa-feature-demo-area wa-sound-demo-container' }, soundDemoBtn),
    el('h3', { className: 'wa-feature-title', text: 'Soft Procedural Audio' }),
    el('p', {
      className: 'wa-feature-desc',
      text: 'Gentle Web Audio pops and chimes synthesized live with zero audio downloads.',
    }),
  );

  // Features carousel wrapper (horizontal snap on mobile, bento grid on desktop)
  const featuresCarousel = el(
    'div',
    {
      className: 'wa-features-carousel',
      role: 'region',
      tabindex: '0',
      aria: { label: 'Features carousel' },
    },
    feat1,
    feat2,
    feat3,
    feat4,
  );

  // Carousel indicator dots (mobile only)
  const carouselDots = el(
    'div',
    { className: 'wa-carousel-dots', aria: { hidden: 'true' } },
    el('span', { className: 'wa-carousel-dot active' }),
    el('span', { className: 'wa-carousel-dot' }),
    el('span', { className: 'wa-carousel-dot' }),
    el('span', { className: 'wa-carousel-dot' }),
  );

  featuresCarousel.addEventListener('scroll', () => {
    const scrollLeft = featuresCarousel.scrollLeft;
    const cardWidth = featuresCarousel.clientWidth * 0.82;
    const index = Math.round(scrollLeft / (cardWidth + 12));
    const dots = carouselDots.querySelectorAll('.wa-carousel-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }, { passive: true });

  featuresSection.append(featuresHeader, featuresCarousel, carouselDots);
  container.appendChild(featuresSection);

  // =========================================================================
  // SECTION 6: Safe, private and offline (Single container, no nested cards)
  // =========================================================================
  const privacySection = el('section', {
    id: 'privacy',
    className: 'wa-section wa-privacy-section wa-reveal-item',
  });

  const privacyHeader = el(
    'div',
    { className: 'wa-section-header' },
    el('span', { className: 'wa-section-eyebrow', text: 'PRIVACY & SECURITY' }),
    el('h2', {
      className: 'wa-section-title',
      text: 'Zero servers. Zero tracking. Zero leaks.',
      data: {
        reveal: 'blur',
        revealDir: 'bottom',
        revealDelay: '60',
      },
    }),
    el('p', {
      className: 'wa-section-sub',
      text: 'rewhatsapp runs 100% client-side. Your chat is parsed in browser memory and vanishes when the tab closes.',
    }),
  );

  const privacyBox = el('div', { className: 'wa-privacy-unified-box' });

  // 1. Compact live stat row
  const statRow = el(
    'div',
    { className: 'wa-privacy-stat-row' },
    el('span', { className: 'wa-privacy-stat-number', text: '0' }),
    el(
      'div',
      { className: 'wa-privacy-stat-meta' },
      el('span', { className: 'wa-privacy-stat-label', text: 'External network requests' }),
      el(
        'div',
        { className: 'wa-privacy-live-badge' },
        el('span', { className: 'wa-privacy-dot' }),
        el('span', { text: 'Monitoring live via PerformanceObserver' }),
      ),
    ),
  );

  // Monitor live network requests
  if (typeof window !== 'undefined' && typeof window.PerformanceObserver !== 'undefined') {
    try {
      const observer = new window.PerformanceObserver((list) => {
        const entries = list.getEntries();
        let externalCount = 0;
        entries.forEach((e) => {
          if ('initiatorType' in e && e.name.startsWith('http')) {
            const url = new URL(e.name);
            if (url.origin !== window.location.origin) {
              externalCount++;
            }
          }
        });
        const numEl = statRow.querySelector('.wa-privacy-stat-number');
        if (numEl) numEl.textContent = String(externalCount);
      });
      observer.observe({ entryTypes: ['resource'] });
    } catch {
      // Ignored
    }
  }

  // 2. 3 Verify Steps
  const verifyList = el(
    'ol',
    { className: 'wa-privacy-verify-list' },
    el('li', {}, el('strong', { text: '1. Open DevTools: ' }), 'Press F12 and click the Network tab.'),
    el('li', {}, el('strong', { text: '2. Go offline: ' }), 'Turn off your Wi-Fi or enable Airplane mode.'),
    el('li', {}, el('strong', { text: '3. Drop your chat: ' }), 'Notice everything replays seamlessly without a single web request.'),
  );

  // 3. Trust Actions Row
  const clearPrefsBtn = el('button', {
    className: 'wa-btn-secondary wa-clear-prefs-btn',
    type: 'button',
    text: 'Clear stored preferences',
  });
  const clearStatus = el('span', { className: 'wa-clear-status', style: 'display: none;' });

  clearPrefsBtn.addEventListener('click', () => {
    try {
      localStorage.removeItem('rewhatsapp_speed');
      localStorage.removeItem('rewhatsapp_muted');
      localStorage.removeItem('rewhatsapp_volume');
      localStorage.removeItem('rewhatsapp_legal_consent_v1');
      clearStatus.textContent = 'Preferences cleared!';
      clearStatus.style.display = 'inline-block';
      setTimeout(() => {
        clearStatus.style.display = 'none';
      }, 2500);
    } catch {
      // Ignore
    }
  });

  const privacyModalTrigger = el('button', {
    className: 'wa-btn-secondary wa-open-privacy-dialog-btn',
    type: 'button',
    text: 'Privacy in 1 minute',
    onClick: () => onOpenPrivacy && onOpenPrivacy(),
  });

  const trustActions = el(
    'div',
    { className: 'wa-privacy-actions-row' },
    clearPrefsBtn,
    privacyModalTrigger,
    clearStatus,
  );

  // 4. Policy Links and CSP Note (12px)
  const privacyLinks = el(
    'div',
    { className: 'wa-privacy-footnote' },
    el('span', { text: 'Strict Content Security Policy enforced. Read our ' }),
    el('a', { href: 'privacy.html', className: 'wa-legal-inline-link', text: 'Privacy Policy' }),
    el('span', { text: ' and ' }),
    el('a', { href: 'terms.html', className: 'wa-legal-inline-link', text: 'Terms of Use' }),
    el('span', { text: '.' }),
  );

  privacyBox.append(statRow, verifyList, trustActions, privacyLinks);
  privacySection.append(privacyHeader, privacyBox);
  container.appendChild(privacySection);

  // =========================================================================
  // SECTION 7: FAQ (Accordion with 8 questions, 48-52px closed rows, one open at a time)
  // =========================================================================
  const faqSection = el('section', {
    id: 'faq',
    className: 'wa-section wa-faq-section wa-reveal-item',
  });

  const faqHeader = el(
    'div',
    { className: 'wa-section-header' },
    el('span', { className: 'wa-section-eyebrow', text: 'FREQUENTLY ASKED QUESTIONS' }),
    el('h2', {
      className: 'wa-section-title',
      text: 'Answers to common questions.',
      data: {
        reveal: 'blur',
        revealDir: 'bottom',
        revealDelay: '60',
      },
    }),
  );

  const faqAccordion = el('div', { className: 'wa-faq-accordion' });
  const FAQS = [
    {
      q: 'Is my chat uploaded to any server?',
      a: 'No. Every single message, timestamp, contact name, and audio pop is parsed and replayed entirely inside your device’s browser memory. There is no remote backend, database, or analytics tracking.',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. rewhatsapp is an installable PWA. Scripts and stylesheets are cached locally. You can turn on Airplane mode or disconnect your internet completely, and replay functions 100% offline.',
    },
    {
      q: 'Does it support group chats and media files?',
      a: 'Yes for group chats: rewhatsapp automatically assigns distinct harmonic color-coded avatars and sender tags. However, media attachments (photos, voice notes, videos) and .zip archives are not currently supported; export your chats as plain text (.txt) choosing "Without Media".',
    },
    {
      q: 'How do I export my chat from WhatsApp?',
      a: 'In WhatsApp, open the conversation, tap Contact Info (or More ⋮ on Android) → Export Chat → choose "Without Media" for an instant .txt file. See Section 4 above for step-by-step screenshots.',
    },
    {
      q: 'Why is my date order inverted?',
      a: 'WhatsApp exports use your phone’s regional format (e.g. DD/MM/YYYY or MM/DD/YYYY). rewhatsapp automatically infers order by chronological monotonicity. If ever inverted, flip the toggle in Setup Step 2.',
    },
    {
      q: 'How does dynamic typing speed work?',
      a: 'Delays before each message are calculated directly from character length (base delay + time-per-character). Both incoming and outgoing messages simulate human typing, adjustable from -4x (slowed down) to +4x (accelerated).',
    },
    {
      q: 'What happens to my data when I close the tab?',
      a: 'Your parsed chat and replay position are cached only in your browser’s localStorage so you can resume playback anytime. Zero data ever leaves your device or touches any server.',
    },
    {
      q: 'Is rewhatsapp affiliated with WhatsApp or Meta?',
      a: 'No. rewhatsapp is an independent, non-commercial open-source project. It is not affiliated with, sponsored by, or endorsed by WhatsApp LLC or Meta Platforms, Inc.',
    },
  ];

  FAQS.forEach((item) => {
    const details = el('details', { className: 'wa-faq-item' });
    const summary = el(
      'summary',
      { className: 'wa-faq-question' },
      el('span', { text: item.q }),
      createIcon('chevron-down', { width: 16, height: 16, className: 'wa-faq-chevron' }),
    );
    const answer = el('p', { className: 'wa-faq-answer', text: item.a });
    details.append(summary, answer);

    // Ensure one open at a time
    details.addEventListener('toggle', () => {
      if (details.open) {
        faqAccordion.querySelectorAll('details').forEach((d) => {
          if (d !== details) d.open = false;
        });
      }
    });

    faqAccordion.appendChild(details);
  });

  faqSection.append(faqHeader, faqAccordion);
  container.appendChild(faqSection);

  // =========================================================================
  // SECTION 8: Final Call to Action Band ("Your chat is waiting.")
  // =========================================================================
  const ctaBand = el('section', { className: 'wa-final-cta-band wa-reveal-item' });
  const ctaBandContent = el(
    'div',
    { className: 'wa-cta-band-content' },
    el('h2', {
      className: 'wa-cta-band-title',
      text: 'Your chat is waiting.',
      data: {
        reveal: 'zoom',
      },
    }),
    el('p', {
      className: 'wa-cta-band-sub',
      text: 'Rediscover the early days, the inside jokes, and the messages you thought were forgotten.',
    }),
    el(
      'div',
      { className: 'wa-cta-band-buttons' },
      el(
        'button',
        {
          className: 'wa-btn-primary',
          type: 'button',
          onClick: () => onDemoSelected(),
        },
        createIcon('play', { width: 16, height: 16 }),
        el('span', { text: 'Watch sample' }),
      ),
      el(
        'button',
        {
          className: 'wa-btn-secondary',
          type: 'button',
          onClick: () => fileInput.click(),
        },
        createIcon('upload', { width: 16, height: 16 }),
        el('span', { text: 'Upload chat' }),
      ),
    ),
  );
  ctaBand.appendChild(ctaBandContent);
  container.appendChild(ctaBand);

  // =========================================================================
  // SECTION 9: Footer (Premium layout with rewhatsapp. logo & qalvian credit)
  // =========================================================================
  const footer = el(
    'footer',
    { className: 'wa-home-footer' },
    el(
      'div',
      { className: 'wa-footer-brand-row' },
      el(
        'div',
        { className: 'wa-footer-brand' },
        el('span', { className: 'wa-brand-text', text: 'rewhatsapp' }),
        el('span', { className: 'wa-brand-dot', text: '.' }),
      ),
      el(
        'div',
        { className: 'wa-footer-links-row' },
        el('a', { className: 'wa-footer-link', href: 'privacy.html', text: 'Privacy Policy' }),
        el('a', { className: 'wa-footer-link', href: 'terms.html', text: 'Terms of Use' }),
        el('a', { className: 'wa-footer-link', href: 'about.html', text: 'About' }),
        el('a', { className: 'wa-footer-link', href: 'privacy.html#grievance', text: 'Grievance Contact' }),
      ),
    ),
    el('p', {
      className: 'wa-footer-license-notice',
      text: 'Free to use and embed. Do not copy, clone, or redistribute the source code.',
    }),
    el('p', {
      className: 'wa-footer-credit',
      text: 'Created and copyrighted by qalvian (GitHub).',
    }),
    el('p', {
      className: 'wa-footer-disclaimer',
      text: 'Independent project. Not affiliated with WhatsApp LLC or Meta Platforms, Inc. WhatsApp is a trademark of WhatsApp LLC.',
    }),
  );
  container.appendChild(footer);

  // =========================================================================
  // Mobile Sticky Bottom Action Bar (Appears after hero CTAs leave view; Hides over CTA Band/Footer)
  // =========================================================================
  const mobileBar = el(
    'div',
    { className: 'wa-mobile-sticky-bar' },
    el(
      'button',
      {
        className: 'wa-btn-primary wa-mobile-btn',
        type: 'button',
        onClick: () => onDemoSelected(),
      },
      createIcon('play', { width: 16, height: 16 }),
      el('span', { text: 'Watch sample memory' }),
    ),
  );
  container.appendChild(mobileBar);

  // IntersectionObserver for Sticky Bottom Bar and Header Sample Button
  if (typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'undefined') {
    let heroPast = false;
    let bottomVisible = false;

    const updateStickyBar = () => {
      if (heroPast && !bottomVisible) {
        mobileBar.classList.add('is-visible');
        headerSampleBtn.style.opacity = '1';
        headerSampleBtn.style.pointerEvents = 'auto';
      } else {
        mobileBar.classList.remove('is-visible');
        if (!heroPast) {
          headerSampleBtn.style.opacity = '0';
          headerSampleBtn.style.pointerEvents = 'none';
        }
      }
    };

    // Hero observer
    const heroObserver = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          heroPast = !entry.isIntersecting;
          updateStickyBar();
        });
      },
      { threshold: 0.1 },
    );
    heroObserver.observe(ctaGroup);

    // Final CTA / Footer observer to hide bottom bar
    const bottomObserver = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === ctaBand || entry.target === footer) {
            bottomVisible = entry.isIntersecting;
            updateStickyBar();
          }
        });
      },
      { threshold: 0.05 },
    );
    bottomObserver.observe(ctaBand);
    bottomObserver.observe(footer);

    // Reveal animations observer
    const revealObserver = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    const revealItems = container.querySelectorAll('.wa-reveal-item');
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  return {
    element: container,
    whirlDial: (durationMs = 900) => phoneMockup.rollTickerBackward(durationMs),
    travelTransition: (durationMs = 900) => phoneMockup.rollTickerBackward(durationMs),
    setParsingState,
    setErrorState,
    resetUploadCard,
    destroy: () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(lineTimer);
      phoneMockup.destroy();
    },
  };
}
