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
  // Skip chrome-extension URLs
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Skip API calls to avoid caching dynamic content
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Stale-while-revalidate strategy for other resources
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Only cache successful GET requests
            if (networkResponse.ok && 
                event.request.method === 'GET' &&
                !event.request.url.includes('chrome-extension')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone))
                .catch(err => {
                  // Silently fail for unsupported schemes
                  if (!err.message.includes('chrome-extension')) {
                    console.warn('Cache put failed:', err);
                  }
                });
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