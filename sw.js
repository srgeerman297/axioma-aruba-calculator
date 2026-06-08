// AXIOMA Service Worker — offline-first caching
const CACHE_NAME = 'axioma-v1';
const ASSETS = [
  '/axioma-aruba-calculator/',
  '/axioma-aruba-calculator/index.html',
  '/axioma-aruba-calculator/manifest.json',
  '/axioma-aruba-calculator/icons/icon-192.png',
  '/axioma-aruba-calculator/icons/icon-512.png',
  '/axioma-aruba-calculator/icons/apple-touch-icon.png'
];

// Install: cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Only handle GET requests for our own origin
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache successful responses for our own pages/assets
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return the cached index page
        if (event.request.destination === 'document') {
          return caches.match('/axioma-aruba-calculator/index.html');
        }
      });
    })
  );
});
