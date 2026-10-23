// @ts-check

import { parseChat } from './core/parser/index.js';
import { Timeline } from './core/timeline.js';
import { ChatPlayer } from './core/player.js';
import { computeChatStats } from './core/analytics/stats.js';
import { getIsMuted, setMuted, toggleMuted } from './audio/synth.js';
import { DEMO_CHAT_TEXT } from './data/demo-chat.js';
import { createHomeView } from './ui/home/index.js';
import { createPrivacyModal } from './ui/home/privacy-modal.js';
import { createSetupDialog } from './ui/setup/index.js';
import { createReplayView } from './ui/replay/index.js';
import { createInsightsDashboard } from './ui/insights/index.js';
import { createEpilogueCard } from './ui/insights/epilogue.js';
import { createCommandPalette } from './ui/palette/index.js';
import { initReveals } from './ui/motion/text-reveal.js';
import { el } from './util/dom.js';
import { createIcon } from './ui/icons.js';

/**
 * Composition root for rewhatsapp.
 * Coordinates view transitions, state management, and user interaction.
 */

// In local development, purge stale caches and unregister obsolete service workers
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key);
      }
    });
  }
}

const appRoot = /** @type {HTMLElement} */ (document.getElementById('app'));
const metaThemeColor = /** @type {HTMLMetaElement | null} */ (
  document.getElementById('meta-theme-color')
);

/** @type {import('./core/parser/index.js').ParsedChatResult | null} */
let currentChat = null;
/** @type {ChatPlayer | null} */
let currentPlayer = null;
/** @type {import('./core/analytics/stats.js').ChatInsights | null} */
let currentStats = null;
/** @type {ReturnType<typeof createReplayView> | null} */
let currentReplayHandle = null;

/** @type {HTMLElement | null} */
let activeModalEl = null;

/**
 * Safely reads preference from localStorage.
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
function getPref(key, fallback) {
  try {
    return localStorage.getItem(`rewhatsapp_${key}`) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely writes preference to localStorage.
 * @param {string} key
 * @param {string} val
 */
function setPref(key, val) {
  try {
    localStorage.setItem(`rewhatsapp_${key}`, val);
  } catch {
    // Ignore storage errors in restrictive environments
  }
}

// Restore saved mute preference
setMuted(getPref('muted', 'false') === 'true');

/**
 * Closes any currently active modal/dialog.
 */
function closeModal() {
  if (activeModalEl && activeModalEl.parentNode) {
    activeModalEl.parentNode.removeChild(activeModalEl);
    activeModalEl = null;
  }
}

/**
 * Opens a modal dialog.
 * @param {HTMLElement} modalEl
 */
function openModal(modalEl) {
  closeModal();
  activeModalEl = modalEl;
  document.body.appendChild(modalEl);
}

/**
 * Displays a non-intrusive toast notification.
 * @param {string} msg
 */
