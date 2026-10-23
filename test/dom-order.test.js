// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';

// Simple mock DOM environment for node:test
class MockElement {
  /**
   * @param {string} tagName
   */
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    /** @type {MockElement[]} */
    this.children = [];
    /** @type {MockElement | null} */
    this.parentNode = null;
    /** @type {Record<string, string>} */
    this.dataset = {};
    /** @type {Record<string, string>} */
    this.style = {};
    this.className = '';
    this.classList = {
      add: (c) => {
        if (!this.className.includes(c)) this.className += ` ${c}`;
      },
      remove: (c) => {
        this.className = this.className.replace(c, '').trim();
      },
      contains: (c) => this.className.includes(c),
    };
    this._textContent = '';
  }

  set textContent(val) {
    this._textContent = val;
    if (val === '') {
      this.children = [];
    }
  }

  get textContent() {
    return this._textContent;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  /**
   * @param {MockElement} node
   */
  appendChild(node) {
    if (node instanceof MockFragment) {
      for (const child of node.children) {
        this.appendChild(child);
      }
      node.children = [];
      return node;
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  /**
   * @param {MockElement} node
   * @param {MockElement} referenceNode
   */
  insertBefore(node, referenceNode) {
    if (node instanceof MockFragment) {
      for (const child of node.children) {
        this.insertBefore(child, referenceNode);
      }
      node.children = [];
      return node;
    }
    const idx = this.children.indexOf(referenceNode);
    if (idx === -1) {
      return this.appendChild(node);
    }
    node.parentNode = this;
    this.children.splice(idx, 0, node);
    return node;
  }

  /**
   * @param {MockElement} node
   */
  removeChild(node) {
    const idx = this.children.indexOf(node);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      node.parentNode = null;
    }
    return node;
  }

  /**
   * @param {string} selector
   * @returns {MockElement | null}
   */
  querySelector(selector) {
    if (selector.startsWith('[data-id="')) {
      const id = selector.match(/\[data-id="([^"]+)"\]/)?.[1];
      return this._findChild((c) => String(c.dataset.id) === String(id));
    }
    return null;
  }

  /**
   * @param {string} _selector
   * @returns {MockElement[]}
   */
  querySelectorAll(_selector) {
    return [];
  }

  /**
   * @param {(el: MockElement) => boolean} predicate
   * @returns {MockElement | null}
   */
  _findChild(predicate) {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const found = child._findChild(predicate);
      if (found) return found;
    }
    return null;
  }

  /**
   * @param {string} _key
   * @param {string} _val
   */
  setAttribute(_key, _val) {}

  /**
   * @param {string} _event
   * @param {Function} _fn
   */
  addEventListener(_event, _fn) {}

  scrollTo() {}
}

class MockFragment extends MockElement {
  constructor() {
    super('#document-fragment');
  }
}

// Setup global minimal DOM
// @ts-ignore
globalThis.document = {
  /** @param {string} tag */
  createElement: (tag) => new MockElement(tag),
  /** @param {string} _ns @param {string} tag */
  createElementNS: (_ns, tag) => new MockElement(tag),
  createDocumentFragment: () => new MockFragment(),
  createTextNode: (text) => {
    const el = new MockElement('#text');
    el.textContent = text;
    return el;
  },
};
// @ts-ignore
globalThis.HTMLElement = MockElement;
// @ts-ignore
globalThis.SVGElement = MockElement;
// @ts-ignore
globalThis.Node = MockElement;

import { createChatView } from '../src/ui/replay/chat-view.js';
import { Timeline } from '../src/core/timeline.js';

