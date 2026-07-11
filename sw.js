/* Minimal app-shell cache. Bump CACHE_NAME any time you change a cached
   file, otherwise phones may keep serving the old version offline. */
const CACHE_NAME = 'lego-guides-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './modules/house.js',
  './icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for GitHub API calls (never cache those), cache-first for
// everything else in the app shell so the guide still works offline.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('api.github.com')) return; // let sync calls hit the network directly

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      }).catch(() => cached);
    })
  );
});
