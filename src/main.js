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

/**
 * Composition root for rewhatsapp.
 * Coordinates view transitions, state management, and user interaction.
 */

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

// Instantiate Home view
const homeView = createHomeView({
  onFileSelected: handleFileSelected,
  onDemoSelected: handleDemoSelected,
  onOpenPrivacy: () => openModal(createPrivacyModal({ onClose: closeModal })),
});

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

  document.documentElement.dataset.theme = 'dark';
  if (metaThemeColor) metaThemeColor.content = '#090a1a';

  appRoot.textContent = '';
  appRoot.appendChild(homeView.element);
}

/**
 * Handles incoming file (text or zip).
 * @param {File} file
 */
async function handleFileSelected(file) {
  try {
    const buffer = await file.arrayBuffer();
    const chat = await parseChat(buffer);
    currentChat = chat;
    openSetupDialog(chat);
  } catch (err) {
    window.alert(
      err instanceof Error
        ? err.message
        : "That file doesn't look like a WhatsApp export. Want to try another?",
    );
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
    window.alert(err instanceof Error ? err.message : 'Failed to load demo memory');
  }
}

/**
 * Opens the 3-step setup dialog.
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
 */
async function startReplayFlow(chat, config) {
  // If user toggled date format in setup, reverse date order
  if (config.swapDateFormat) {
    chat.dateOrder = chat.dateOrder === 'DMY' ? 'MDY' : 'DMY';
  }

  // Cinematic Travel Transition: whirl dial backward
  await homeView.whirlDial(600);

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

  // Mount Replay Shell
  appRoot.textContent = '';
  currentReplayHandle = createReplayView({
    player,
    timeline,
    userPersonaRaw: config.userPersonaRaw,
    chatTitle,
    isGroupChat,
    onBack: () => showHome(),
    onOpenInsights: () => toggleInsights(),
    onChatEnd: () => showEpilogue(),
  });

  appRoot.appendChild(currentReplayHandle.element);

  // Start Playback
  player.play();
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

    [1, 2, 5, 10, 20].forEach((spd) => {
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
    id: 'theme',
    title: 'Toggle Theme (Light / Dark)',
    run: () => {
      const current = document.documentElement.dataset.theme;
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      setPref('theme', next);
      if (metaThemeColor) {
        metaThemeColor.content = next === 'light' ? '#008069' : '#202c33';
      }
    },
  });

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
      const speeds = [0.5, 1, 2, 5, 10, 20];
      const next = speeds.find((s) => s > (currentPlayer?.speed ?? 1)) || 20;
      currentPlayer.setSpeed(next);
    } else if (e.key === '[') {
      e.preventDefault();
      const speeds = [20, 10, 5, 2, 1, 0.5];
      const next = speeds.find((s) => s < (currentPlayer?.speed ?? 1)) || 0.5;
      currentPlayer.setSpeed(next);
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

// Initial mount: show Home view
showHome();

// Service Worker registration for offline PWA capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
