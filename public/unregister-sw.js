// Service Worker Unregistration Script
// This script will remove any existing service workers from the site
(function() {
  'use strict';
  
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    // Unregister all service workers
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      if (registrations.length > 0) {
        console.log('[SW Cleanup] Found', registrations.length, 'service worker(s). Unregistering...');
        
        registrations.forEach(function(registration) {
          registration.unregister().then(function(success) {
            if (success) {
              console.log('[SW Cleanup] Service worker unregistered successfully:', registration.scope);
            } else {
              console.log('[SW Cleanup] Failed to unregister service worker:', registration.scope);
            }
          }).catch(function(error) {
            console.error('[SW Cleanup] Error unregistering service worker:', error);
          });
        });
        
        // Clear all caches
        if ('caches' in window) {
          caches.keys().then(function(cacheNames) {
            if (cacheNames.length > 0) {
              console.log('[SW Cleanup] Clearing', cacheNames.length, 'cache(s)...');
              return Promise.all(
                cacheNames.map(function(cacheName) {
                  return caches.delete(cacheName).then(function() {
                    console.log('[SW Cleanup] Cache cleared:', cacheName);
                  });
                })
              );
            }
          }).catch(function(error) {
            console.error('[SW Cleanup] Error clearing caches:', error);
          });
        }
        
        // Reload the page after cleanup to ensure fresh state
        setTimeout(function() {
          console.log('[SW Cleanup] Reloading page to complete cleanup...');
          window.location.reload(true);
        }, 1000);
      } else {
        console.log('[SW Cleanup] No service workers found.');
      }
    }).catch(function(error) {
      console.error('[SW Cleanup] Error getting service worker registrations:', error);
    });
  } else {
    console.log('[SW Cleanup] Service workers not supported in this browser.');
  }
})();