test('DOM Order Regression: timeline sequence is strictly preserved in DOM', () => {
  /** @type {import('../src/core/parser/index.js').ChatMessage[]} */
  const messages = [
    {
      id: 0,
      timestamp: 1707868800000, // 2024-02-14 00:00:00
      senderRaw: 'Leo',
      senderDisplayName: 'Leo',
      senderIndex: 0,
      text: 'First message on Feb 14',
      type: 'text',
      rawText: '',
      emojiOnlyCount: 0,
      isOutgoing: true,
    },
    {
      id: 1,
      timestamp: 1707868860000, // 2024-02-14 00:01:00
      senderRaw: 'Maya',
      senderDisplayName: 'Maya',
      senderIndex: 1,
      text: 'Second message on Feb 14',
      type: 'text',
      rawText: '',
      emojiOnlyCount: 0,
      isOutgoing: false,
    },
    {
      id: 2,
      timestamp: 1707955200000, // 2024-02-15 00:00:00 (Next day)
      senderRaw: 'Leo',
      senderDisplayName: 'Leo',
      senderIndex: 0,
      text: 'Third message on Feb 15',
      type: 'text',
      rawText: '',
      emojiOnlyCount: 0,
      isOutgoing: true,
    },
  ];

  const timeline = new Timeline(messages, { mode: 'smart', speed: 1 });
  const chatView = createChatView({
    timeline,
    userPersonaRaw: 'Leo',
    isGroupChat: false,
  });

  // 1. Append in sequential playback
  chatView.appendMessage(messages[0], 0);
  chatView.appendMessage(messages[1], 1);
  chatView.appendMessage(messages[2], 2);

  // Grab messageList (first child of scrollContainer, which is first child of wrapper)
  const scrollContainer = chatView.element.children[0];
  const messageList = scrollContainer.children[0];

  // Verify message IDs in messageList are strictly monotonic
  const messageElements = messageList.children.filter((c) => c.dataset.id !== undefined);
  assert.equal(messageElements.length, 3);
  assert.equal(Number(messageElements[0].dataset.id), 0);
  assert.equal(Number(messageElements[1].dataset.id), 1);
  assert.equal(Number(messageElements[2].dataset.id), 2);

  // 2. Out-of-order arrival test: append message 0 after message 2 has been appended
  // (Simulates delayed typing promise resolving after seek/restart)
  chatView.appendMessage(messages[0], 0); // Duplicate should be rejected
  const countAfterDup = messageList.children.filter((c) => c.dataset.id !== undefined).length;
  assert.equal(countAfterDup, 3, 'Duplicate message ID should not be inserted twice');

  // 3. Windowed render on Seek
  chatView.renderWindowAroundIndex(1);
  const seekElements = messageList.children.filter((c) => c.dataset.id !== undefined);
  assert.equal(seekElements.length, 3);
  for (let i = 1; i < seekElements.length; i++) {
    const prevId = Number(seekElements[i - 1].dataset.id);
    const currId = Number(seekElements[i].dataset.id);
    assert.ok(currId > prevId, `Timeline order violation: ${currId} must be > ${prevId}`);
  }

  // 4. Verify Date Chip placement: date chips must precede messages and never follow later messages
  const allNodes = messageList.children;
  const seenMessageDates = new Set();
  for (const node of allNodes) {
    if (node.className.includes('wa-date-chip-container')) {
      // Date chip container
      const chipText = node.children[0]?.textContent;
      assert.ok(
        !seenMessageDates.has(chipText),
        `Duplicate date chip for ${chipText} placed out of order`,
      );
    } else if (node.dataset.id !== undefined) {
      // Message bubble
      const msgId = Number(node.dataset.id);
      const msg = messages.find((m) => m.id === msgId);
      if (msg) {
        seenMessageDates.add(new Date(msg.timestamp).toDateString());
      }
    }
  }

  // 5. Restart simulation: seek to 0 and re-play
  chatView.renderWindowAroundIndex(0);
  const restartElements = messageList.children.filter((c) => c.dataset.id !== undefined);
  assert.equal(restartElements.length, 3);
  assert.equal(Number(restartElements[0].dataset.id), 0);
  assert.equal(Number(restartElements[1].dataset.id), 1);
  assert.equal(Number(restartElements[2].dataset.id), 2);
});
