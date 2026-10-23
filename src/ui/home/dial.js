// @ts-check

import { el } from '../../util/dom.js';

/**
 * Creates the celestial Time Dial component.
 * Concentric rings with brass-and-glass aesthetic, dates, and Roman/astronomical ticks.
 *
 * @returns {{
 *   element: HTMLElement;
 *   setSpinSpeed: (multiplier: number) => void;
 *   whirlBackward: (durationMs: number) => Promise<void>;
 * }}
 */
export function createTimeDial() {
  const container = el('div', {
    className: 'wa-time-dial-container',
    aria: { hidden: 'true' },
  });

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 500 500');
  svg.setAttribute('class', 'wa-time-dial-svg');

  // Definitions for gradients & glow filters
  const defs = document.createElementNS(SVG_NS, 'defs');

  // Dial outer ring gradient
  const outerGrad = document.createElementNS(SVG_NS, 'linearGradient');
  outerGrad.setAttribute('id', 'dialOuterGrad');
  outerGrad.setAttribute('x1', '0%');
  outerGrad.setAttribute('y1', '0%');
  outerGrad.setAttribute('x2', '100%');
  outerGrad.setAttribute('y2', '100%');

  const stop1 = document.createElementNS(SVG_NS, 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', 'rgba(235, 185, 120, 0.45)'); // Warm brass/amber
  const stop2 = document.createElementNS(SVG_NS, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', 'rgba(120, 80, 160, 0.25)'); // Dusk violet

  outerGrad.appendChild(stop1);
  outerGrad.appendChild(stop2);
  defs.appendChild(outerGrad);
  svg.appendChild(defs);

  // Group for rotating elements
  const rotatingGroup = document.createElementNS(SVG_NS, 'g');
  rotatingGroup.setAttribute('class', 'wa-dial-rotating-group');
  rotatingGroup.setAttribute('transform-origin', '250 250');

  // Outer Ring
  const outerRing = document.createElementNS(SVG_NS, 'circle');
  outerRing.setAttribute('cx', '250');
  outerRing.setAttribute('cy', '250');
  outerRing.setAttribute('r', '230');
  outerRing.setAttribute('fill', 'none');
  outerRing.setAttribute('stroke', 'url(#dialOuterGrad)');
  outerRing.setAttribute('stroke-width', '1.5');
  outerRing.setAttribute('stroke-dasharray', '4 8');
  rotatingGroup.appendChild(outerRing);

  // Middle Ring
  const midRing = document.createElementNS(SVG_NS, 'circle');
  midRing.setAttribute('cx', '250');
  midRing.setAttribute('cy', '250');
  midRing.setAttribute('r', '195');
  midRing.setAttribute('fill', 'none');
  midRing.setAttribute('stroke', 'rgba(240, 200, 150, 0.25)');
  midRing.setAttribute('stroke-width', '1');
  rotatingGroup.appendChild(midRing);

  // 60 Tick Marks (like a celestial astrolabe)
  const ticksGroup = document.createElementNS(SVG_NS, 'g');
  for (let i = 0; i < 60; i++) {
    const angle = (i * 360) / 60;
    const isMajor = i % 5 === 0;
    const len = isMajor ? 12 : 6;
    const r1 = 195;
    const r2 = r1 - len;
    const rad = (angle * Math.PI) / 180;

    const x1 = 250 + r1 * Math.cos(rad);
    const y1 = 250 + r1 * Math.sin(rad);
    const x2 = 250 + r2 * Math.cos(rad);
    const y2 = 250 + r2 * Math.sin(rad);

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x1.toFixed(1));
    line.setAttribute('y1', y1.toFixed(1));
    line.setAttribute('x2', x2.toFixed(1));
    line.setAttribute('y2', y2.toFixed(1));
    line.setAttribute(
      'stroke',
      isMajor ? 'rgba(245, 215, 160, 0.65)' : 'rgba(200, 170, 230, 0.25)',
    );
    line.setAttribute('stroke-width', isMajor ? '1.5' : '1');
    ticksGroup.appendChild(line);
  }
  rotatingGroup.appendChild(ticksGroup);

  // Inner Astrolabe Ring with 12 Month glyphs/initials
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthsGroup = document.createElementNS(SVG_NS, 'g');
  for (let i = 0; i < 12; i++) {
    const angle = (i * 360) / 12 - 90;
    const rad = (angle * Math.PI) / 180;
    const r = 165;
    const x = 250 + r * Math.cos(rad);
    const y = 250 + r * Math.sin(rad);

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', x.toFixed(1));
    text.setAttribute('y', (y + 4).toFixed(1));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'rgba(235, 195, 140, 0.45)');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-family', 'ui-serif, Georgia, serif');
    text.setAttribute('letter-spacing', '2');
    text.textContent = months[i] || '';
    monthsGroup.appendChild(text);
  }
  rotatingGroup.appendChild(monthsGroup);

  // Inner Counter-rotating ring
  const innerRing = document.createElementNS(SVG_NS, 'circle');
  innerRing.setAttribute('cx', '250');
  innerRing.setAttribute('cy', '250');
  innerRing.setAttribute('r', '135');
  innerRing.setAttribute('fill', 'none');
  innerRing.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
  innerRing.setAttribute('stroke-width', '1');
  innerRing.setAttribute('stroke-dasharray', '2 6');
  rotatingGroup.appendChild(innerRing);

  svg.appendChild(rotatingGroup);
  container.appendChild(svg);

  // Parallax tilt on mouse move
  /** @param {MouseEvent} e */
  const onMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const xNorm = (clientX / innerWidth - 0.5) * 16; // -8 to 8 deg
    const yNorm = (clientY / innerHeight - 0.5) * -16;
    container.style.transform = `perspective(1000px) rotateY(${xNorm.toFixed(2)}deg) rotateX(${yNorm.toFixed(2)}deg)`;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  /**
   * Sets spin animation multiplier.
   * @param {number} multiplier
   */
  function setSpinSpeed(multiplier) {
    const baseDuration = 80; // 80s per rotation at idle
    const duration = Math.max(0.5, baseDuration / multiplier);
    rotatingGroup.style.animationDuration = `${duration}s`;
  }

  /**
   * Whirls backward rapidly during travel transition.
   * @param {number} durationMs
   * @returns {Promise<void>}
   */
  function whirlBackward(durationMs) {
    return new Promise((resolve) => {
      rotatingGroup.classList.add('wa-dial-whirling');
      setTimeout(() => {
        rotatingGroup.classList.remove('wa-dial-whirling');
        resolve();
      }, durationMs);
    });
  }

  return {
    element: container,
    setSpinSpeed,
    whirlBackward,
  };
}
