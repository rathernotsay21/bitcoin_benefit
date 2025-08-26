'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Define likely navigation paths based on current page
const navigationMap: Record<string, string[]> = {
  '/': ['/calculator/pioneer', '/bitcoin-tools', '/learn'],
  '/calculator/pioneer': ['/calculator/steady-builder', '/calculator/slow-burn', '/historical'],
  '/calculator/steady-builder': ['/calculator/pioneer', '/calculator/slow-burn', '/historical'],
  '/calculator/slow-burn': ['/calculator/pioneer', '/calculator/steady-builder', '/historical'],
  '/bitcoin-tools': ['/calculator/pioneer', '/track', '/learn'],
  '/historical': ['/calculator/pioneer', '/track'],
  '/track': ['/historical', '/bitcoin-tools'],
  '/learn': ['/calculator/pioneer', '/bitcoin-tools'],
};

export function PrefetchLinks(): JSX.Element | null {
  const pathname = usePathname();

  useEffect(() => {
    // Get likely next pages based on current path
    const likelyPaths = navigationMap[pathname] || [];
    
    // Prefetch likely navigation targets
    likelyPaths.forEach((path) => {
      // Create prefetch link
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      link.as = 'document';
      
      // Check if not already prefetched
      const existing = document.querySelector(`link[rel="prefetch"][href="${path}"]`);
      if (!existing) {
        document.head.appendChild(link);
      }
    });

    // Prefetch on hover for all internal links
    const prefetchOnHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const url = new URL(link.href);
        const path = url.pathname;
        
        // Don't prefetch current page or external links
        if (path !== pathname && !link.getAttribute('data-prefetched')) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = path;
          prefetchLink.as = 'document';
          
          const existing = document.querySelector(`link[rel="prefetch"][href="${path}"]`);
          if (!existing) {
            document.head.appendChild(prefetchLink);
            link.setAttribute('data-prefetched', 'true');
          }
        }
      }
    };

    // Add hover listeners to all links
    document.addEventListener('mouseover', prefetchOnHover);

    // Intersection Observer for visible links
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          if (link.href && link.href.startsWith(window.location.origin)) {
            const url = new URL(link.href);
            const path = url.pathname;
            
            if (path !== pathname && !link.getAttribute('data-prefetched')) {
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = path;
              prefetchLink.as = 'document';
              
              const existing = document.querySelector(`link[rel="prefetch"][href="${path}"]`);
              if (!existing) {
                document.head.appendChild(prefetchLink);
                link.setAttribute('data-prefetched', 'true');
              }
            }
          }
        }
      });
    }, {
      rootMargin: '50px', // Start prefetching when link is 50px away from viewport
    });

    // Observe all internal links
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(link => observer.observe(link));

    // Cleanup
    return () => {
      document.removeEventListener('mouseover', prefetchOnHover);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

// Helper to manually prefetch a route
export function prefetchRoute(path: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    link.as = 'document';
    
    const existing = document.querySelector(`link[rel="prefetch"][href="${path}"]`);
    if (!existing) {
      document.head.appendChild(link);
    }
  }
}