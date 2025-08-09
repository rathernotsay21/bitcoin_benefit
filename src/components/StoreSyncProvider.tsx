'use client';

import { useStoreSync } from '@/hooks/useStoreSync';
import { ReactNode } from 'react';

interface StoreSyncProviderProps {
  children: ReactNode;
}

/**
 * Client component that initializes store synchronization
 * This ensures Bitcoin price and other critical data stays consistent across stores
 */
export function StoreSyncProvider({ children }: StoreSyncProviderProps) {
  // Initialize store synchronization
  useStoreSync();
  
  return <>{children}</>;
}
