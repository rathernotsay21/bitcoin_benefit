import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes,
  fill = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate WebP version path if src is jpg/png
  const getWebPSrc = (originalSrc: string): string => {
    // If already webp, return as is
    if (originalSrc.endsWith('.webp')) return originalSrc;
    
    // Check if WebP version exists
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // For known converted images, use WebP
    const knownWebPImages = [
      '/bitbox.webp',
      '/foundation.webp',
      '/blockstream.webp',
      '/logos/bb_logo.webp',
      '/cash_app_logo.webp',
      '/river_logo.webp',
    ];
    
    if (knownWebPImages.includes(webpSrc)) {
      return webpSrc;
    }
    
    // Otherwise return original
    return originalSrc;
  };

  const optimizedSrc = getWebPSrc(src);

  // Fallback for error
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    
    // If WebP fails, try original format
    if (optimizedSrc !== src && !hasError) {
      setHasError(false);
      return src;
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Common image props
  const imageProps = {
    alt,
    className: `${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`,
    priority,
    quality,
    placeholder,
    blurDataURL,
    onLoad: handleLoad,
    onError: handleError,
    ...(sizes && { sizes }),
  };

  if (fill) {
    return (
      <Image
        src={hasError ? src : optimizedSrc}
        fill
        alt={alt}
        {...imageProps}
      />
    );
  }

  if (!width || !height) {
    // For images without dimensions, use fill with a container
    return (
      <div className="relative w-full h-full">
        <Image
          src={hasError ? src : optimizedSrc}
          fill
          alt={alt}
          {...imageProps}
        />
      </div>
    );
  }

  return (
    <Image
      src={hasError ? src : optimizedSrc}
      width={width}
      height={height}
      alt={alt}
      {...imageProps}
    />
  );
}

// Preload critical images
export function preloadImage(src: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    // Try WebP first
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    link.href = webpSrc;
    
    // Add type for WebP
    if (webpSrc.endsWith('.webp')) {
      link.type = 'image/webp';
    }
    
    document.head.appendChild(link);
  }
}

// Helper to generate blur data URL for placeholder
export async function generateBlurDataURL(src: string): Promise<string> {
  // This would typically be done at build time
  // For now, return a generic blur placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGZpbHRlciBpZD0iYiI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMjAiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VlZSIgZmlsdGVyPSJ1cmwoI2IpIi8+PC9zdmc+';
}