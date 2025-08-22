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
}

export default function Particles({
  quantity = 100,
  ease = 50,
  color = '#F7931A',
  refresh = false,
  className = ''
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { theme } = useTheme();
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  
  // Initialize particles after canvas is properly sized
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    // Ensure canvas has proper dimensions before creating particles
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < quantity; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, // Reduced velocity for gentler movement
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.8, // Slightly smaller particles
        opacity: Math.random() * 0.8 + 0.3,
        targetOpacity: Math.random() * 0.8 + 0.3
      });
    }
    
    setParticles(newParticles);
  }, [quantity]);

  useEffect(() => {
    // Delay initialization to ensure canvas is mounted and sized
    const timer = setTimeout(() => {
      initializeParticles();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [initializeParticles, refresh]);
  
  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const resizeCanvas = (): void => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Reinitialize particles when canvas resizes to redistribute them
      if (particles.length > 0) {
        setTimeout(() => initializeParticles(), 50);
      }
    };
    
    // Set initial size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [initializeParticles, particles.length]);
  
  // Handle mouse movement
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const handleMouseMove = (e: MouseEvent): void => {
      const rect = canvasRef.current!.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setParticles(currentParticles => {
        return currentParticles.map(particle => {
          // Calculate distance to mouse
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Gentle mouse interaction
          if (distance < 80) {
            particle.targetOpacity = Math.min(1.0, 0.5 + (80 - distance) / 80 * 0.4);
            const force = (80 - distance) / 80;
            particle.vx -= (dx / distance) * force * 0.01;
            particle.vy -= (dy / distance) * force * 0.01;
          } else {
            particle.targetOpacity = Math.random() * 0.6 + 0.3;
          }
          
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Wrap around screen
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
          
          // Apply stronger damping for gentler movement
          particle.vx *= 0.995;
          particle.vy *= 0.995;
          
          // Add slight random movement for floating effect
          particle.vx += (Math.random() - 0.5) * 0.003;
          particle.vy += (Math.random() - 0.5) * 0.003;
          
          // Update opacity
          particle.opacity += (particle.targetOpacity - particle.opacity) * 0.02;
          
          return particle;
        });
      });
      
      // Draw particles with glow effect
      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Create glow effect
        const glowSize = particle.radius * 3;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        
        const particleColor = theme === 'dark' ? '#94a3b8' : color;
        gradient.addColorStop(0, particleColor);
        gradient.addColorStop(0.4, particleColor + '80'); // 50% opacity
        gradient.addColorStop(1, particleColor + '00'); // Transparent
        
        // Draw glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw main particle
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
  }, [particles, theme, color]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}