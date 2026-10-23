// @ts-check

import { parseChat } from '../core/parser/index.js';

/**
 * Web Worker for parsing exported WhatsApp chat files off the main thread.
 * Emits early 'meta' event so UI can display setup dialog while heavy parsing continues.
 */

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'parse') {
    try {
      /** @type {string | Uint8Array | ArrayBuffer} */
      const content = payload.content;

      self.postMessage({ type: 'progress', message: 'Detecting format & participants…' });

      // Run parseChat with early meta callback
      const chat = await parseChat(content, {
        onEarlyMeta: (meta) => {
          self.postMessage({
            type: 'meta',
            payload: {
              participants: meta.participants,
              dateOrder: meta.dateOrder,
              dateConfidence: meta.dateConfidence,
              firstDate: meta.firstDate,
              lastDate: meta.lastDate,
            },
          });
        },
      });

      // Send completed parsed chat object (structured clone)
      self.postMessage({
        type: 'complete',
        payload: {
          messages: chat.messages,
          participants: chat.participants,
          dateOrder: chat.dateOrder,
          dateConfidence: chat.dateConfidence,
          grammarId: chat.grammarId,
          totalCount: chat.totalCount,
        },
      });
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unknown parsing error',
      });
    }
  }
};
