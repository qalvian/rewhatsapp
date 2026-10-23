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
  setAudioPlaybackSpeed,
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

  // 5. Composer bar with dynamic typing simulation
  const composer = createComposer({
    onSend: () => {
      // Decorative send
    },
  });
  container.appendChild(composer.element);

  // 6. Floating Controls Pill with Collapsible FAB & -4x to +4x speed
  const controls = createControlsPill({
    onPlayPause: () => player.togglePlay(),
    onPrev: () => player.prevMessage(),
    onNext: () => player.nextMessage(),
    onSpeedChange: (rating) => player.setSpeed(rating),
    onLeave: () => {
      player.pause();
      releaseWakeLock();
      onBack();
    },
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
        container.classList.toggle('wa-immersive-mode');
      });
    } else {
      container.classList.toggle('wa-immersive-mode');
    }
  }

  // Toggle controls on tapping empty chat area
  chatView.element.addEventListener('click', (e) => {
    if (e.target instanceof HTMLElement && e.target.closest('a, button')) return;
    controls.toggleVisibility();
  });

  // Mouse move in container resets control auto-hide
  container.addEventListener('mousemove', () => {
    controls.resetAutoHide();
  });

  // 7. Dynamic Typing & Message Dispatch Logic
  // Synchronized directly with player virtual time
  const unsubs = [
    player.on(
      'timeupdate',
      /** @param {{ virtualTime: number, progress: number, currentIndex: number }} payload */
      ({ virtualTime, progress, currentIndex }) => {
        scrubber.setProgress(progress);

        // Simulate typing for next message in flight
        const nextIdx = currentIndex + 1;
        const nextMsg = timeline.messages[nextIdx];

        if (nextMsg && player.state === 'PLAYING') {
          const tPrev = currentIndex >= 0 ? (timeline.cumulativeDuration[currentIndex] ?? 0) : 0;
          const tNext = timeline.cumulativeDuration[nextIdx] ?? 0;
          const span = tNext - tPrev;

          if (span > 0) {
            const frac = Math.max(0, Math.min(1, (virtualTime - tPrev) / span));
            const isOutgoing = nextMsg.senderRaw === userPersonaRaw;

            if (isOutgoing) {
              const charLen = (nextMsg.text || '').length;
              const charsToShow = Math.floor(frac * charLen);
              composer.setText(nextMsg.text.slice(0, charsToShow));
              header.setStatus('online');
              chatView.hideTypingIndicator();
            } else {
              composer.setText('');
              header.setStatus('typing…');
              chatView.showTypingIndicator();
            }
          }
        } else if (player.state !== 'PLAYING') {
          chatView.hideTypingIndicator();
          if (currentIndex >= timeline.messages.length - 1) {
            composer.setText('');
            header.setStatus('online');
          }
        }
      },
    ),

    player.on(
      'message',
      /** @param {{ message: import('../../core/parser/index.js').ChatMessage, isSeek: boolean }} payload */
      ({ message, isSeek }) => {
        chatView.hideTypingIndicator();
        if (isSeek) {
          composer.clear();
          header.setStatus('online');
          chatView.renderWindowAroundIndex(message.id, false);
          return;
        }

        const isOutgoing = message.senderRaw === userPersonaRaw;

        if (isOutgoing) {
          composer.clear();
          playSendSound();
          chatView.appendMessage(message, message.id);
          announce(`You: ${message.text}`);
        } else {
          header.setStatus('online');
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
      /** @param {{ speed: number, rating: number }} payload */ ({ speed, rating }) => {
        controls.setSpeed(speed, rating);
        setAudioPlaybackSpeed(speed);
      },
    ),

    player.on('end', () => {
      releaseWakeLock();
      composer.clear();
      header.setStatus('online');
      chatView.hideTypingIndicator();
      announce('Replay finished. Viewing analytics dashboard.');
      if (onChatEnd) {
        onChatEnd();
      } else {
        onOpenInsights();
      }
    }),
  ];

  setAudioPlaybackSpeed(player.speed);

  // 8. Pre-Flight 3-2-1 Countdown Overlay with "Start Replay" button
  const preflightOverlay = createPreflightOverlay({
    chatTitle,
    onStart: () => {
      preflightOverlay.remove();
      player.play();
    },
  });
  container.appendChild(preflightOverlay);

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

/**
 * Creates the 3-2-1 Pre-Flight Countdown Overlay.
 *
 * @param {Object} params
 * @param {string} params.chatTitle
 * @param {() => void} params.onStart
 * @returns {HTMLElement}
 */
function createPreflightOverlay({ chatTitle, onStart }) {
  let count = 3;
  let timerId = /** @type {any} */ (null);
  let hasStarted = false;

  const countDisplay = el('div', {
    className: 'wa-preflight-number',
    text: '3',
  });

  function startPlayback() {
    if (hasStarted) return;
    hasStarted = true;
    if (timerId) clearInterval(timerId);
    playTickSound();
    onStart();
  }

  const startBtn = el(
    'button',
    {
      className: 'btn btn-primary wa-preflight-start-btn',
      type: 'button',
      onClick: () => {
        startPlayback();
      },
    },
    el('span', { text: 'Start Replay Now' }),
  );

  const card = el(
    'div',
    { className: 'wa-preflight-card' },
    el('span', { className: 'wa-preflight-badge', text: 'Replay Ready' }),
    el('h3', { className: 'wa-preflight-title', text: chatTitle }),
    el('p', { className: 'wa-preflight-sub', text: 'Reliving conversation in' }),
    countDisplay,
    startBtn,
  );

  const overlay = el(
    'div',
    {
      className: 'wa-preflight-overlay',
      role: 'dialog',
      aria: { modal: 'true', label: 'Starting replay' },
    },
    card,
  );

  timerId = setInterval(() => {
    count--;
    if (count > 0) {
      countDisplay.textContent = String(count);
      countDisplay.classList.remove('pulse');
      // Trigger reflow to restart css animation
      void countDisplay.offsetWidth;
      countDisplay.classList.add('pulse');
      playTickSound();
    } else {
      clearInterval(timerId);
      startPlayback();
    }
  }, 900);

  return overlay;
}
