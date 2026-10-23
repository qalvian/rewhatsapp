// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';
import { getVolume, setVolume } from '../../audio/synth.js';

export const SPEED_RATINGS = [
  {
    rating: 0.5,
    badge: '0.5×',
    title: 'Slow Motion',
    desc: 'Relaxed reading pace with longer pauses',
    label: '0.5× (Slow)',
  },
  {
    rating: 0.75,
    badge: '0.75×',
    title: 'Gentle Pace',
    desc: 'Slightly slower than normal typing',
    label: '0.75× (Gentle)',
  },
  {
    rating: 1,
    badge: '1×',
    title: 'Normal Speed',
    desc: 'Realistic natural human typing cadence',
    label: '1× (Normal Speed)',
  },
  {
    rating: 1.5,
    badge: '1.5×',
    title: 'Brisk Pace',
    desc: 'Smooth, slightly accelerated playback',
    label: '1.5× (Brisk)',
  },
  {
    rating: 2,
    badge: '2×',
    title: '2× Speed',
    desc: 'Accelerated typing playback',
    label: '2× (2x Faster)',
  },
  {
    rating: 3,
    badge: '3×',
    title: '3× Speed',
    desc: 'Triple speed for reviewing long conversations',
    label: '3× (3x Faster)',
  },
  {
    rating: 4,
    badge: '4×',
    title: '4× Speed',
    desc: 'Rapid catch-up skim',
    label: '4× (4x Faster)',
  },
];

/**
 * Trigger subtle haptic feedback on supported mobile devices.
 */
function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(8);
    } catch {
      // Ignore
    }
  }
}

/**
 * Creates the floating playback control pill and its collapsible FAB state.
 *
 * @param {Object} params
 * @param {() => void} params.onPlayPause
 * @param {() => void} params.onPrev
 * @param {() => void} params.onNext
 * @param {(speedRating: number) => void} params.onSpeedChange
 * @param {() => void} [params.onLeave]
 * @param {() => void} params.onInsightsClick
 * @param {() => void} params.onToggleFullscreen
 * @param {() => void} params.onToggleMute
 * @param {boolean} [params.initialMuted=false]
 * @returns {{
 *   element: HTMLElement;
 *   setPlaying: (isPlaying: boolean) => void;
 *   setSpeed: (speed: number, rating?: number) => void;
 *   setMuted: (isMuted: boolean) => void;
 *   resetAutoHide: () => void;
 *   toggleVisibility: () => void;
 *   collapse: () => void;
 *   expand: () => void;
 *   toggleCollapse: () => void;
 * }}
 */
