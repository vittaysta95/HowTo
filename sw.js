/* App-shell cache with a NETWORK-FIRST strategy for the guide's own files
   (HTML/JS/manifest), so updates you push to the repo show up the next
   time someone opens the app while online — instead of silently serving
   whatever was cached the first time they visited. Offline visitors still
   fall back to the last cached copy. Only the icon uses cache-first,
   since it almost never changes and cache-first is faster for it.

   BUMP CACHE_NAME whenever you change what SHELL_FILES lists (rare) —
   the version number in the name is mostly for your own bookkeeping now,
   since network-first no longer depends on it to pick up file changes. */
const CACHE_NAME = 'lego-guides-v3';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './iso.js',
  './modules/house.js',
  './icons/icon.svg',
];
const CACHE_FIRST_PATHS = ['/icons/'];

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

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('api.github.com')) return; // let sync calls hit the network directly, never cache them

  const useCacheFirst = CACHE_FIRST_PATHS.some((p) => url.includes(p));

  if (useCacheFirst) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      }))
    );
    return;
  }

  // Network-first for the app shell: try the live file, fall back to the
  // last cached copy only if the network request fails (offline).
  event.respondWith(
    fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request))
  );
});
