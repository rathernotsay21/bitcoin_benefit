'use client';

import React from 'react';

interface CacheManagerProps {
  showInProduction?: boolean;
  className?: string;
}

// Cache manager component - service worker removed for performance
export function CacheManager({ showInProduction = false, className = '' }: CacheManagerProps): null {
  // Service worker has been removed to improve performance scores
  // Browser's built-in HTTP caching and Next.js optimizations handle caching
  return null;
}

export default CacheManager;