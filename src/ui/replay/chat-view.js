// @ts-check

import { el, svgEl } from '../../util/dom.js';
import { isDifferentDay } from '../../util/format.js';
import {
  createMessageBubble,
  createDateChipElement,
  createTimeSkipElement,
  createSystemMessageElement,
  createBubbleTail,
} from './bubble.js';

const WINDOW_SIZE = 80;

/**
 * Creates the windowed chat message scroll viewport.
 *
 * @param {Object} params
 * @param {import('../../core/timeline.js').Timeline} params.timeline
 * @param {string} params.userPersonaRaw The participant raw name chosen as "You"
 * @param {boolean} [params.isGroupChat=false]
 * @returns {{
 *   element: HTMLElement;
 *   appendMessage: (message: import('../../core/parser/index.js').ChatMessage, index: number) => void;
 *   appendTimeSkip: (gapMs: number) => void;
 *   renderWindowAroundIndex: (targetIndex: number, includeFuture?: boolean) => void;
 *   markOutgoingAsRead: () => void;
 *   scrollToBottom: (smooth?: boolean) => void;
 *   showTypingIndicator: () => void;
 *   hideTypingIndicator: () => void;
 *   getRenderedRange: () => { start: number; end: number };
 * }}
 */
export function createChatView({ timeline, userPersonaRaw, isGroupChat = false }) {
  const scrollContainer = el('div', {
    className: 'wa-chat-scroll-container',
    tabindex: '0',
    aria: { label: 'Chat conversation stream' },
  });

  const messageList = el('div', { className: 'wa-chat-message-list' });
  scrollContainer.appendChild(messageList);

  // Floating "↓ Jump to now" button
  const jumpBtn = el(
    'button',
    {
      className: 'wa-jump-btn wa-jump-hidden',
      aria: { label: 'Scroll to latest message' },
      onClick: () => {
        isAutoScrollPinned = true;
        jumpBtn.classList.add('wa-jump-hidden');
        scrollToBottom(true);
      },
    },
    svgEl(
      'svg',
      { viewBox: '0 0 24 24', width: '18', height: '18' },
      svgEl('path', {
        d: 'M 12 4 L 12 18 M 6 12 L 12 18 L 18 12',
        stroke: 'currentColor',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ),
    el('span', { text: 'Jump to now' }),
  );

  const wrapper = el(
    'div',
    { className: 'wa-chat-view wa-chat-view-wrapper' },
    scrollContainer,
    jumpBtn,
  );

  let isAutoScrollPinned = true;
  let lastSenderRaw = '';
  let lastTimestamp = 0;
  let renderedStartIndex = 0;
  let renderedEndIndex = 0;

  // Track user scrolling to pause/resume auto-scroll
  scrollContainer.addEventListener('scroll', () => {
    const threshold = 60;
    const distanceToBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;

    if (distanceToBottom > threshold) {
      if (isAutoScrollPinned) {
        isAutoScrollPinned = false;
        jumpBtn.classList.remove('wa-jump-hidden');
      }
    } else {
      if (!isAutoScrollPinned) {
        isAutoScrollPinned = true;
        jumpBtn.classList.add('wa-jump-hidden');
      }
    }
  });

  /**
   * Scrolls to bottom of chat view.
   * @param {boolean} [smooth=false]
   */
  function scrollToBottom(smooth = false) {
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  /**
   * Turns grey double ticks into blue ticks on all visible outgoing messages
   * when an incoming message appears in the timeline.
   */
  function markOutgoingAsRead() {
    const ticks = messageList.querySelectorAll('.wa-bubble-out .wa-tick-double');
    for (const tick of ticks) {
      tick.classList.remove('wa-tick-grey');
      tick.classList.add('wa-tick-blue');
    }
  }

  /** @type {HTMLElement | null} */
  let typingRow = null;

  /**
   * Shows an animated 3-dot pulsating bubble at the bottom of the chat view
   * when recipient is typing.
   */
  function showTypingIndicator() {
    if (!typingRow) {
      typingRow = el(
        'div',
        { className: 'wa-message-row wa-row-in wa-typing-row' },
        el(
          'div',
          { className: 'wa-bubble wa-bubble-in wa-typing-bubble' },
          createBubbleTail(false),
          el('span', { className: 'wa-typing-dot' }),
          el('span', { className: 'wa-typing-dot' }),
          el('span', { className: 'wa-typing-dot' }),
        ),
      );
    }
    if (typingRow.parentNode !== messageList) {
      messageList.appendChild(typingRow);
      if (isAutoScrollPinned) {
        scrollToBottom(false);
      }
    }
  }

  /**
   * Hides the in-chat typing indicator.
   */
  function hideTypingIndicator() {
    if (typingRow && typingRow.parentNode === messageList) {
      messageList.removeChild(typingRow);
    }
  }

  /**
   * Appends a newly arrived message to the message list in strict timeline order.
   * @param {import('../../core/parser/index.js').ChatMessage} message
   * @param {number} index
   */
  function appendMessage(message, index) {
    hideTypingIndicator();
    // Avoid duplicate insertions
    if (messageList.querySelector(`[data-id="${message.id}"]`)) {
      return;
    }

    const fragment = document.createDocumentFragment();

    // 1. Date chip if day changed or first message
    const isFirstInChat = index === 0;
    const isFirstInList = messageList.children.length === 0;
    if (isFirstInChat || isFirstInList) {
      fragment.appendChild(createDateChipElement(message.timestamp));
    } else if (lastTimestamp > 0 && isDifferentDay(lastTimestamp, message.timestamp)) {
      fragment.appendChild(createDateChipElement(message.timestamp));
    }

    // 2. System messages vs standard bubbles
    if (message.type === 'system') {
      fragment.appendChild(createSystemMessageElement(message.text));
      lastSenderRaw = '';
      lastTimestamp = message.timestamp;
      renderedEndIndex = Math.max(renderedEndIndex, index);
    } else {
      const isOutgoing = message.senderRaw === userPersonaRaw;
      const showTail = message.senderRaw !== lastSenderRaw;

      if (!isOutgoing) {
        // Recipient replied: outgoing messages are now read
        markOutgoingAsRead();
      }

      const bubbleNode = createMessageBubble({
        message,
        isOutgoing,
        showTail,
        isGroupChat,
        isRead: false,
      });

      fragment.appendChild(bubbleNode);
      lastSenderRaw = message.senderRaw;
      lastTimestamp = message.timestamp;
      renderedEndIndex = Math.max(renderedEndIndex, index);
    }

    // Monotonic insertion check: ensure DOM order always equals timeline order
    const nextElem = Array.from(messageList.children).find((child) => {
      const childId = child instanceof HTMLElement ? child.dataset.id : null;
      return childId !== null && childId !== undefined && Number(childId) > index;
    });

    if (nextElem) {
      messageList.insertBefore(fragment, nextElem);
    } else {
      messageList.appendChild(fragment);
    }

    // Prune top elements if DOM exceeds node cap for 60fps performance
    if (messageList.children.length > WINDOW_SIZE * 2) {
      for (let i = 0; i < 20; i++) {
        if (messageList.firstChild) {
          messageList.removeChild(messageList.firstChild);
          renderedStartIndex++;
        }
      }
    }

    if (isAutoScrollPinned) {
      scrollToBottom(false);
    }
  }

  /**
   * Appends an animated Time-Skip chip (gaps >= 3 hours).
   * @param {number} gapMs
   */
  function appendTimeSkip(gapMs) {
    messageList.appendChild(createTimeSkipElement(gapMs));
    lastSenderRaw = '';
    if (isAutoScrollPinned) scrollToBottom(false);
  }

  /**
   * Renders a window of messages around or up to a seek target index.
   * @param {number} targetIndex
   * @param {boolean} [includeFuture=true]
   */
  function renderWindowAroundIndex(targetIndex, includeFuture = true) {
    hideTypingIndicator();
    messageList.classList.add('wa-instant');
    messageList.textContent = '';
    const total = timeline.messages.length;
    if (total === 0) return;

    const start = Math.max(0, targetIndex - (includeFuture ? 30 : 60));
    const end = includeFuture ? Math.min(total - 1, targetIndex + 30) : targetIndex;

    renderedStartIndex = start;
    renderedEndIndex = end;
    lastSenderRaw = '';
    lastTimestamp = 0;

    for (let i = start; i <= end; i++) {
      const msg = timeline.messages[i];
      if (!msg) continue;

      // Derive date chip strictly from adjacent messages in timeline order
      const prevMsg = i > 0 ? timeline.messages[i - 1] : null;
      if (i === 0 || (prevMsg && isDifferentDay(prevMsg.timestamp, msg.timestamp))) {
        messageList.appendChild(createDateChipElement(msg.timestamp));
      }

      if (msg.type === 'system') {
        messageList.appendChild(createSystemMessageElement(msg.text));
        lastSenderRaw = '';
      } else {
        const isOutgoing = msg.senderRaw === userPersonaRaw;
        const showTail = msg.senderRaw !== lastSenderRaw;
        const isRead = i < targetIndex; // Past messages are read

        const bubbleNode = createMessageBubble({
          message: msg,
          isOutgoing,
          showTail,
          isGroupChat,
          isRead,
        });

        messageList.appendChild(bubbleNode);
        lastSenderRaw = msg.senderRaw;
      }

      lastTimestamp = msg.timestamp;
    }

    scrollToBottom(false);
    isAutoScrollPinned = true;
    jumpBtn.classList.add('wa-jump-hidden');

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        messageList.classList.remove('wa-instant');
      });
    }
  }

  return {
    element: wrapper,
    appendMessage,
    appendTimeSkip,
    renderWindowAroundIndex,
    markOutgoingAsRead,
    scrollToBottom,
    showTypingIndicator,
    hideTypingIndicator,
    getRenderedRange: () => ({ start: renderedStartIndex, end: renderedEndIndex }),
  };
}