function showToast(msg) {
  const toast = document.getElementById('toast-notice');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

// Instantiate Home view (fallback and engine helper)
const homeView = createHomeView({
  onFileSelected: handleFileSelected,
  onDemoSelected: handleDemoSelected,
  onOpenPrivacy: () => openModal(createPrivacyModal({ onClose: closeModal })),
});

/**
 * Caches replay session to localStorage.
 *
 * @param {import('./core/parser/index.js').ParsedChatResult} chat
 * @param {any} config
 * @param {string} chatTitle
 * @param {boolean} isGroupChat
 * @param {number} [progress=0]
 * @param {number} [virtualTime=0]
 * @param {number} [currentIndex=0]
 */
function saveCachedReplay(chat, config, chatTitle, isGroupChat, progress = 0, virtualTime = 0, currentIndex = 0) {
  try {
    const payload = {
      chat,
      config,
      chatTitle,
      isGroupChat,
      progress,
      virtualTime,
      currentIndex,
      timestamp: Date.now(),
    };
    localStorage.setItem('rewhatsapp_cached_replay', JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to cache replay in localStorage:', err);
  }
}

function loadCachedReplay() {
  try {
    const raw = localStorage.getItem('rewhatsapp_cached_replay');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.chat && data.chat.messages && data.config) {
      return data;
    }
  } catch {
    // Ignore corrupt storage
  }
  return null;
}

function clearCachedReplay() {
  try {
    localStorage.removeItem('rewhatsapp_cached_replay');
  } catch {
    /* ignore */
  }
}

/**
 * Checks for a cached replay in localStorage and renders the "Resume Replay" prompt.
 */
function initResumePrompt() {
  const container = document.getElementById('resume-banner-container');
  if (!container) return;
  container.innerHTML = '';

  const cached = loadCachedReplay();
  if (!cached || !cached.chatTitle) return;

  const total = cached.chat.messages?.length || 0;
  const currentMsg = (cached.currentIndex || 0) + 1;
  const pct = Math.round((cached.progress || 0) * 100);

  const card = el(
    'div',
    { className: 'resume-replay-card' },
    el(
      'div',
      { className: 'resume-card-left' },
      el(
        'span',
        { className: 'resume-badge' },
        createIcon('clock', { width: 14, height: 14 }),
        el('span', { text: 'Paused Memory' }),
      ),
      el('h3', { className: 'resume-title', text: `Resume "${cached.chatTitle}"` }),
      el('p', {
        className: 'resume-sub',
        text: `Paused at ${pct}% (${currentMsg} of ${total} messages). Pick up right where you left off.`,
      }),
    ),
    el(
      'div',
      { className: 'resume-card-actions' },
      el(
        'button',
        {
          className: 'btn btn-primary',
          type: 'button',
          onClick: () => {
            currentChat = cached.chat;
            startReplayFlow(cached.chat, cached.config, cached.virtualTime);
          },
        },
        createIcon('play', { width: 14, height: 14 }),
        el('span', { text: 'Resume replay' }),
      ),
      el(
        'button',
        {
          className: 'btn btn-secondary',
          type: 'button',
          onClick: () => {
            clearCachedReplay();
            card.remove();
          },
        },
        el('span', { text: 'Dismiss' }),
      ),
    ),
  );

  container.appendChild(card);
}

/**
 * Renders the Home View into #app.
 */
function showHome() {
  closeModal();
  if (currentReplayHandle) {
    currentReplayHandle.destroy();
    currentReplayHandle = null;
  }
  currentPlayer = null;
  currentChat = null;
  currentStats = null;

  // Site chrome uses warm light palette exclusively
  document.documentElement.dataset.theme = 'light';
  if (metaThemeColor) {
    metaThemeColor.content = '#F9F6F0';
  }

  const landingPage = document.getElementById('landing-page');
  const replayMount = document.getElementById('replay-mount');
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    siteHeader.classList.remove('hidden');
  }

  if (landingPage && replayMount) {
    landingPage.style.display = 'block';
    replayMount.style.display = 'none';
    replayMount.textContent = '';
  } else {
    appRoot.textContent = '';
    appRoot.appendChild(homeView.element);
    initReveals(appRoot);
  }

  // Check and display the Resume replay prompt if a cached session exists
  initResumePrompt();
}

/**
 * Handles incoming file (text or zip) using HTML5 FileReader API.
 * 100% in-browser client-side execution.
 * @param {File} file
 */
async function handleFileSelected(file) {
  try {
    const isZip = file.name.endsWith('.zip');
    /** @type {ArrayBuffer | string} */
    const content = await new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onload = () => {
        if (reader.result !== null) {
          resolve(/** @type {ArrayBuffer | string} */ (reader.result));
        } else {
          reject(new Error('File is empty or unreadable'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file in browser'));
      if (isZip) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'utf-8');
      }
    });

    const chat = await parseChat(content);
    currentChat = chat;
    homeView.resetUploadCard();
    openSetupDialog(chat);
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "That file doesn't look like a WhatsApp export. Want to try another?";
    homeView.setErrorState(msg);
    showToast(msg);
  }
}

