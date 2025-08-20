'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '../ThemeProvider';

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  className?: string;
}

export default function Noise({
  patternSize = 100,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 100,
  patternAlpha = 0.15,
  className = ''
}: NoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const intervalRef = useRef<NodeJS.Timeout>();
  
  // Generate noise pattern
  const generateNoise = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create noise pattern
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      const alpha = Math.random() * patternAlpha * 255;
      
      if (theme === 'dark') {
        // Dark theme: lighter noise
        data[i] = noise * 0.8 + 50; // R
        data[i + 1] = noise * 0.8 + 50; // G
        data[i + 2] = noise * 0.8 + 80; // B (slightly blue tint)
        data[i + 3] = alpha * 0.3; // A
      } else {
        // Light theme: darker noise with bitcoin color hint
        data[i] = Math.min(255, noise * 0.6 + 200); // R (orange tint)
        data[i + 1] = Math.min(255, noise * 0.5 + 180); // G
        data[i + 2] = noise * 0.4 + 100; // B
        data[i + 3] = alpha; // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add subtle gradient overlay for depth
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    
    if (theme === 'dark') {
      gradient.addColorStop(0, 'rgba(30, 41, 59, 0)');
      gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    } else {
      gradient.addColorStop(0, 'rgba(247, 147, 26, 0)');
      gradient.addColorStop(0.7, 'rgba(247, 147, 26, 0.05)');
      gradient.addColorStop(1, 'rgba(226, 232, 240, 0.1)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * patternScaleX;
      canvas.height = canvas.offsetHeight * patternScaleY;
      generateNoise();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternScaleX, patternScaleY, theme]);
  
  // Animation loop for refreshing pattern
  useEffect(() => {
    if (patternRefreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        generateNoise();
      }, patternRefreshInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      generateNoise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternRefreshInterval, theme, patternAlpha]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ 
        pointerEvents: 'none',
        mixBlendMode: theme === 'dark' ? 'screen' : 'multiply'
      }}
    />
  );
}