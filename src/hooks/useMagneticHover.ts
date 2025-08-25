import { useEffect, useRef } from 'react';

interface MagneticOptions {
  strength?: number;
  maxDistance?: number;
}

export function useMagneticHover(options: MagneticOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const { strength = 0.3, maxDistance = 50 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if device supports hover (not touch device)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (!supportsHover) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        if (distance < maxDistance) {
          const translateX = distanceX * strength;
          const translateY = distanceY * strength;
          
          element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        } else {
          element.style.transform = '';
        }
      });
    };

    const handleMouseLeave = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      element.style.transform = '';
    };

    // Add event listeners to parent container for smoother effect
    const container = element.parentElement;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [strength, maxDistance]);

  return ref;
}