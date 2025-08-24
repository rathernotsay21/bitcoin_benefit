'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Only register in production
      if (process.env.NODE_ENV === 'production') {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
              console.log('Service Worker registered successfully:', registration.scope);
              
              // Check for updates periodically
              setInterval(() => {
                registration.update();
              }, 60 * 60 * 1000); // Check every hour
              
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
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
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