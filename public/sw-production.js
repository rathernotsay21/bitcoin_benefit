// Service Worker v2.0.0 - Optimized for Performance
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAMES = {
  static: `static-cache-${CACHE_VERSION}`,
  dynamic: `dynamic-cache-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  data: `data-cache-${CACHE_VERSION}`,
  api: `api-cache-${CACHE_VERSION}`
};

// Critical resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/calculator',
  '/calculator/pioneer',
  '/calculator/stacker',
  '/calculator/builder',
  '/historical',
  '/bitcoin-tools',
  '/manifest.json',
  '/favicon.ico'
];

// Data files to prefetch
const DATA_CACHE_URLS = [
  '/data/bitcoin-price.json',
  '/data/historical-bitcoin.json',
  '/data/schemes-meta.json',
  '/data/static-calculations.json'
];

// Cache expiry times (in seconds)
const CACHE_EXPIRY = {
  api: 300, // 5 minutes
  data: 3600, // 1 hour
  images: 86400 * 30, // 30 days
  static: 86400 * 7 // 7 days
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAMES.static).then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
          console.error('Failed to cache static assets:', error);
        });
      }),
      // Prefetch data files
      caches.open(CACHE_NAMES.data).then((cache) => {
        return cache.addAll(DATA_CACHE_URLS).catch((error) => {
          console.error('Failed to cache data files:', error);
        });
      })
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Helper function to check if cache is expired
function isCacheExpired(response, maxAge) {
  if (!response) return true;
  
  const fetchDate = response.headers.get('sw-fetch-time');
  if (!fetchDate) return true;
  
  const age = (Date.now() - parseInt(fetchDate)) / 1000;
  return age > maxAge;
}

// Helper function to add timestamp to response
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-fetch-time', Date.now().toString());
  
  return response.blob().then((blob) => {
    return new Response(blob, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  });
}

// Network-first strategy for API calls
async function networkFirstStrategy(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseWithTimestamp = await addTimestamp(networkResponse.clone());
      cache.put(request, responseWithTimestamp);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request, cacheName, maxAge) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseWithTimestamp = await addTimestamp(networkResponse.clone());
      cache.put(request, responseWithTimestamp);
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return stale cache if network fails
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseWithTimestamp = await addTimestamp(networkResponse.clone());
      cache.put(request, responseWithTimestamp);
    }
    return networkResponse;
  }).catch(() => null);
  
  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge * 2)) {
    return cachedResponse;
  }
  
  return fetchPromise || cachedResponse;
}

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }
  
  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request, CACHE_NAMES.api, CACHE_EXPIRY.api)
    );
    return;
  }
  
  // Data files - stale while revalidate
  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      staleWhileRevalidate(request, CACHE_NAMES.data, CACHE_EXPIRY.data)
    );
    return;
  }
  
  // Images - cache first with long expiry
  if (request.destination === 'image' || 
      url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
    event.respondWith(
      cacheFirstStrategy(request, CACHE_NAMES.images, CACHE_EXPIRY.images)
    );
    return;
  }
  
  // Static assets (JS, CSS) - cache first
  if (url.pathname.startsWith('/_next/static/') ||
      url.pathname.match(/\.(js|css)$/i)) {
    event.respondWith(
      cacheFirstStrategy(request, CACHE_NAMES.static, CACHE_EXPIRY.static)
    );
    return;
  }
  
  // HTML pages - network first for freshness
  if (request.mode === 'navigate' || 
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      networkFirstStrategy(request, CACHE_NAMES.static, CACHE_EXPIRY.static)
    );
    return;
  }
  
  // Default - network only with error handling
  event.respondWith(
    fetch(request).catch((error) => {
      console.error('Fetch failed for:', request.url, error);
      // Return a fallback response for failed requests
      return new Response('Network error occurred', {
        status: 408,
        statusText: 'Request Timeout',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    event.waitUntil(syncCalculations());
  }
});

async function syncCalculations() {
  // Sync any pending calculations when back online
  const cache = await caches.open(CACHE_NAMES.data);
  const requests = await cache.keys();
  
  for (const request of requests) {
    if (request.url.includes('/api/calculate')) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync calculation:', error);
      }
    }
  }
}

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.action === 'getCacheSize') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ cacheSize: size });
      })
    );
  }
});

// Helper function to get cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

console.log('Service Worker v2.0.0 loaded');