/**
 * Loads the synthetic demo memory.
 */
async function handleDemoSelected() {
  try {
    const chat = await parseChat(DEMO_CHAT_TEXT);
    currentChat = chat;
    openSetupDialog(chat);
  } catch (err) {
    homeView.setErrorState(err instanceof Error ? err.message : 'Failed to load demo memory');
  }
}

/**
 * Opens the setup dialog.
 * @param {import('./core/parser/index.js').ParsedChatResult} chat
 */
function openSetupDialog(chat) {
  const dialog = createSetupDialog({
    chat,
    onCancel: closeModal,
    onStartReplay: (config) => {
      closeModal();
      startReplayFlow(chat, config);
    },
  });
  openModal(dialog);
}

/**
 * Begins replay with the selected configuration.
 *
 * @param {import('./core/parser/index.js').ParsedChatResult} chat
 * @param {{
 *   userPersonaRaw: string;
 *   theme: 'light' | 'dark';
 *   gapMode: 'smart' | 'realtime' | 'fixed';
 *   speed: number;
 *   swapDateFormat: boolean;
 * }} config
 * @param {number} [initialVirtualTime=0]
 */
async function startReplayFlow(chat, config, initialVirtualTime = 0) {
  // If user toggled date format in setup, reverse date order
  if (config.swapDateFormat) {
    chat.dateOrder = chat.dateOrder === 'DMY' ? 'MDY' : 'DMY';
  }

  // Apply Theme
  document.documentElement.dataset.theme = config.theme;
  setPref('theme', config.theme);
  if (metaThemeColor) {
    metaThemeColor.content = config.theme === 'light' ? '#008069' : '#202c33';
  }

  // Construct Timeline and Player
  const timeline = new Timeline(chat.messages, {
    mode: config.gapMode,
    speed: config.speed,
  });

  const player = new ChatPlayer(timeline);
  player.setSpeed(config.speed);
  currentPlayer = player;

  // Pre-calculate statistics
  currentStats = computeChatStats(chat.messages, chat.participants);

  // Determine chat title
  const otherParticipant = chat.participants.find((p) => p.raw !== config.userPersonaRaw);
  const chatTitle = otherParticipant ? otherParticipant.displayName : 'WhatsApp Chat';
  const isGroupChat = chat.participants.length > 2;

  // Save initial replay session to localStorage
  saveCachedReplay(chat, config, chatTitle, isGroupChat, 0, initialVirtualTime, 0);

  let lastSaveTime = 0;
  player.on(
    'timeupdate',
    /** @param {{ virtualTime: number, progress: number, currentIndex: number }} payload */
    ({ virtualTime, progress, currentIndex }) => {
      const now = Date.now();
      if (now - lastSaveTime > 2000) {
        lastSaveTime = now;
        saveCachedReplay(chat, config, chatTitle, isGroupChat, progress, virtualTime, currentIndex);
      }
    },
  );

  player.on(
    'statechange',
    /** @param {{ state: string }} payload */
    ({ state }) => {
      if (state === 'PAUSED' || state === 'ENDED') {
        const progress =
          timeline.totalDuration > 0 ? player.virtualTime / timeline.totalDuration : 0;
        saveCachedReplay(
          chat,
          config,
          chatTitle,
          isGroupChat,
          progress,
          player.virtualTime,
          player.currentIndex,
        );
      }
    },
  );

  // Mount Replay Shell
  const landingPage = document.getElementById('landing-page');
  const replayMount = document.getElementById('replay-mount');
  const siteHeader = document.querySelector('.site-header');

  currentReplayHandle = createReplayView({
    player,
    timeline,
    userPersonaRaw: config.userPersonaRaw,
    chatTitle,
    isGroupChat,
    onBack: () => showHome(),
    onOpenInsights: () => toggleInsights(),
    onChatEnd: () => {
      // Replay completed: auto open insights dashboard
      toggleInsights();
    },
  });

  if (siteHeader) {
    siteHeader.classList.add('hidden');
  }

  if (landingPage && replayMount) {
    landingPage.style.display = 'none';
    replayMount.style.display = 'block';
    replayMount.textContent = '';
    replayMount.appendChild(currentReplayHandle.element);
  } else {
    appRoot.textContent = '';
    appRoot.appendChild(currentReplayHandle.element);
  }

  if (initialVirtualTime && initialVirtualTime > 0) {
    player.seekTo(initialVirtualTime);
  }
}

