// @ts-check

import { el, svgEl } from '../../util/dom.js';

/**
 * Creates the WhatsApp interactive composer bar with typing simulation.
 *
 * @param {Object} [params]
 * @param {() => void} [params.onSend]
 * @returns {{
 *   element: HTMLElement;
 *   simulateTyping: (text: string, durationMs: number) => Promise<void>;
 *   clear: () => void;
 *   setText: (text: string) => void;
 * }}
 */
export function createComposer({ onSend } = {}) {
  // 1. Emoji icon
  const emojiBtn = el(
    'button',
    {
      className: 'wa-composer-btn wa-btn-emoji',
      aria: { label: 'Insert emoji (decorative)' },
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '24', height: '24' },
      svgEl('circle', {
        cx: '12',
        cy: '12',
        r: '9',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
      }),
      svgEl('circle', { cx: '9', cy: '10', r: '1.5', fill: 'currentColor' }),
      svgEl('circle', { cx: '15', cy: '10', r: '1.5', fill: 'currentColor' }),
      svgEl('path', {
        d: 'M 8 14 C 9 17 15 17 16 14',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      }),
    ),
  );

  // 2. Attach paperclip icon
  const attachBtn = el(
    'button',
    {
      className: 'wa-composer-btn wa-btn-attach',
      aria: { label: 'Attach document or media (decorative)' },
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '22', height: '22' },
      svgEl('path', {
        d: 'M 16.5 6 L 9 13.5 C 7.6 14.9 7.6 17.1 9 18.5 C 10.4 19.9 12.6 19.9 14 18.5 L 20 12.5 C 22.2 10.3 22.2 6.7 20 4.5 C 17.8 2.3 14.2 2.3 12 4.5 L 5.5 11 C 2.5 14 2.5 19 5.5 22 C 8.5 25 13.5 25 16.5 22 L 21.5 17',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      }),
    ),
  );

  // 3. Input mock field
  const inputDisplay = el('div', {
    className: 'wa-composer-input',
    text: '',
  });

  const placeholder = el('span', {
    className: 'wa-composer-placeholder',
    text: 'Type a message',
  });
  inputDisplay.appendChild(placeholder);

  // 4. Send / Mic toggle button
  const micSvg = svgEl(
    'svg',
    { viewBox: '0 0 24 24', width: '22', height: '22', className: 'wa-icon-mic' },
    svgEl('path', {
      d: 'M 12 2 A 3 3 0 0 0 9 5 L 9 11 A 3 3 0 0 0 15 11 L 15 5 A 3 3 0 0 0 12 2 Z M 19 10 A 1 1 0 0 0 17 10 C 17 12.8 14.8 15 12 15 C 9.2 15 7 12.8 7 10 A 1 1 0 0 0 5 10 C 5 13.5 7.7 16.4 11 16.9 L 11 19 L 9 19 A 1 1 0 0 0 9 21 L 15 21 A 1 1 0 0 0 15 19 L 13 19 L 13 16.9 C 16.3 16.4 19 13.5 19 10 Z',
      fill: 'currentColor',
    }),
  );

  const sendSvg = svgEl(
    'svg',
    { viewBox: '0 0 24 24', width: '20', height: '20', className: 'wa-icon-send' },
    svgEl('path', {
      d: 'M 2.01 21 L 23 12 L 2.01 3 L 2 10 L 17 12 L 2 14 Z',
      fill: '#ffffff',
    }),
  );

  const actionBtn = el(
    'button',
    {
      className: 'wa-composer-action-btn wa-mode-mic',
      aria: { label: 'Voice message or send' },
      onClick: () => {
        if (onSend) onSend();
      },
    },
    micSvg,
  );

  const inputWrapper = el(
    'div',
    { className: 'wa-composer-pill' },
    emojiBtn,
    inputDisplay,
    attachBtn,
  );

  const element = el('footer', { className: 'wa-composer-bar' }, inputWrapper, actionBtn);

  /**
   * Sets text content in the composer field and toggles mic/send icon.
   * @param {string} text
   */
  function setText(text) {
    if (!text) {
      inputDisplay.textContent = '';
      inputDisplay.appendChild(placeholder);
      actionBtn.classList.remove('wa-mode-send');
      actionBtn.classList.add('wa-mode-mic');
      actionBtn.replaceChildren(micSvg);
    } else {
      inputDisplay.textContent = text;
      actionBtn.classList.remove('wa-mode-mic');
      actionBtn.classList.add('wa-mode-send');
      actionBtn.replaceChildren(sendSvg);
    }
  }

  /**
   * Simulates typing text progressively over durationMs.
   * @param {string} text
   * @param {number} durationMs
   * @returns {Promise<void>}
   */
  async function simulateTyping(text, durationMs) {
    if (!text || durationMs <= 50) {
      setText('');
      return;
    }

    const chars = Array.from(text);
    const interval = Math.max(15, Math.floor(durationMs / Math.max(1, chars.length)));

    for (let i = 1; i <= chars.length; i++) {
      const slice = chars.slice(0, i).join('');
      setText(slice);
      await new Promise((r) => setTimeout(r, interval));
    }

    // Brief pause before popping into chat
    await new Promise((r) => setTimeout(r, 60));
    setText('');
  }

  function clear() {
    setText('');
  }

  return {
    element,
    simulateTyping,
    clear,
    setText,
  };
}
