// Dummy service worker file to override any cached version
// This file intentionally does nothing and will be replaced by unregister-sw.js

// Immediately unregister itself if somehow registered
self.addEventListener('install', function(event) {
  console.log('[SW Override] Dummy service worker installed, will self-unregister');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW Override] Dummy service worker activated, unregistering...');
  self.registration.unregister().then(function() {
    console.log('[SW Override] Service worker unregistered successfully');
  });
  
  // Clear all caches
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[SW Override] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});