/**
 * Opens or toggles the Insights Dashboard.
 */
function toggleInsights() {
  if (activeModalEl && activeModalEl.classList.contains('wa-insights-overlay')) {
    closeModal();
    return;
  }

  if (!currentChat || !currentStats) return;

  const insights = createInsightsDashboard({
    stats: currentStats,
    onClose: closeModal,
  });
  openModal(insights);
}

/**
 * Shows the Epilogue memory card when playback reaches the end.
 */
function showEpilogue() {
  if (!currentStats) return;

  const epilogue = createEpilogueCard({
    stats: currentStats,
    onReplay: () => {
      closeModal();
      if (currentPlayer) {
        currentPlayer.seekTo(0);
        currentPlayer.play();
      }
    },
    onViewInsights: () => {
      closeModal();
      toggleInsights();
    },
    onExit: () => showHome(),
  });

  openModal(epilogue);
}

/**
 * Opens Command Palette.
 */
function openPalette() {
  if (activeModalEl && activeModalEl.classList.contains('wa-palette-overlay')) {
    closeModal();
    return;
  }

  /** @type {import('./ui/palette/index.js').PaletteAction[]} */
  const actions = [];

  if (currentPlayer) {
    actions.push({
      id: 'play-pause',
      title: currentPlayer.state === 'PLAYING' ? 'Pause Replay' : 'Play Replay',
      shortcut: 'Space',
      run: () => currentPlayer?.togglePlay(),
    });

    [-4, -3, -2, -1, 1, 2, 3, 4].forEach((spd) => {
      actions.push({
        id: `speed-${spd}`,
        title: `Set Speed to ${spd}×`,
        run: () => currentPlayer?.setSpeed(spd),
      });
    });

    actions.push({
      id: 'restart',
      title: 'Restart from Beginning',
      run: () => {
        currentPlayer?.seekTo(0);
        currentPlayer?.play();
      },
    });

    actions.push({
      id: 'insights',
      title: 'Conversation Insights',
      shortcut: 'I',
      run: () => toggleInsights(),
    });
  }

  actions.push({
    id: 'fullscreen',
    title: 'Toggle Fullscreen',
    shortcut: 'F',
    run: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    },
  });

  actions.push({
    id: 'mute',
    title: getIsMuted() ? 'Unmute Audio' : 'Mute Audio',
    shortcut: 'M',
    run: () => {
      const next = !getIsMuted();
      setMuted(next);
      setPref('muted', String(next));
    },
  });

  if (currentPlayer) {
    actions.push({
      id: 'exit',
      title: 'Exit to Time Machine',
      shortcut: 'Esc',
      run: () => showHome(),
    });
  }

  const palette = createCommandPalette({
    actions,
    onClose: closeModal,
  });

  openModal(palette);
}

