'use client';

import { useEffect, useState } from 'react';

export function CSSLoadingGuard({ children }: { children: React.ReactNode }) {
  const [cssLoaded, setCssLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    function checkCSSLoaded(): boolean {
      try {
        // Create a test element with a known class
        const testEl = document.createElement('div');
        testEl.className = 'btn-primary';
        testEl.style.position = 'absolute';
        testEl.style.visibility = 'hidden';
        testEl.style.pointerEvents = 'none';
        document.body.appendChild(testEl);

        // Check if the styles are applied
        const styles = window.getComputedStyle(testEl);
        const hasBackground = styles.background && 
          (styles.background.includes('gradient') || styles.background.includes('#f7931a'));
        const hasPadding = parseFloat(styles.paddingTop) > 10; // btn-primary has 14px padding

        document.body.removeChild(testEl);
        return hasBackground || hasPadding;
      } catch (error) {
        console.warn('CSS check failed:', error);
        return false;
      }
    }

    function reloadCSS() {
      // Dynamic CSS file detection - no hardcoded references
      const cssFiles = [];
      
      // Find actual CSS files in document
      const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]')) as HTMLLinkElement[];
      const nextCssLinks = existingLinks.filter(link => link.href.includes('/_next/static/css/'));
      
      // If we found CSS links, use them
      if (nextCssLinks.length > 0) {
        cssFiles.push(...nextCssLinks.map(l => l.href));
      } else {
        // Try to find CSS files from script tags (Next.js injects them)
        const scriptTags = Array.from(document.querySelectorAll('script'));
        const cssRegex = /\/_next\/static\/css\/[a-f0-9]+\.css/g;
        scriptTags.forEach(script => {
          const matches = script.innerHTML.match(cssRegex);
          if (matches) {
            cssFiles.push(...matches);
          }
        });
      }

      const filesToReload = cssFiles.length > 0 ? cssFiles : [];

      console.log('Reloading CSS files:', filesToReload);

      filesToReload.forEach((href, index) => {
        setTimeout(() => {
          // Remove existing
          const existing = document.querySelector(`link[href*="${href.split('/').pop()?.split('?')[0]}"]`);
          if (existing) {
            existing.remove();
          }

          // Add new with cache buster
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `${href.split('?')[0]}?v=${Date.now()}`;
          link.onload = () => {
            setTimeout(() => {
              if (checkCSSLoaded()) {
                setCssLoaded(true);
                setShowFallback(false);
              }
            }, 100);
          };
          link.onerror = () => {
            console.error('CSS file failed to load:', link.href);
          };
          
          document.head.appendChild(link);
        }, index * 100); // Stagger the requests
      });
    }

    function performCheck() {
      const isLoaded = checkCSSLoaded();
      
      if (isLoaded) {
        setCssLoaded(true);
        setShowFallback(false);
        return;
      }

      console.warn(`CSS not loaded (attempt ${retryCount + 1})`);
      
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setShowFallback(true);
        reloadCSS();
        
        // Check again after reload attempt
        timeout = setTimeout(performCheck, 2000);
      } else {
        console.error('CSS loading failed after 3 attempts');
        setShowFallback(true);
        // Still show content even if CSS fails
        setCssLoaded(true);
      }
    }

    // Initial check
    timeout = setTimeout(performCheck, 1000);

    // Cleanup
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [retryCount]);

  if (showFallback && !cssLoaded) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#F4F6F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: 'system-ui, arial, sans-serif',
          color: '#1e2a3a'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #f7931a', 
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading styles... ({retryCount}/3)</p>
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `
          }} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}