// @ts-check

import { el } from '../../util/dom.js';
import { createWallpaperElement } from './wallpaper.js';
import { createReplayHeader } from './header.js';
import { createScrubber } from './scrubber.js';
import { createChatView } from './chat-view.js';
import { createComposer } from './composer.js';
import { createControlsPill } from './controls.js';
import { computeScrubberBuckets } from '../../core/analytics/sentiment.js';
import {
  playSendSound,
  playReceiveSound,
  playTickSound,
  getIsMuted,
  toggleMuted,
} from '../../audio/synth.js';
import { announce } from '../../util/a11y.js';

/**
 * Creates the complete WhatsApp replay experience container.
 *
 * @param {Object} params
 * @param {import('../../core/player.js').ChatPlayer} params.player
 * @param {import('../../core/timeline.js').Timeline} params.timeline
 * @param {string} params.userPersonaRaw
 * @param {string} params.chatTitle
 * @param {boolean} [params.isGroupChat=false]
 * @param {() => void} params.onBack
 * @param {() => void} params.onOpenInsights
 * @param {() => void} [params.onChatEnd]
 * @returns {{
 *   element: HTMLElement;
 *   destroy: () => void;
 *   toggleFullscreen: () => void;
 * }}
 */
export function createReplayView({
  player,
  timeline,
  userPersonaRaw,
  chatTitle,
  isGroupChat = false,
  onBack,
  onOpenInsights,
  onChatEnd,
}) {
  const container = el('div', {
    className: 'view-replay',
    dataset: { view: 'replay' },
  });

  // 1. Wallpaper background layer
  const wallpaper = createWallpaperElement();
  container.appendChild(wallpaper);

  // 2. Header
  const header = createReplayHeader({
    title: chatTitle,
    subtext: 'online',
    onBack: () => {
      player.pause();
      releaseWakeLock();
      onBack();
    },
    onMenuClick: onOpenInsights,
  });
  container.appendChild(header.element);

  // 3. Emotion sparkline scrubber
  const buckets = computeScrubberBuckets(timeline.messages, 80);
  const scrubber = createScrubber({
    timeline,
    buckets,
    onSeek: (progress) => {
      player.seekByProgress(progress);
    },
  });
  container.appendChild(scrubber.element);

  // 4. Windowed Chat View
  const chatView = createChatView({
    timeline,
    userPersonaRaw,
    isGroupChat,
  });
  container.appendChild(chatView.element);

  // 5. Composer bar with typing simulation
  const composer = createComposer({
    onSend: () => {
      // Decorative send
    },
  });
  container.appendChild(composer.element);

  // 6. Floating Controls Pill
  const controls = createControlsPill({
    onPlayPause: () => player.togglePlay(),
    onPrev: () => player.prevMessage(),
    onNext: () => player.nextMessage(),
    onSpeedChange: (speed) => player.setSpeed(speed),
    onGapModeChange: (mode) => player.setGapMode(mode),
    onInsightsClick: onOpenInsights,
    onToggleFullscreen: () => toggleFullscreen(),
    onToggleMute: () => {
      const newMuted = toggleMuted();
      controls.setMuted(newMuted);
    },
    initialMuted: getIsMuted(),
  });
  container.appendChild(controls.element);

  // Screen Wake Lock
  /** @type {any} */
  let wakeLock = null;

  async function requestWakeLock() {
    if ('wakeLock' in navigator && !wakeLock) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
        });
      } catch {
        // Ignore wake lock denial
      }
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  }

  // Fullscreen with iPhone immersive fallback
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {
        // Fallback to immersive CSS mode
        container.classList.toggle('wa-immersive-mode');
      });
    } else {
      // iPhone Safari lacks element fullscreen API
      container.classList.toggle('wa-immersive-mode');
    }
  }

  // Toggle controls on tapping empty chat area
  chatView.element.addEventListener('click', (e) => {
    // Only toggle if not clicking interactive message links
    if (e.target instanceof HTMLElement && e.target.closest('a, button')) return;
    controls.toggleVisibility();
  });

  // Mouse move in container resets control auto-hide
  container.addEventListener('mousemove', () => {
    controls.resetAutoHide();
  });

  // Wire Player Events
  const unsubs = [
    player.on(
      'message',
      /** @param {{ message: import('../../core/parser/index.js').ChatMessage, isSeek: boolean }} payload */
      async ({ message, isSeek }) => {
        if (isSeek) {
          chatView.renderWindowAroundIndex(message.id);
          return;
        }

        const isOutgoing = message.senderRaw === userPersonaRaw;

        if (isOutgoing) {
          // Outgoing: simulate typing in composer if speed < 10
          if (player.speed < 10 && message.text) {
            const typeDuration =
              Math.min(600, Math.max(120, message.text.length * 15)) / player.speed;
            await composer.simulateTyping(message.text, typeDuration);
          }
          playSendSound();
          chatView.appendMessage(message, message.id);
          announce(`You: ${message.text}`);
        } else {
          // Incoming message
          if (player.speed < 10) {
            header.setStatus('typing…');
            const delay = Math.min(500, Math.max(100, message.text.length * 10)) / player.speed;
            setTimeout(() => {
              header.setStatus('online');
            }, delay);
          }
          playReceiveSound();
          chatView.appendMessage(message, message.id);
          announce(`${message.senderDisplayName}: ${message.text}`);
        }
      },
    ),

    player.on(
      'timeskip',
      /** @param {{ gapMs: number }} payload */ ({ gapMs }) => {
        chatView.appendTimeSkip(gapMs);
        playTickSound();
      },
    ),

    player.on(
      'timeupdate',
      /** @param {{ progress: number }} payload */ ({ progress }) => {
        scrubber.setProgress(progress);
      },
    ),

    player.on(
      'statechange',
      /** @param {{ state: string }} payload */ ({ state }) => {
        controls.setPlaying(state === 'PLAYING');
        if (state === 'PLAYING') {
          requestWakeLock();
        } else {
          releaseWakeLock();
        }
      },
    ),

    player.on(
      'speedchange',
      /** @param {{ speed: number }} payload */ ({ speed }) => {
        controls.setSpeed(speed);
      },
    ),

    player.on('end', () => {
      releaseWakeLock();
      if (onChatEnd) onChatEnd();
    }),
  ];

  // Initial render: show first few messages
  chatView.renderWindowAroundIndex(0);

  return {
    element: container,
    destroy: () => {
      releaseWakeLock();
      player.pause();
      for (const unsub of unsubs) unsub();
    },
    toggleFullscreen,
  };
}
