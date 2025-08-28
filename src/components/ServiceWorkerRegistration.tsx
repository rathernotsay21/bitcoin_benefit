'use client';

import { useEffect, useRef } from 'react';

// Phase 3.2: Enhanced Service Worker Registration with cache management
export function ServiceWorkerRegistration(): JSX.Element | null {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
              console.log('[SW] Phase 3.2 Service Worker registered successfully:', registration.scope);
              registrationRef.current = registration;
              
              // Phase 3.2: Optimized update checking for better performance
              updateCheckIntervalRef.current = setInterval(() => {
                registration.update();
              }, 300000); // Check every 5 minutes instead of 1 minute for better performance
              
              // Phase 3.2: Enhanced update handling with user-friendly notifications
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  console.log('[SW] New service worker installing...');
                  
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      console.log('[SW] New service worker installed, ready to activate');
                      
                      // Phase 3.2: Show subtle update notification
                      showUpdateNotification(() => {
                        newWorker.postMessage({ action: 'skipWaiting' });
                      });
                    }
                  });
                }
              });
              
              // Phase 3.2: Listen for service worker updates
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] Service worker updated, reloading page...');
                window.location.reload();
              });
              
              // Phase 3.2: Prefetch critical data on service worker activation
              if (registration.active) {
                prefetchCriticalData(registration.active);
              }
              
              // Phase 3.2: Handle background sync registration
              if ('sync' in window.ServiceWorkerRegistration.prototype) {
                // Register for Bitcoin price sync
                (registration as any).sync?.register('bitcoin-price-sync').catch((err: any) => {
                  console.debug('[SW] Background sync registration failed:', err);
                });
              }
              
            })
            .catch((error) => {
              console.error('[SW] Service Worker registration failed:', error);
            });
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (updateCheckIntervalRef.current) {
        clearInterval(updateCheckIntervalRef.current);
      }
    };
  }, []);

  return null;
}

// Phase 3.2: Enhanced update notification with better UX
function showUpdateNotification(onUpdate: () => void) {
  // Create a subtle notification banner
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #F7931A, #FF8C00);
    color: white;
    padding: 12px 20px;
    text-align: center;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  `;
  
  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
      <span>🚀 New version available with performance improvements!</span>
      <button id="update-btn" style="
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 6px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      ">Update Now</button>
      <button id="dismiss-btn" style="
        background: transparent;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Animate in
  setTimeout(() => {
    banner.style.transform = 'translateY(0)';
  }, 100);
  
  // Handle update button click
  const updateBtn = banner.querySelector('#update-btn');
  updateBtn?.addEventListener('click', () => {
    updateBtn.textContent = 'Updating...';
    onUpdate();
  });
  
  // Handle dismiss button click
  const dismissBtn = banner.querySelector('#dismiss-btn');
  dismissBtn?.addEventListener('click', () => {
    banner.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      document.body.removeChild(banner);
    }, 300);
  });
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(banner)) {
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        document.body.removeChild(banner);
      }, 300);
    }
  }, 10000);
}

// Phase 3.2: Prefetch critical data for faster loading
function prefetchCriticalData(serviceWorker: ServiceWorker) {
  // Prefetch Bitcoin price data
  serviceWorker.postMessage({ 
    action: 'updateBitcoinData' 
  });
  
  // Prefetch common routes
  const commonRoutes = ['/calculator', '/historical', '/bitcoin-tools'];
  commonRoutes.forEach(route => {
    serviceWorker.postMessage({ 
      action: 'preloadRoute', 
      data: { route } 
    });
  });
}

// Phase 3.2: Global function to get cache statistics (for debugging)
if (typeof window !== 'undefined') {
  (window as any).getBitcoinBenefitCacheStats = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const messageChannel = new MessageChannel();
        
        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.cacheStats);
          };
          
          registration.active?.postMessage(
            { action: 'getCacheStats' },
            [messageChannel.port2]
          );
        });
      } catch (error) {
        console.error('Error getting cache stats:', error);
        return null;
      }
    }
    return null;
  };
  
  // Phase 3.2: Global function to clear cache (for debugging)
  (window as any).clearBitcoinBenefitCache = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const messageChannel = new MessageChannel();
        
        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.success);
          };
          
          registration.active?.postMessage(
            { action: 'clearCache' },
            [messageChannel.port2]
          );
        });
      } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
      }
    }
    return false;
  };
}