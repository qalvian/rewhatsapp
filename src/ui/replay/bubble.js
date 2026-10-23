// @ts-check

import { el, svgEl } from '../../util/dom.js';
import { linkifyText } from '../../util/linkify.js';
import {
  formatMessageTime,
  formatDateChip,
  formatTimeSkipText,
  formatAudioDuration,
} from '../../util/format.js';
import { getSenderColor } from '../../util/hash.js';
import { generateWaveformData } from '../../audio/synth.js';

/**
 * Creates SVG single checkmark.
 * @returns {SVGElement}
 */
export function createSingleTickSvg() {
  return svgEl(
    'svg',
    {
      viewBox: '0 0 16 15',
      width: '14',
      height: '14',
      className: 'wa-tick wa-tick-single',
    },
    svgEl('path', {
      d: 'M 3 7.5 L 6.5 11 L 13.5 3.5',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.8',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
  );
}

/**
 * Creates SVG double checkmarks (grey or blue).
 * @param {boolean} [isRead=false]
 * @returns {SVGElement}
 */
export function createDoubleTickSvg(isRead = false) {
  return svgEl(
    'svg',
    {
      viewBox: '0 0 19 15',
      width: '16',
      height: '14',
      className: `wa-tick wa-tick-double ${isRead ? 'wa-tick-blue' : 'wa-tick-grey'}`,
    },
    svgEl('path', {
      d: 'M 2 7.5 L 5.5 11 L 12.5 3.5',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.8',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
    svgEl('path', {
      d: 'M 6.5 7.5 L 10 11 L 17 3.5',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.8',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
  );
}

/**
 * Creates SVG bubble tail.
 * @param {boolean} isOutgoing
 * @returns {SVGElement}
 */
export function createBubbleTail(isOutgoing) {
  return svgEl(
    'svg',
    {
      viewBox: '0 0 8 13',
      width: '8',
      height: '13',
      className: `wa-tail ${isOutgoing ? 'wa-tail-out' : 'wa-tail-in'}`,
    },
    svgEl('path', {
      d: isOutgoing ? 'M 0,0 C 3,0 8,2 8,10 L 8,0 Z' : 'M 8,0 C 5,0 0,2 0,10 L 0,0 Z',
      fill: 'currentColor',
    }),
  );
}

/**
 * Creates a centered Date Chip element.
 * @param {number} timestamp
 * @returns {HTMLElement}
 */
export function createDateChipElement(timestamp) {
  return el(
    'div',
    { className: 'wa-date-chip-container' },
    el('span', {
      className: 'wa-date-chip',
      text: formatDateChip(timestamp),
    }),
  );
}

/**
 * Creates an animated Time-Skip Chip element (e.g. "🌙 3 days later").
 * @param {number} gapMs
 * @returns {HTMLElement}
 */
export function createTimeSkipElement(gapMs) {
  const clockSvg = svgEl(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: '16',
      height: '16',
      className: 'wa-time-skip-clock',
    },
    svgEl('circle', {
      cx: '12',
      cy: '12',
      r: '9',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
    }),
    svgEl('line', {
      x1: '12',
      y1: '12',
      x2: '12',
      y2: '7',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      className: 'clock-hand clock-hand-minute',
    }),
    svgEl('line', {
      x1: '12',
      y1: '12',
      x2: '16',
      y2: '12',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      className: 'clock-hand clock-hand-hour',
    }),
  );

  return el(
    'div',
    { className: 'wa-time-skip-container' },
    el(
      'div',
      { className: 'wa-time-skip-chip' },
      el('span', { text: '🌙 ' }),
      el('span', { text: formatTimeSkipText(gapMs) }),
      clockSvg,
    ),
  );
}

/**
 * Creates a centered System Event pill or Encryption Notice pill.
 * @param {string} text
 * @returns {HTMLElement}
 */
export function createSystemMessageElement(text) {
  const isEncryption = /end-to-end encrypted|cifrados de extremo|verschlüsselt/i.test(text);

  return el(
    'div',
    { className: 'wa-system-container' },
    el(
      'div',
      { className: `wa-system-pill ${isEncryption ? 'wa-encryption-pill' : ''}` },
      isEncryption ? el('span', { className: 'wa-lock-icon', text: '🔒 ' }) : null,
      el('span', { text }),
    ),
  );
}

/**
 * Builds the interactive voice note waveform component.
 * @param {string} seed
 * @param {number} [durationSec=42]
 * @returns {HTMLElement}
 */
export function createVoiceNoteElement(seed, durationSec = 42) {
  const bars = generateWaveformData(seed, 32);

  const waveformContainer = el('div', { className: 'wa-voice-waveform' });
  bars.forEach((height) => {
    const bar = el('span', {
      className: 'wa-voice-bar',
      style: { height: `${Math.round(height * 24)}px` },
    });
    waveformContainer.appendChild(bar);
  });

  const playBtn = el(
    'button',
    {
      className: 'wa-voice-play-btn',
      aria: { label: 'Play voice message' },
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '18', height: '18' },
      svgEl('polygon', { points: '7,5 19,12 7,19', fill: 'currentColor' }),
    ),
  );

  const micIcon = svgEl(
    'svg',
    { viewBox: '0 0 24 24', width: '16', height: '16', className: 'wa-voice-mic' },
    svgEl('path', {
      d: 'M 12 2 A 3 3 0 0 0 9 5 L 9 11 A 3 3 0 0 0 15 11 L 15 5 A 3 3 0 0 0 12 2 Z M 19 10 A 1 1 0 0 0 17 10 C 17 12.8 14.8 15 12 15 C 9.2 15 7 12.8 7 10 A 1 1 0 0 0 5 10 C 5 13.5 7.7 16.4 11 16.9 L 11 19 L 9 19 A 1 1 0 0 0 9 21 L 15 21 A 1 1 0 0 0 15 19 L 13 19 L 13 16.9 C 16.3 16.4 19 13.5 19 10 Z',
      fill: '#53bdeb',
    }),
  );

  return el(
    'div',
    { className: 'wa-voice-player' },
    playBtn,
    el(
      'div',
      { className: 'wa-voice-body' },
      waveformContainer,
      el(
        'div',
        { className: 'wa-voice-meta' },
        el('span', { text: formatAudioDuration(durationSec) }),
        micIcon,
      ),
    ),
  );
}

/**
 * Builds a WhatsApp message bubble DOM element.
 *
 * @param {Object} params
 * @param {import('../../core/parser/index.js').ChatMessage} params.message
 * @param {boolean} params.isOutgoing
 * @param {boolean} params.showTail
 * @param {boolean} params.isGroupChat
 * @param {boolean} [params.isRead=false]
 * @returns {HTMLElement}
 */
export function createMessageBubble({
  message,
  isOutgoing,
  showTail,
  isGroupChat,
  isRead = false,
}) {
  const isEmojiOnly = message.emojiOnlyCount >= 1 && message.emojiOnlyCount <= 3;

  const bubbleClasses = [
    'wa-bubble',
    isOutgoing ? 'wa-bubble-out' : 'wa-bubble-in',
    showTail ? 'wa-has-tail' : 'wa-no-tail',
    isEmojiOnly ? `wa-emoji-only wa-emoji-${message.emojiOnlyCount}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const rowClasses = [
    'wa-message-row',
    isOutgoing ? 'wa-row-out' : 'wa-row-in',
    showTail ? 'wa-run-start' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const row = el('div', {
    className: rowClasses,
    dataset: { id: message.id },
  });

  const bubble = el('div', { className: bubbleClasses });

  // Optional tail
  if (showTail && !isEmojiOnly) {
    bubble.appendChild(createBubbleTail(isOutgoing));
  }

  // Sender name for incoming messages in group chats
  if (isGroupChat && !isOutgoing && showTail && message.senderDisplayName) {
    const senderColor = getSenderColor(message.senderRaw, message.senderIndex);
    const senderHeader = el('div', {
      className: 'wa-sender-header',
      style: { color: senderColor },
      text: message.senderDisplayName,
    });
    bubble.appendChild(senderHeader);
  }

  // Content area
  const content = el('div', { className: 'wa-bubble-content' });

  if (message.type === 'deleted') {
    content.appendChild(
      el('span', {
        className: 'wa-deleted-text',
        text: `🚫 ${message.text}`,
      }),
    );
  } else if (message.type === 'call') {
    content.appendChild(
      el(
        'div',
        { className: 'wa-call-pill' },
        el('span', { text: '📞 ' }),
        el('span', { text: message.text }),
      ),
    );
  } else if (message.type === 'voice') {
    content.appendChild(createVoiceNoteElement(message.text || String(message.id)));
  } else if (message.type === 'media') {
    const kind = message.mediaInfo?.kind || 'image';
    const filename = message.mediaInfo?.filename || 'Media file';
    content.appendChild(
      el(
        'div',
        { className: 'wa-media-card' },
        el('div', {
          className: `wa-media-thumb wa-thumb-${kind}`,
          text:
            kind === 'video' ? '🎬' : kind === 'audio' ? '🎵' : kind === 'document' ? '📄' : '📷',
        }),
        el(
          'div',
          { className: 'wa-media-details' },
          el('div', { className: 'wa-media-filename', text: filename }),
          el('div', { className: 'wa-media-sub', text: message.text }),
        ),
      ),
    );
  } else {
    // Text message with URL linkification
    const nodes = linkifyText(message.text);
    for (const node of nodes) {
      content.appendChild(node);
    }
  }

  bubble.appendChild(content);

  // Bottom timestamp and read-receipt ticks
  const footer = el('span', { className: 'wa-bubble-footer' });
  footer.appendChild(
    el('span', {
      className: 'wa-bubble-time',
      text: formatMessageTime(message.timestamp),
    }),
  );

  if (isOutgoing) {
    const tick = isRead ? createDoubleTickSvg(true) : createDoubleTickSvg(false);
    footer.appendChild(tick);
  }

  bubble.appendChild(footer);
  row.appendChild(bubble);

  return row;
}
