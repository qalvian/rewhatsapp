// @ts-check

/**
 * rewhatsapp - Composition Root
 * Wires together core state, parser, engine, audio, and UI views.
 */

console.info('rewhatsapp initialized');

// Register service worker if supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('SW registration skipped:', err);
    });
  });
}
