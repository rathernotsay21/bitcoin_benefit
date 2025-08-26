'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration(): JSX.Element | null {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // In development, unregister all service workers to prevent caching issues
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().then((success) => {
              if (success) {
                console.log('[Dev] Service Worker unregistered:', registration.scope);
              }
            });
          });
        }).catch(err => {
          // Silently fail if service workers can't be accessed
          console.debug('[Dev] Could not unregister service workers:', err);
        });
        
        // Clear all caches in development
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
              console.log('[Dev] Cache cleared:', name);
            });
          }).catch(err => {
            // Silently fail if caches can't be accessed
            console.debug('[Dev] Could not clear caches:', err);
          });
        }
        
        // Important: Return early to prevent any SW registration on localhost
        return;
      }
      
      // Only register in production (non-localhost)
      if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost') {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw-production.js')
            .then((registration) => {
              console.log('Service Worker registered successfully:', registration.scope);
              
              // Check for updates periodically
              setInterval(() => {
                registration.update();
              }, 60000); // Check every minute for better performance
              
              // Handle updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      // New service worker available
                      console.log('New service worker available, refresh to update');
                      
                      // Optionally show a notification to the user
                      if (window.confirm('A new version is available. Refresh to update?')) {
                        newWorker.postMessage({ action: 'skipWaiting' });
                        window.location.reload();
                      }
                    }
                  });
                }
              });
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
        });
      }
    }
  }, []);

  return null;
}