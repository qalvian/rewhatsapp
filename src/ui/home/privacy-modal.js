// @ts-check

import { el } from '../../util/dom.js';
import { createIcon } from '../icons.js';

/**
 * Creates the Privacy Verification Modal explaining the strict client-side architecture.
 *
 * @param {Object} params
 * @param {() => void} params.onClose
 * @returns {HTMLElement}
 */
export function createPrivacyModal({ onClose }) {
  const overlay = el('div', {
    className: 'wa-setup-overlay',
    role: 'dialog',
    aria: {
      modal: 'true',
      labelledby: 'privacy-modal-title',
    },
  });

  const dialog = el('div', {
    className: 'wa-setup-card',
    style: 'max-width: 540px;',
  });

  const header = el(
    'div',
    { className: 'wa-setup-header' },
    el(
      'div',
      { className: 'wa-setup-title-row' },
      el('h2', {
        id: 'privacy-modal-title',
        className: 'wa-setup-title',
        text: 'Verified Client-Side Privacy',
      }),
      el(
        'button',
        {
          className: 'wa-setup-close-btn',
          type: 'button',
          aria: { label: 'Close privacy dialog' },
        },
        createIcon('close', { width: 20, height: 20 }),
      ),
    ),
  );

  header.querySelector('.wa-setup-close-btn')?.addEventListener('click', onClose);

  const body = el('div', { className: 'wa-setup-body' });

  const intro = el('p', {
    className: 'wa-setup-desc',
    text: 'rewhatsapp is engineered so that your chat exports never touch a server, an API, or any third party. Your files remain exclusively in your local browser memory.',
  });

  const guarantees = el(
    'div',
    { className: 'wa-setup-summary-list' },
    el(
      'div',
      { className: 'wa-summary-item' },
      el('div', { className: 'wa-summary-icon' }, createIcon('shield', { width: 20, height: 20 })),
      el(
        'div',
        { className: 'wa-summary-text' },
        el('strong', {
          className: 'wa-summary-primary',
          text: '1. Strict Content Security Policy',
        }),
        el('span', {
          className: 'wa-summary-secondary',
          text: "default-src 'none'; connect-src 'none'. Outgoing network requests are blocked by the browser.",
        }),
      ),
    ),
    el(
      'div',
      { className: 'wa-summary-item' },
      el('div', { className: 'wa-summary-icon' }, createIcon('zap', { width: 20, height: 20 })),
      el(
        'div',
        { className: 'wa-summary-text' },
        el('strong', { className: 'wa-summary-primary', text: '2. Zero Runtime Dependencies' }),
        el('span', {
          className: 'wa-summary-secondary',
          text: 'No CDNs, analytics, tracking, or remote fonts. 100% standard ES modules.',
        }),
      ),
    ),
    el(
      'div',
      { className: 'wa-summary-item' },
      el('div', { className: 'wa-summary-icon' }, createIcon('check', { width: 20, height: 20 })),
      el(
        'div',
        { className: 'wa-summary-text' },
        el('strong', { className: 'wa-summary-primary', text: '3. Verifiable in DevTools' }),
        el('span', {
          className: 'wa-summary-secondary',
          text: 'Open DevTools Network tab, drop in your chat, and verify zero HTTP requests.',
        }),
      ),
    ),
  );

  body.append(intro, guarantees);

  const footer = el(
    'div',
    { className: 'wa-setup-footer', style: 'justify-content: space-between;' },
    el('a', {
      href: 'privacy.html',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'wa-legal-link',
      text: 'Read full Legal Privacy Policy →',
    }),
    el('button', {
      className: 'wa-nav-btn wa-nav-next',
      type: 'button',
      text: 'Got it',
      onClick: onClose,
    }),
  );

  dialog.append(header, body, footer);
  overlay.appendChild(dialog);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  return overlay;
}
