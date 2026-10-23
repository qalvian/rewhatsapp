// @ts-check
/// <reference lib="webworker" />

const CACHE_NAME = 'rewhatsapp-v2.0.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icon-192.svg',
  './icon-512.svg',
  './src/main.js',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/home.css',
  './src/styles/setup.css',
  './src/styles/replay.css',
  './src/styles/motion.css',
  './src/core/analytics/lexicon.json',
];

self.addEventListener('install', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() =>
        /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self)).skipWaiting(),
      ),
  );
});

self.addEventListener('activate', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() =>
        /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self)).clients.claim(),
      ),
  );
});

self.addEventListener('fetch', (event) => {
  // @ts-ignore
  const request = event.request;
  if (request.method !== 'GET') return;

  // On localhost / local dev, always bypass cache to prevent stale builds
  const url = new URL(request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // Network-first strategy for production PWA
  // @ts-ignore
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          request.url.startsWith(self.location.origin)
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request)),
  );
});