// Global Keyboard Shortcut Listeners
window.addEventListener('keydown', (e) => {
  // Command Palette: Ctrl/Cmd + K
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPalette();
    return;
  }

  // If a modal or palette is open, let it handle Esc
  if (activeModalEl) {
    if (e.key === 'Escape') {
      closeModal();
    }
    return;
  }

  // Global Shortcuts during Replay
  if (currentPlayer) {
    if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      currentPlayer.togglePlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentPlayer.nextMessage();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentPlayer.prevMessage();
    } else if (e.key === ']') {
      e.preventDefault();
      const ratings = [-4, -3, -2, -1, 1, 2, 3, 4];
      const curRating = currentPlayer.speedRating ?? 1;
      const idx = ratings.indexOf(curRating);
      if (idx !== -1 && idx < ratings.length - 1) {
        currentPlayer.setSpeed(ratings[idx + 1]);
      }
    } else if (e.key === '[') {
      e.preventDefault();
      const ratings = [-4, -3, -2, -1, 1, 2, 3, 4];
      const curRating = currentPlayer.speedRating ?? 1;
      const idx = ratings.indexOf(curRating);
      if (idx > 0) {
        currentPlayer.setSpeed(ratings[idx - 1]);
      }
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    } else if (e.key.toLowerCase() === 'i') {
      e.preventDefault();
      toggleInsights();
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleMuted();
      setPref('muted', String(getIsMuted()));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      showHome();
    }
  }
});

