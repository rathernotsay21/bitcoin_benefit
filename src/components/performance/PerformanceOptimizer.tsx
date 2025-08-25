'use client';

import { useEffect } from 'react';
import { injectPerformanceCSS, removePerformanceCSS } from '@/lib/performance/css-optimizer';
import { useIdleAnimationPause, usePerformanceAdaptiveAnimations } from '@/hooks/useIdleAnimationPause';

interface PerformanceOptimizerProps {
  enabled?: boolean;
  children: React.ReactNode;
}

export function PerformanceOptimizer({ 
  enabled = process.env.NODE_ENV === 'production',
  children 
}: PerformanceOptimizerProps) {
  // Pause animations when idle
  useIdleAnimationPause(15000); // Pause after 15 seconds of inactivity
  
  // Adapt animations based on device performance
  usePerformanceAdaptiveAnimations();
  
  useEffect(() => {
    if (!enabled) return;
    
    if (enabled) {
      injectPerformanceCSS();
      
      // Also disable infinite animations via JavaScript
      const disableAnimations = () => {
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          const computed = window.getComputedStyle(el);
          if (computed.animationIterationCount === 'infinite') {
            (el as HTMLElement).style.animationIterationCount = '1';
            (el as HTMLElement).style.animationPlayState = 'paused';
          }
        });
      };
      
      // Run immediately and after content loads
      disableAnimations();
      setTimeout(disableAnimations, 100);
      setTimeout(disableAnimations, 500);
      
      // Monitor for new elements
      const observer = new MutationObserver(() => {
        disableAnimations();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => {
        observer.disconnect();
        if (process.env.NODE_ENV === 'development') {
          removePerformanceCSS();
        }
      };
    }
  }, [enabled]);
  
  return <>{children}</>;
}