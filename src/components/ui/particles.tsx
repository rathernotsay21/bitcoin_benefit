'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../ThemeProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  targetOpacity: number;
}

interface ParticlesProps {
  quantity?: number;
  ease?: number;
  color?: string;
  refresh?: boolean;
  className?: string;
  vx?: number;
  vy?: number;
}

export default function Particles({
  quantity = 50, // Reduced from 100 for better performance
  ease = 80,     // Increased for smoother movement
  color = '#f97316',
  refresh = false,
  className = '',
  vx = 0.1,
  vy = 0.1
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const idleCallbackRef = useRef<number>();
  
  // Critical Performance Optimization 1: Intersection Observer
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '50px', // Start loading slightly before in viewport
        threshold: 0.1      // Trigger when 10% visible
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Critical Performance Optimization 2: Delayed Loading (2 seconds)
  useEffect(() => {
    if (!isVisible) return undefined;

    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // 2-second delay before starting to load particles
    loadTimeoutRef.current = setTimeout(() => {
      setShouldLoad(true);
    }, 2000);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isVisible]);

  // Critical Performance Optimization 3: RequestIdleCallback for Loading
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current || !shouldLoad) return;
    
    const canvas = canvasRef.current;
    
    // Use requestIdleCallback for non-blocking initialization
    const initCallback = (deadline?: IdleDeadline) => {
      const batchSize = 10; // Process particles in small batches
      const newParticles: Particle[] = [];
      
      // Ensure canvas has proper dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || window.innerWidth;
        canvas.height = rect.height || window.innerHeight;
      }
      
      let processed = 0;
      
      const processBatch = () => {
        while (processed < quantity && processed < (processed + batchSize)) {
          newParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2, // Gentler movement
            vy: (Math.random() - 0.5) * 0.2,
            radius: Math.random() * 1.2 + 0.6, // Smaller particles
            opacity: Math.random() * 0.6 + 0.2,
            targetOpacity: Math.random() * 0.6 + 0.2
          });
          processed++;
        }
        
        if (processed < quantity) {
          // Continue in next idle period
          if ('requestIdleCallback' in window) {
            idleCallbackRef.current = (window as any).requestIdleCallback(processBatch);
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(processBatch, 16);
          }
        } else {
          // All particles created
          setParticles(newParticles);
          setIsLoaded(true);
        }
      };
      
      processBatch();
    };

    if ('requestIdleCallback' in window) {
      idleCallbackRef.current = (window as any).requestIdleCallback(initCallback, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => initCallback(), 0);
    }
  }, [quantity, shouldLoad]);

  // Initialize particles when should load
  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      initializeParticles();
    }
  }, [shouldLoad, isLoaded, initializeParticles]);
  
  // Handle canvas resize with performance optimization
  useEffect(() => {
    if (!canvasRef.current || !isLoaded) return undefined;
    
    const canvas = canvasRef.current;
    let resizeTimeout: NodeJS.Timeout;
    
    const resizeCanvas = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Only reinitialize if particles exist
        if (particles.length > 0) {
          // Use requestIdleCallback for resize reinitialization
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
              initializeParticles();
            });
          } else {
            setTimeout(() => initializeParticles(), 50);
          }
        }
      }, 100);
    };
    
    // Set initial size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particles.length, isLoaded, initializeParticles]);
  
  // Optimized mouse movement handling
  useEffect(() => {
    if (!canvasRef.current || !isLoaded) return undefined;
    
    let mouseMoveTimeout: NodeJS.Timeout;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mouse events for better performance
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }, 16); // ~60fps throttling
    };
    
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      clearTimeout(mouseMoveTimeout);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLoaded]);
  
  // Optimized animation loop with performance monitoring
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0 || !isLoaded) return undefined;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    
    let lastFrameTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime;
      
      // Skip frame if too fast (maintain ~60fps max)
      if (deltaTime < 16.67) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastFrameTime = currentTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Batch particle updates for better performance
      const updatedParticles = particles.map(particle => {
        // Calculate distance to mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Gentle mouse interaction
        if (distance < 100 && distance > 0) {
          particle.targetOpacity = Math.min(0.8, 0.4 + (100 - distance) / 100 * 0.4);
          const force = (100 - distance) / 100;
          particle.vx -= (dx / distance) * force * 0.008;
          particle.vy -= (dy / distance) * force * 0.008;
        } else {
          particle.targetOpacity = Math.random() * 0.5 + 0.2;
        }
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Apply damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        
        // Add slight random movement
        particle.vx += (Math.random() - 0.5) * 0.002;
        particle.vy += (Math.random() - 0.5) * 0.002;
        
        // Update opacity
        particle.opacity += (particle.targetOpacity - particle.opacity) * 0.03;
        
        return particle;
      });
      
      setParticles(updatedParticles);
      
      // Optimized rendering - simplified for better performance
      const particleColor = theme === 'dark' ? '#94a3b8' : color;
      
      updatedParticles.forEach(particle => {
        if (particle.opacity < 0.1) return; // Skip nearly invisible particles
        
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Simplified rendering - no glow for better performance
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, theme, color, isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (idleCallbackRef.current) {
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleCallbackRef.current);
        }
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 w-full h-full ${className}`}
    >
      {shouldLoad && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            pointerEvents: 'none',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in'
          }}
        />
      )}
    </div>
  );
}