export function createControlsPill({
  onPlayPause,
  onPrev,
  onNext,
  onSpeedChange,
  onLeave,
  onInsightsClick,
  onToggleFullscreen,
  onToggleMute,
  initialMuted = false,
}) {
  let isPlaying = false;
  let currentSpeedRating = 1;
  let isMuted = initialMuted;
  let isCollapsed = false;
  /** @type {any} */
  let hideTimeout = null;

  // 1. Leave Replay button
  const leaveBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-leave',
      aria: { label: 'Leave replay and return home' },
      title: 'Leave replay',
      onClick: () => {
        haptic();
        if (onLeave) onLeave();
      },
    },
    createIcon('log-out', { width: 16, height: 16 }),
  );

  // 2. Play / Pause button
  const playIcon = createIcon('play', { width: 18, height: 18 });
  const pauseIcon = createIcon('pause', { width: 18, height: 18 });

  const playPauseBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-playpause',
      aria: { label: 'Play or pause replay (Space)' },
      onClick: () => {
        haptic();
        onPlayPause();
      },
    },
    playIcon,
  );

  // 3. Prev / Next buttons
  const prevBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-prev',
      aria: { label: 'Previous message (Left arrow)' },
      onClick: () => {
        haptic();
        onPrev();
      },
    },
    createIcon('arrow-left', { width: 16, height: 16 }),
  );

  const nextBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-next',
      aria: { label: 'Next message (Right arrow)' },
      onClick: () => {
        haptic();
        onNext();
      },
    },
    createIcon('arrow-right', { width: 16, height: 16 }),
  );

  // 4. Speed Multiplier Control (-4x to +4x)
  const speedWrapper = el('div', { className: 'wa-ctrl-speed-wrapper' });
  const speedBtn = el('button', {
    className: 'wa-ctrl-btn wa-ctrl-speed',
    aria: { label: 'Playback speed (-4x to +4x)' },
    text: '1×',
  });

  const speedPopover = el('div', {
    className: 'wa-speed-popover',
    style: 'display: none;',
    role: 'menu',
    aria: { label: 'Select playback speed (0.5x to 4x)' },
  });

  function renderSpeedOptions() {
    speedPopover.innerHTML = '';

    const currentItem =
      SPEED_RATINGS.find((r) => Math.abs(r.rating - currentSpeedRating) < 0.01) || SPEED_RATINGS[2];

    // Header with title and active badge
    const header = el(
      'div',
      { className: 'wa-speed-popover-header' },
      el('span', { className: 'wa-speed-popover-title', text: 'Replay Speed' }),
      el('span', {
        className: `wa-speed-active-badge ${currentSpeedRating < 1 ? 'badge-slow' : currentSpeedRating > 1 ? 'badge-fast' : 'badge-normal'}`,
        text: currentItem ? `${currentItem.badge} · ${currentItem.title}` : '1×',
      }),
    );

    // Section 1: Slower
    const slowSection = el('div', { className: 'wa-speed-section' });
    const slowLabel = el('div', { className: 'wa-speed-section-label', text: 'Slow Motion' });
    const slowGrid = el('div', { className: 'wa-speed-grid' });

    // Section 2: Normal & Faster
    const fastSection = el('div', { className: 'wa-speed-section' });
    const fastLabel = el('div', { className: 'wa-speed-section-label', text: 'Normal & Fast' });
    const fastGrid = el('div', { className: 'wa-speed-grid' });

    // Live Caption Footer
    const captionEl = el('div', {
      className: 'wa-speed-caption',
      text: currentItem ? currentItem.desc : 'Realistic natural human typing speed',
    });

    const slowerRatings = SPEED_RATINGS.filter((r) => r.rating < 1);
    const fasterRatings = SPEED_RATINGS.filter((r) => r.rating >= 1);

    /** @param {(typeof SPEED_RATINGS)[number]} item */
    const makeChip = (item) => {
      const isSelected = Math.abs(item.rating - currentSpeedRating) < 0.01;
      const chip = el(
        'button',
        {
          className: `wa-speed-chip ${isSelected ? 'active' : ''} ${item.rating < 1 ? 'opt-slow' : item.rating > 1 ? 'opt-fast' : 'opt-normal'}`,
          type: 'button',
          title: `${item.title}: ${item.desc}`,
          aria: { label: `${item.title} (${item.badge})` },
          onClick: (/** @type {MouseEvent} */ e) => {
            e.stopPropagation();
            haptic();
            currentSpeedRating = item.rating;
            onSpeedChange(item.rating);
            updateSpeedUI(item.rating);
            speedPopover.style.display = 'none';
          },
          onMouseEnter: () => {
            captionEl.textContent = `${item.badge} ${item.title}: ${item.desc}`;
          },
          onMouseLeave: () => {
            const active = SPEED_RATINGS.find(
              (r) => Math.abs(r.rating - currentSpeedRating) < 0.01,
            );
            captionEl.textContent = active ? active.desc : '';
          },
        },
        el('span', { className: 'wa-speed-chip-badge', text: item.badge }),
      );
      return chip;
    };

    slowerRatings.forEach((item) => slowGrid.appendChild(makeChip(item)));
    fasterRatings.forEach((item) => fastGrid.appendChild(makeChip(item)));

    slowSection.append(slowLabel, slowGrid);
    fastSection.append(fastLabel, fastGrid);

    speedPopover.append(header, slowSection, fastSection, captionEl);
  }

  speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    haptic();
    const isShowing = speedPopover.style.display === 'flex';
    if (!isShowing) {
      renderSpeedOptions();
      speedPopover.style.display = 'flex';
    } else {
      speedPopover.style.display = 'none';
    }
  });

  speedWrapper.append(speedBtn, speedPopover);

  // 5. Audio controls: Mute toggle + Volume Slider
  const audioGroup = el('div', { className: 'wa-ctrl-audio-group' });
  const muteBtn = el('button', {
    className: 'wa-ctrl-btn wa-ctrl-mute',
    aria: { label: 'Toggle audio sound (M)' },
    onClick: () => {
      haptic();
      onToggleMute();
    },
  });
  updateMuteButton(muteBtn, isMuted);

  const volSlider = /** @type {HTMLInputElement} */ (
    el('input', {
      type: 'range',
      min: '0',
      max: '1',
      step: '0.05',
      value: String(getVolume()),
      className: 'wa-ctrl-vol-slider',
      aria: { label: 'Audio volume' },
    })
  );

  volSlider.addEventListener('input', () => {
    const val = parseFloat(volSlider.value);
    setVolume(val);
    if (val > 0 && isMuted) {
      onToggleMute();
    }
  });

  audioGroup.append(muteBtn, volSlider);

  // 6. Insights Dashboard button
  const insightsBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-insights',
      aria: { label: 'Open Analytics & Insights Dashboard (I)' },
      title: 'Analytics Dashboard',
      onClick: () => {
        haptic();
        onInsightsClick();
      },
    },
    createIcon('insights', { width: 16, height: 16 }),
  );

  // 7. Fullscreen button
  const fsBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-fs',
      aria: { label: 'Toggle fullscreen (F)' },
      onClick: () => {
        haptic();
        onToggleFullscreen();
      },
    },
    createIcon('fullscreen', { width: 16, height: 16 }),
  );

  // 8. Compress to Floating Action Button (FAB)
  const collapseBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-collapse',
      aria: { label: 'Compress controls into draggable floating button' },
      title: 'Compress controls',
      onClick: () => {
        haptic();
        collapse();
      },
    },
    createIcon('chevron-down', { width: 17, height: 17 }),
  );

  // Full Expanded Pill Toolbar
  const pill = el(
    'div',
    {
      className: 'wa-controls-pill',
      role: 'toolbar',
      aria: { label: 'Replay controls' },
    },
    leaveBtn,
    el('div', { className: 'wa-ctrl-divider' }),
    prevBtn,
    playPauseBtn,
    nextBtn,
    el('div', { className: 'wa-ctrl-divider' }),
    speedWrapper,
    el('div', { className: 'wa-ctrl-divider' }),
    audioGroup,
    insightsBtn,
    fsBtn,
    collapseBtn,
  );

  // Small Floating Action Button (FAB) when compressed (Draggable anywhere on the screen)
  const fabSpeedBadge = el('span', { className: 'wa-ctrl-fab-speed', text: '1×' });
  const fab = el(
    'button',
    {
      className: 'wa-ctrl-fab',
      type: 'button',
      style: 'display: none;',
      aria: { label: 'Expand playback controls (drag to reposition)' },
      title: 'Expand controls (drag to move)',
    },
    createIcon('sliders', { width: 18, height: 18 }),
    fabSpeedBadge,
  );

  // Smooth dragging support for the FAB
  let isDraggingFab = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let fabInitialLeft = 0;
  let fabInitialTop = 0;
  let hasMovedFab = false;

  fab.addEventListener('pointerdown', (e) => {
    isDraggingFab = true;
    hasMovedFab = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const r = fab.getBoundingClientRect();
    fabInitialLeft = r.left;
    fabInitialTop = r.top;
    fab.setPointerCapture?.(e.pointerId);
  });

  fab.addEventListener('pointermove', (e) => {
    if (!isDraggingFab) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedFab = true;
    }
    if (hasMovedFab) {
      const w = fab.offsetWidth || 60;
      const h = fab.offsetHeight || 44;
      const margin = 12;

      let newLeft = fabInitialLeft + dx;
      let newTop = fabInitialTop + dy;

      newLeft = Math.max(margin, Math.min(newLeft, window.innerWidth - w - margin));
      newTop = Math.max(margin, Math.min(newTop, window.innerHeight - h - margin));

      fab.style.position = 'fixed';
      fab.style.left = `${newLeft}px`;
      fab.style.top = `${newTop}px`;
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
    }
  });

  /** @param {PointerEvent} e */
  const handleFabPointerUp = (e) => {
    if (!isDraggingFab) return;
    isDraggingFab = false;
    try {
      fab.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
    if (!hasMovedFab) {
      haptic();
      expand();
    } else {
      setTimeout(() => {
        hasMovedFab = false;
      }, 50);
    }
  };

  fab.addEventListener('pointerup', handleFabPointerUp);
  fab.addEventListener('pointercancel', handleFabPointerUp);
  fab.addEventListener('click', () => {
    if (!hasMovedFab) {
      haptic();
      expand();
    }
  });

  // Outer wrapper container
  const container = el('div', { className: 'wa-controls-wrapper' }, pill, fab);

  // Close speed popover when clicking anywhere outside
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      if (!speedWrapper.contains(/** @type {Node} */ (e.target))) {
        speedPopover.style.display = 'none';
      }
    });
  }

  // Desktop Magnetic Hover on Pill
  pill.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 1024) return;
    const rect = pill.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = Math.max(-10, Math.min(10, (e.clientX - centerX) * 0.12));
    const dy = Math.max(-6, Math.min(6, (e.clientY - centerY) * 0.12));
    pill.style.transform = `translateX(calc(-50% + ${dx.toFixed(1)}px)) translateY(${dy.toFixed(1)}px)`;
  });

  pill.addEventListener('mouseleave', () => {
    pill.style.transform = 'translateX(-50%) translateY(0)';
  });

  /**
   * Resets the auto-hide timer (hides controls after 2.8s of idle time during playback).
   */
  function resetAutoHide() {
    container.classList.remove('wa-controls-hidden');
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    if (isPlaying && !isCollapsed) {
      hideTimeout = setTimeout(() => {
        container.classList.add('wa-controls-hidden');
      }, 2800);
    }
  }

  pill.addEventListener('mouseenter', () => {
    container.classList.remove('wa-controls-hidden');
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  pill.addEventListener('mouseleave', () => {
    if (isPlaying) resetAutoHide();
  });

  function collapse() {
    isCollapsed = true;
    pill.style.display = 'none';
    fab.style.display = 'flex';
    container.classList.add('is-collapsed');
  }

  function expand() {
    isCollapsed = false;
    fab.style.display = 'none';
    pill.style.display = 'flex';
    container.classList.remove('is-collapsed');
    resetAutoHide();
  }

  /**
   * @param {number} rating
   */
  function updateSpeedUI(rating) {
    const item = SPEED_RATINGS.find((r) => Math.abs(r.rating - rating) < 0.01);
    const text = item ? item.badge : `${rating}×`;
    speedBtn.textContent = text;
    fabSpeedBadge.textContent = text;
  }

  return {
    element: container,
    setPlaying: (playing) => {
      isPlaying = playing;
      playPauseBtn.replaceChildren(playing ? pauseIcon : playIcon);
      resetAutoHide();
    },
    setSpeed: (speed, rating) => {
      const activeRating = typeof rating === 'number' ? rating : speed;
      currentSpeedRating = activeRating;
      updateSpeedUI(activeRating);
      resetAutoHide();
    },
    setMuted: (muted) => {
      isMuted = muted;
      updateMuteButton(muteBtn, muted);
      resetAutoHide();
    },
    collapse,
    expand,
    toggleCollapse: () => {
      if (isCollapsed) expand();
      else collapse();
    },
    resetAutoHide,
    toggleVisibility: () => {
      container.classList.toggle('wa-controls-hidden');
    },
  };
}

/**
 * @param {HTMLElement} btn
 * @param {boolean} isMuted
 */
function updateMuteButton(btn, isMuted) {
  btn.textContent = '';
  btn.appendChild(
    isMuted
      ? createIcon('volume-off', { width: 16, height: 16 })
      : createIcon('volume', { width: 16, height: 16 }),
  );
}
