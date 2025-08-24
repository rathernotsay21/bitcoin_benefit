// Service Worker for Bitcoin Benefit Platform
// Version: 1.0.0

const CACHE_NAME = 'bitcoin-benefit-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';
const API_CACHE = 'api-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/calculator/pioneer',
  '/calculator/steady-builder',
  '/calculator/slow-burn',
  '/bitcoin-tools',
  '/historical',
  '/learn',
  '/data/bitcoin-price.json',
  '/data/historical-bitcoin.json',
  '/data/schemes-meta.json',
  '/data/static-calculations.json',
  '/favicon.ico',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && 
                   cacheName !== RUNTIME_CACHE && 
                   cacheName !== API_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with cache-first strategy for static data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static JSON data with cache-first strategy
  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version and update in background
            fetchAndCache(request, CACHE_NAME);
            return cachedResponse;
          }
          return fetchAndCache(request, CACHE_NAME);
        })
    );
    return;
  }

  // Handle Next.js static assets
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetchAndCache(request, RUNTIME_CACHE);
        })
    );
    return;
  }

  // Handle images with cache-first strategy
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetchAndCache(request, RUNTIME_CACHE);
        })
    );
    return;
  }

  // Handle HTML pages with network-first strategy
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page if available
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Default strategy: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Helper function to fetch and cache
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (!response || response.status !== 200 || response.type === 'opaque') {
      return response;
    }
    const responseToCache = response.clone();
    const cache = await caches.open(cacheName);
    cache.put(request, responseToCache);
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

// Handle API requests with intelligent caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Bitcoin price API - cache for 5 minutes
  if (url.pathname.includes('/api/bitcoin-price')) {
    return handleCachedApiRequest(request, 5 * 60 * 1000); // 5 minutes
  }
  
  // Network status API - cache for 30 seconds
  if (url.pathname.includes('/api/mempool/network')) {
    return handleCachedApiRequest(request, 30 * 1000); // 30 seconds
  }
  
  // Transaction API - cache for 1 minute
  if (url.pathname.includes('/api/mempool/tx')) {
    return handleCachedApiRequest(request, 60 * 1000); // 1 minute
  }
  
  // Default: no caching for other API requests
  return fetch(request);
}

// Handle cached API request with TTL
async function handleCachedApiRequest(request, ttl) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const cachedTime = new Date(cachedResponse.headers.get('sw-cache-time'));
    const now = new Date();
    
    // Check if cache is still valid
    if (now - cachedTime < ttl) {
      return cachedResponse;
    }
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone response and add cache time header
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const cachedResponseWithTime = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponseWithTime);
    }
    return response;
  } catch (error) {
    // If network fails and we have a cached response, return it
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Message handler for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      ).then(() => {
        console.log('[Service Worker] All caches cleared');
      });
    });
  }
});