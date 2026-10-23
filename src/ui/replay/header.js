// @ts-check

import { el, svgEl } from '../../util/dom.js';
import { getAvatarGradient, getInitials } from '../../util/hash.js';

/**
 * Creates the WhatsApp replay header bar.
 *
 * @param {Object} params
 * @param {string} params.title Contact name or group subject
 * @param {string} [params.subtext='online']
 * @param {() => void} params.onBack Callback when back button is pressed
 * @param {() => void} [params.onMenuClick]
 * @returns {{ element: HTMLElement; setStatus: (status: string) => void; setTitle: (title: string) => void }}
 */
export function createReplayHeader({ title, subtext = 'online', onBack, onMenuClick }) {
  // Back button
  const backBtn = el(
    'button',
    {
      className: 'wa-header-btn wa-header-back-btn',
      aria: { label: 'Go back' },
      onClick: onBack,
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '22', height: '22' },
      svgEl('path', {
        d: 'M 20 11 L 7.8 11 L 13.4 5.4 L 12 4 L 4 12 L 12 20 L 13.4 18.6 L 7.8 13 L 20 13 Z',
        fill: 'currentColor',
      }),
    ),
  );

  // Avatar with gradient initials
  const [gradA, gradB] = getAvatarGradient(title);
  const avatar = el(
    'div',
    {
      className: 'wa-header-avatar',
      style: {
        background: `linear-gradient(135deg, ${gradA}, ${gradB})`,
      },
    },
    el('span', {
      className: 'wa-avatar-initials',
      text: getInitials(title),
    }),
  );

  // Name and dynamic status
  const titleEl = el('div', { className: 'wa-header-name', text: title });
  const statusEl = el('div', { className: 'wa-header-status', text: subtext });

  const infoCol = el('div', { className: 'wa-header-info' }, titleEl, statusEl);

  // Action icons: Video, Call, More
  const videoBtn = el(
    'button',
    {
      className: 'wa-header-btn wa-header-action',
      aria: { label: 'Video call (decorative)' },
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '20', height: '20' },
      svgEl('path', {
        d: 'M 17 10.5 L 17 6 C 17 4.9 16.1 4 15 4 L 4 4 C 2.9 4 2 4.9 2 6 L 2 18 C 2 19.1 2.9 20 4 20 L 15 20 C 16.1 20 17 19.1 17 18 L 17 13.5 L 22 17 L 22 7 Z',
        fill: 'currentColor',
      }),
    ),
  );

  const callBtn = el(
    'button',
    {
      className: 'wa-header-btn wa-header-action',
      aria: { label: 'Voice call (decorative)' },
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '20', height: '20' },
      svgEl('path', {
        d: 'M 20 15.5 C 18.8 15.5 17.5 15.3 16.4 14.9 C 16 14.8 15.6 14.9 15.3 15.2 L 13.1 17.4 C 10.3 16 8 13.7 6.6 10.9 L 8.8 8.7 C 9.1 8.4 9.2 8 9.1 7.6 C 8.7 6.5 8.5 5.2 8.5 4 C 8.5 3.4 8.1 3 7.5 3 L 4 3 C 3.4 3 3 3.4 3 4 C 3 13.4 10.6 21 20 21 C 20.6 21 21 20.6 21 20 L 21 16.5 C 21 15.9 20.6 15.5 20 15.5 Z',
        fill: 'currentColor',
      }),
    ),
  );

  const menuBtn = el(
    'button',
    {
      className: 'wa-header-btn wa-header-action',
      aria: { label: 'More options' },
      onClick: onMenuClick,
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '20', height: '20' },
      svgEl('circle', { cx: '12', cy: '5', r: '2', fill: 'currentColor' }),
      svgEl('circle', { cx: '12', cy: '12', r: '2', fill: 'currentColor' }),
      svgEl('circle', { cx: '12', cy: '19', r: '2', fill: 'currentColor' }),
    ),
  );

  const actions = el('div', { className: 'wa-header-actions' }, videoBtn, callBtn, menuBtn);

  const element = el(
    'header',
    { className: 'wa-replay-header' },
    el('div', { className: 'wa-header-left' }, backBtn, avatar, infoCol),
    actions,
  );

  return {
    element,
    setStatus: (newStatus) => {
      statusEl.textContent = newStatus;
      if (newStatus === 'typing…') {
        statusEl.classList.add('wa-status-typing');
      } else {
        statusEl.classList.remove('wa-status-typing');
      }
    },
    setTitle: (newTitle) => {
      titleEl.textContent = newTitle;
      const [nA, nB] = getAvatarGradient(newTitle);
      avatar.style.background = `linear-gradient(135deg, ${nA}, ${nB})`;
      const initialsSpan = avatar.querySelector('.wa-avatar-initials');
      if (initialsSpan) initialsSpan.textContent = getInitials(newTitle);
    },
  };
}
