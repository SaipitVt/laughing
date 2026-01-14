const CACHE_NAME = 'fx-calc-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API всегда пробуем онлайн
  if (url.hostname.includes('exchangerate-api.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response(null)));
    return;
  }

  // Остальное — из кэша
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});