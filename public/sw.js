const CACHE_NAME = 'bitcoin-benefit-v1';
const urlsToCache = [
  '/',
  '/calculator/accelerator',
  '/calculator/growth',
  '/calculator/scale',
  '/calculator/custom',
  '/historical',
  '/data/bitcoin-price.json',
  '/data/historical-bitcoin.json',
  '/data/static-calculations.json',
  '/data/schemes-meta.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.ok && networkResponse.clone) {
              // Clone the response before using it
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone))
                .catch(err => console.warn('Cache put failed:', err));
            }
            return networkResponse;
          })
          .catch(() => response); // Return cached response if network fails
        return response || fetchPromise;
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});