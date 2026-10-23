// @ts-check

import { el, svgEl } from '../../util/dom.js';

const SPEEDS = [0.5, 1, 2, 5, 10, 20];

/**
 * Creates the floating frosted-glass playback control pill.
 *
 * @param {Object} params
 * @param {() => void} params.onPlayPause
 * @param {() => void} params.onPrev
 * @param {() => void} params.onNext
 * @param {(speed: number) => void} params.onSpeedChange
 * @param {(mode: import('../../core/timeline.js').GapMode) => void} params.onGapModeChange
 * @param {() => void} params.onInsightsClick
 * @param {() => void} params.onToggleFullscreen
 * @param {() => void} params.onToggleMute
 * @param {boolean} [params.initialMuted=false]
 * @returns {{
 *   element: HTMLElement;
 *   setPlaying: (isPlaying: boolean) => void;
 *   setSpeed: (speed: number) => void;
 *   setGapMode: (mode: import('../../core/timeline.js').GapMode) => void;
 *   setMuted: (isMuted: boolean) => void;
 *   resetAutoHide: () => void;
 *   toggleVisibility: () => void;
 * }}
 */
export function createControlsPill({
  onPlayPause,
  onPrev,
  onNext,
  onSpeedChange,
  onGapModeChange,
  onInsightsClick,
  onToggleFullscreen,
  onToggleMute,
  initialMuted = false,
}) {
  let isPlaying = false;
  let currentSpeed = 1.0;
  /** @type {import('../../core/timeline.js').GapMode} */
  let currentGapMode = 'smart';
  let isMuted = initialMuted;
  /** @type {any} */
  let hideTimeout = null;

  // 1. Play / Pause SVGs
  const playSvg = svgEl(
    'svg',
    { viewBox: '0 0 24 24', width: '22', height: '22' },
    svgEl('polygon', { points: '6,4 20,12 6,20', fill: 'currentColor' }),
  );

  const pauseSvg = svgEl(
    'svg',
    { viewBox: '0 0 24 24', width: '22', height: '22' },
    svgEl('rect', { x: '5', y: '4', width: '4', height: '16', rx: '1', fill: 'currentColor' }),
    svgEl('rect', { x: '15', y: '4', width: '4', height: '16', rx: '1', fill: 'currentColor' }),
  );

  const playPauseBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn wa-ctrl-playpause',
      aria: { label: 'Play or pause replay (Space)' },
      onClick: () => onPlayPause(),
    },
    playSvg,
  );

  // 2. Prev / Next buttons
  const prevBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn',
      aria: { label: 'Previous message (Left arrow)' },
      onClick: () => onPrev(),
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '18', height: '18' },
      svgEl('polygon', { points: '18,5 8,12 18,19', fill: 'currentColor' }),
      svgEl('line', {
        x1: '6',
        y1: '5',
        x2: '6',
        y2: '19',
        stroke: 'currentColor',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
      }),
    ),
  );

  const nextBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn',
      aria: { label: 'Next message (Right arrow)' },
      onClick: () => onNext(),
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '18', height: '18' },
      svgEl('polygon', { points: '6,5 16,12 6,19', fill: 'currentColor' }),
      svgEl('line', {
        x1: '18',
        y1: '5',
        x2: '18',
        y2: '19',
        stroke: 'currentColor',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
      }),
    ),
  );

  // 3. Speed Chip (cycles through 0.5x, 1x, 2x, 5x, 10x, 20x)
  const speedBtn = el('button', {
    className: 'wa-ctrl-btn wa-ctrl-speed',
    aria: { label: 'Cycle playback speed ([ and ])' },
    text: '1×',
    onClick: () => {
      const curIndex = SPEEDS.indexOf(currentSpeed);
      const nextIndex = (curIndex + 1) % SPEEDS.length;
      const newSpeed = SPEEDS[nextIndex] ?? 1.0;
      onSpeedChange(newSpeed);
    },
  });

  // 4. Smart Time mode toggle button
  const gapModeBtn = el('button', {
    className: 'wa-ctrl-btn wa-ctrl-gapmode',
    aria: { label: 'Toggle Smart Time compression mode' },
    text: '⚡ Smart',
    onClick: () => {
      const nextMode =
        currentGapMode === 'smart' ? 'realtime' : currentGapMode === 'realtime' ? 'fixed' : 'smart';
      onGapModeChange(nextMode);
    },
  });

  // 5. Insights Dashboard button
  const insightsBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn',
      aria: { label: 'Open Insights Dashboard (I)' },
      onClick: () => onInsightsClick(),
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '18', height: '18' },
      svgEl('path', {
        d: 'M 4 20 L 20 20',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      }),
      svgEl('rect', { x: '6', y: '12', width: '3', height: '6', rx: '1', fill: 'currentColor' }),
      svgEl('rect', { x: '11', y: '8', width: '3', height: '10', rx: '1', fill: 'currentColor' }),
      svgEl('rect', { x: '16', y: '4', width: '3', height: '14', rx: '1', fill: 'currentColor' }),
    ),
  );

  // 6. Mute toggle button
  const muteBtn = el('button', {
    className: 'wa-ctrl-btn wa-ctrl-mute',
    aria: { label: 'Toggle audio sound (M)' },
    onClick: () => onToggleMute(),
  });
  updateMuteButton(muteBtn, isMuted);

  // 7. Fullscreen button
  const fsBtn = el(
    'button',
    {
      className: 'wa-ctrl-btn',
      aria: { label: 'Toggle fullscreen (F)' },
      onClick: () => onToggleFullscreen(),
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '18', height: '18' },
      svgEl('path', {
        d: 'M 4 9 L 4 4 L 9 4 M 15 4 L 20 4 L 20 9 M 20 15 L 20 20 L 15 20 M 9 20 L 4 20 L 4 15',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2.2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ),
  );

  const container = el(
    'div',
    {
      className: 'wa-controls-pill',
      role: 'toolbar',
      aria: { label: 'Replay controls' },
    },
    prevBtn,
    playPauseBtn,
    nextBtn,
    el('div', { className: 'wa-ctrl-divider' }),
    speedBtn,
    gapModeBtn,
    el('div', { className: 'wa-ctrl-divider' }),
    muteBtn,
    insightsBtn,
    fsBtn,
  );

  /**
   * Resets the auto-hide timer (hides pill after 2.5s of idle time during playback).
   */
  function resetAutoHide() {
    container.classList.remove('wa-controls-hidden');
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    if (isPlaying) {
      hideTimeout = setTimeout(() => {
        container.classList.add('wa-controls-hidden');
      }, 2500);
    }
  }

  container.addEventListener('mouseenter', () => {
    container.classList.remove('wa-controls-hidden');
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  container.addEventListener('mouseleave', () => {
    if (isPlaying) resetAutoHide();
  });

  return {
    element: container,
    setPlaying: (playing) => {
      isPlaying = playing;
      playPauseBtn.replaceChildren(playing ? pauseSvg : playSvg);
      resetAutoHide();
    },
    setSpeed: (speed) => {
      currentSpeed = speed;
      speedBtn.textContent = `${speed}×`;
      resetAutoHide();
    },
    setGapMode: (mode) => {
      currentGapMode = mode;
      gapModeBtn.textContent =
        mode === 'smart' ? '⚡ Smart' : mode === 'realtime' ? '⏱️ Real' : '⏳ Fixed';
      resetAutoHide();
    },
    setMuted: (muted) => {
      isMuted = muted;
      updateMuteButton(muteBtn, muted);
      resetAutoHide();
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
  if (isMuted) {
    btn.appendChild(
      svgEl(
        'svg',
        { viewBox: '0 0 24 24', width: '18', height: '18' },
        svgEl('path', { d: 'M 11 5 L 6 9 L 2 9 L 2 15 L 6 15 L 11 19 Z', fill: 'currentColor' }),
        svgEl('line', {
          x1: '23',
          y1: '9',
          x2: '17',
          y2: '15',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
        }),
        svgEl('line', {
          x1: '17',
          y1: '9',
          x2: '23',
          y2: '15',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
        }),
      ),
    );
  } else {
    btn.appendChild(
      svgEl(
        'svg',
        { viewBox: '0 0 24 24', width: '18', height: '18' },
        svgEl('path', { d: 'M 11 5 L 6 9 L 2 9 L 2 15 L 6 15 L 11 19 Z', fill: 'currentColor' }),
        svgEl('path', {
          d: 'M 15.5 8.5 A 5 5 0 0 1 15.5 15.5',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: 'M 19 5 A 9 9 0 0 1 19 19',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
        }),
      ),
    );
  }
}
