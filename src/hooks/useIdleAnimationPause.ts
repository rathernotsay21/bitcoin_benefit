import { useEffect, useRef } from 'react';

/**
 * Hook to pause animations when the page is idle to save resources
 * Helps prevent the 170-second paint blocking issue
 */
export function useIdleAnimationPause(timeout = 10000) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animatedElementsRef = useRef<HTMLElement[]>([]);
  
  useEffect(() => {
    const pauseAnimations = () => {
      // Find all elements with animations
      const elements = document.querySelectorAll('*');
      const animated: HTMLElement[] = [];
      
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        if (computed.animationName && computed.animationName !== 'none') {
          animated.push(el as HTMLElement);
          (el as HTMLElement).style.animationPlayState = 'paused';
        }
      });
      
      animatedElementsRef.current = animated;
      console.log('[Performance] Paused', animated.length, 'animations due to idle');
    };
    
    const resumeAnimations = () => {
      animatedElementsRef.current.forEach(el => {
        el.style.animationPlayState = 'running';
      });
      
      if (animatedElementsRef.current.length > 0) {
        console.log('[Performance] Resumed', animatedElementsRef.current.length, 'animations');
      }
    };
    
    const resetIdleTimer = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Resume animations on activity
      resumeAnimations();
      
      // Set new timeout
      timeoutRef.current = setTimeout(pauseAnimations, timeout);
    };
    
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add listeners
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });
    
    // Start the idle timer
    resetIdleTimer();
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      resumeAnimations();
    };
  }, [timeout]);
}

/**
 * Hook to reduce animation complexity when performance is poor
 */
export function usePerformanceAdaptiveAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if the device has low performance
    const checkPerformance = () => {
      // Check device memory (if available)
      const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      
      // Check hardware concurrency (CPU cores)
      const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      
      // Check connection quality
      const slowConnection = (navigator as any).connection && 
        ((navigator as any).connection.effectiveType === '2g' || 
         (navigator as any).connection.effectiveType === '3g');
      
      return lowMemory || lowCPU || slowConnection;
    };
    
    const isLowPerf = checkPerformance();
    
    if (isLowPerf) {
      // Add class to body to disable complex animations via CSS
      document.body.classList.add('reduce-animations');
      console.log('[Performance] Reduced animation complexity for low-end device');
      
      return () => {
        document.body.classList.remove('reduce-animations');
      };
    }
  }, []);
}