// Wire up all landing page interactions, micro-animations, and file handlers
function initLandingPageInteractions() {
  const fileInput = /** @type {HTMLInputElement | null} */ (document.getElementById('file-input'));
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) {
        handleFileSelected(file);
        fileInput.value = '';
      }
    });
  }

  const btnHeroSelect = document.getElementById('btn-hero-select');
  const btnFinalSelect = document.getElementById('btn-final-select');
  btnHeroSelect?.addEventListener('click', () => fileInput?.click());
  btnFinalSelect?.addEventListener('click', () => fileInput?.click());

  const btnHeroSample = document.getElementById('btn-hero-sample');
  const btnFinalSample = document.getElementById('btn-final-sample');
  const btnHeaderSample = document.getElementById('header-sample-btn');
  btnHeroSample?.addEventListener('click', () => handleDemoSelected());
  btnFinalSample?.addEventListener('click', () => handleDemoSelected());
  btnHeaderSample?.addEventListener('click', () => handleDemoSelected());

  // Drag and drop chat file onto window
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  });

  // Clear Stored Preferences tag
  const tagClearPrefs = document.getElementById('tag-clear-prefs');
  tagClearPrefs?.addEventListener('click', () => {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('rewhatsapp_')) {
          keys.push(k);
        }
      }
      keys.forEach((k) => localStorage.removeItem(k));
      showToast('Stored preferences cleared');
    } catch {
      showToast('Preferences reset');
    }
  });

  // Privacy in 1 minute tag and modal
  const tagPrivacyInfo = document.getElementById('tag-privacy-info');
  const privacyModal = document.getElementById('privacy-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const closePrivacyModal = () => {
    privacyModal?.classList.remove('open');
    privacyModal?.setAttribute('aria-hidden', 'true');
  };

  tagPrivacyInfo?.addEventListener('click', () => {
    privacyModal?.classList.add('open');
    privacyModal?.setAttribute('aria-hidden', 'false');
  });

  modalCloseBtn?.addEventListener('click', closePrivacyModal);
  privacyModal?.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      closePrivacyModal();
    }
  });

  // Floating Navbar Scroll Behavior (rAF-throttled)
  const siteHeader = document.querySelector('.site-header');
  let headerRafPending = false;
  const handleScroll = () => {
    if (headerRafPending) return;
    headerRafPending = true;
    requestAnimationFrame(() => {
      headerRafPending = false;
      if (window.scrollY > 20) {
        siteHeader?.classList.add('scrolled');
      } else {
        siteHeader?.classList.remove('scrolled');
      }
    });
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Ensure feature cards stick cleanly below the pinned features header without overlap
  const updateHeaderStickyOffset = () => {
    const header = /** @type {HTMLElement | null} */ (document.querySelector('.features-header'));
    if (header) {
      const isMobile = window.innerWidth < 640;
      const headerStickyTop = isMobile ? 76 : 96;
      const headerHeight = header.offsetHeight;
      const cardStickyTop = headerStickyTop + headerHeight + (isMobile ? 12 : 16);
      document.documentElement.style.setProperty('--feature-card-sticky-top', `${cardStickyTop}px`);
    }
  };
  window.addEventListener('resize', updateHeaderStickyOffset, { passive: true });
  updateHeaderStickyOffset();

  // Sticky Feature Cards Scroll Behavior (scale down and fade cards behind below pinned header)
  const featureCards = /** @type {HTMLElement[]} */ (
    Array.from(document.querySelectorAll('.features-stack .feature-card'))
  );
  const featuresHeader = /** @type {HTMLElement | null} */ (
    document.querySelector('.features-header')
  );

  if (featureCards.length > 1) {
    let rafPending = false;
    const updateCardStacking = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const cardStickyTop =
          parseFloat(window.getComputedStyle(featureCards[0]).top) || (window.innerWidth < 640 ? 240 : 275);
        const trigger = cardStickyTop + 8;
        const cards = featureCards;
        // 1. batch reads
        const rects = cards.map((c) => c.getBoundingClientRect());
        // 2. batch writes: stacking state
        for (let i = 0; i < cards.length - 1; i++) {
          if (rects[i + 1].top <= trigger) {
            cards[i].classList.add('stacked-behind');
          } else {
            cards[i].classList.remove('stacked-behind');
          }
        }
        // 3. Lockstep exit: when the final card is pulled up as the stack ends,
        // translate the header upward in lockstep so it scrolls away naturally
        // with the cards, preventing the cards from climbing into the header
        // and preventing the header from remaining frozen over empty space.
        if (featuresHeader) {
          const lastCardTop = rects[cards.length - 1].top;
          const pullUp = Math.max(0, cardStickyTop - lastCardTop);
          if (pullUp > 0) {
            featuresHeader.style.transform = `translateY(-${pullUp}px)`;
          } else if (featuresHeader.style.transform) {
            featuresHeader.style.transform = '';
          }
        }
      });
    };
    window.addEventListener('scroll', updateCardStacking, { passive: true });
    updateCardStacking();
  }

  // Scroll Animations using Intersection Observer (Blur Unveil & Highlight Sweeps)
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
            entry.target.querySelectorAll('.highlight').forEach((h) => {
              h.classList.add('active');
            });
            if (entry.target.id === 'features' || entry.target.querySelector('#compression-bar')) {
              const bar = document.getElementById('compression-bar');
              bar?.classList.add('animated');
            }
          }
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    // Trigger any above-the-fold hero highlights after slight delay for cinematic reveal
    setTimeout(() => {
      document.querySelectorAll('#hero .highlight').forEach((h) => h.classList.add('active'));
    }, 350);
  } else {
    document.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
    document.querySelectorAll('.highlight').forEach((h) => h.classList.add('active'));
    const bar = document.getElementById('compression-bar');
    bar?.classList.add('animated');
  }

  // Keyboard accessibility for radio tabs (iOS / Android)
  document.querySelectorAll('.tab-label').forEach((label) => {
    label.addEventListener('keydown', (e) => {
      const evt = /** @type {KeyboardEvent} */ (e);
      if (evt.key === ' ' || evt.key === 'Enter') {
        evt.preventDefault();
        const targetId = label.getAttribute('for');
        if (targetId) {
          const input = /** @type {HTMLInputElement | null} */ (document.getElementById(targetId));
          if (input) {
            input.checked = true;
          }
        }
      }
    });
  });
}

// Initial mount: show Home view & wire up landing interactions
showHome();
initLandingPageInteractions();

// Service Worker registration for offline PWA capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// Test harness hooks for automated verification
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__rewhatsapp_test = {
    showEpilogue: () => showEpilogue(),
    toggleInsights: () => toggleInsights(),
    openPalette: () => openPalette(),
    showHome: () => showHome(),
  };
}
