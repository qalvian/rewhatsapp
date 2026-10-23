// @ts-check

import { el, svgEl } from '../../util/dom.js';

/**
 * Creates the Privacy Verification Modal explaining the strict client-side architecture.
 *
 * @param {Object} params
 * @param {() => void} params.onClose
 * @returns {HTMLElement}
 */
export function createPrivacyModal({ onClose }) {
  const overlay = el('div', {
    className: 'wa-palette-overlay',
    role: 'dialog',
    aria: {
      modal: 'true',
      labelledby: 'privacy-modal-title',
    },
  });

  const dialog = el('div', {
    className: 'wa-palette-dialog',
    style: 'max-width: 580px; padding: 24px;',
  });

  const header = el(
    'div',
    {
      style:
        'display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;',
    },
    el('h2', {
      id: 'privacy-modal-title',
      style: 'font-family: ui-serif, Georgia, serif; font-size: 22px; margin: 0; color: #ffffff;',
      text: 'Verified Client-Side Privacy',
    }),
    el(
      'button',
      {
        className: 'wa-setup-close-btn',
        type: 'button',
        aria: { label: 'Close privacy dialog' },
      },
      svgEl(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: '20',
          height: '20',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
        },
        svgEl('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
        svgEl('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
      ),
    ),
  );

  header.querySelector('.wa-setup-close-btn')?.addEventListener('click', onClose);

  const intro = el('p', {
    style: 'font-size: 14px; line-height: 1.6; color: #c9b7d8; margin: 0 0 16px 0;',
    text: 'rewhatsapp is engineered so that your chat exports never touch a server, an API, or any third party. Your files remain exclusively in your browser memory.',
  });

  const guarantees = el(
    'div',
    { style: 'display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;' },
    el(
      'div',
      {
        style:
          'padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #f3e8f8;',
      },
      el('strong', { style: 'color: #7ee787;', text: '1. Strict Content-Security-Policy (CSP): ' }),
      el('span', {
        text: "The page serves default-src 'none' and connect-src 'none'. The browser will block any outgoing fetch, XHR, or beacon attempt.",
      }),
    ),
    el(
      'div',
      {
        style:
          'padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #f3e8f8;',
      },
      el('strong', { style: 'color: #7ee787;', text: '2. Zero Runtime Dependencies: ' }),
      el('span', {
        text: 'No CDNs, no tracking scripts, no external fonts. Built with 100% vanilla Web Standards.',
      }),
    ),
    el(
      'div',
      {
        style:
          'padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #f3e8f8;',
      },
      el('strong', { style: 'color: #7ee787;', text: '3. Verify in DevTools: ' }),
      el('span', {
        text: 'Press F12, open the Network tab, drag in your chat, and watch: zero network requests are made.',
      }),
    ),
  );

  const doneBtn = el('button', {
    className: 'wa-demo-btn',
    style: 'align-self: flex-end; padding: 8px 18px;',
    type: 'button',
    text: 'Got it',
  });
  doneBtn.addEventListener('click', onClose);

  dialog.append(header, intro, guarantees, doneBtn);
  overlay.appendChild(dialog);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  return overlay;
}
