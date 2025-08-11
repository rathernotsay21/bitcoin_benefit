/**
 * Custom hooks for optimized debouncing in React components
 */

import { useCallback, useEffect, useRef } from 'react';
import { debounce, DebouncedFunction } from '@/lib/utils/debounce';

/**
 * Creates a debounced version of a callback that persists across renders
 * 
 * @param callback The function to debounce
 * @param delay The debounce delay in milliseconds
 * @param deps Dependencies array - the debounced function will be recreated when these change
 * @returns A stable debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): DebouncedFunction<T> {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef<DebouncedFunction<T>>();

  // Update the callback ref on every render to capture the latest closure
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create and manage the debounced function
  useEffect(() => {
    // Cancel any existing debounced function
    if (debouncedRef.current) {
      debouncedRef.current.cancel();
    }

    // Create new debounced function that calls the latest callback
    const debouncedFn = debounce(
      (...args: Parameters<T>) => callbackRef.current(...args),
      delay
    );

    debouncedRef.current = debouncedFn;

    // Cleanup on unmount or when dependencies change
    return () => {
      debouncedFn.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);

  // Return a stable debounced function (fallback to no-op if not initialized)
  return debouncedRef.current || debounce(() => {}, delay);
}

/**
 * Debounces a value change
 * 
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Creates a debounced state setter
 * Useful for form inputs that trigger expensive operations
 * 
 * @param initialValue Initial state value
 * @param onChange Callback to run when the debounced value changes
 * @param delay Debounce delay in milliseconds
 */
export function useDebouncedState<T>(
  initialValue: T,
  onChange?: (value: T) => void,
  delay: number = 300
) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  const debouncedSetValue = useDebouncedCallback(
    (newValue: T) => {
      setDebouncedValue(newValue);
      onChange?.(newValue);
    },
    delay,
    [onChange]
  );

  const handleChange = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
    const resolvedValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(value)
      : newValue;
    debouncedSetValue(resolvedValue);
  }, [value, debouncedSetValue]);

  return {
    value,           // Immediate value for UI
    debouncedValue,  // Debounced value for expensive operations
    setValue: handleChange,
    forceUpdate: () => debouncedSetValue.flush(),
    cancel: () => debouncedSetValue.cancel(),
    isPending: () => debouncedSetValue.pending()
  };
}

/**
 * Hook for debouncing search queries
 * Optimized for search inputs with loading states
 */
export function useDebouncedSearch(
  onSearch: (query: string) => void | Promise<void>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearch = useDebouncedCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          await onSearch(searchQuery);
        } finally {
          setIsSearching(false);
        }
      } else {
        setIsSearching(false);
      }
    },
    delay,
    [onSearch]
  );

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  return {
    query,
    setQuery: handleQueryChange,
    isSearching,
    clearSearch: () => {
      setQuery('');
      debouncedSearch.cancel();
      setIsSearching(false);
    },
    forceSearch: () => debouncedSearch.flush()
  };
}

/**
 * Hook for debouncing Zustand store updates
 * Prevents excessive re-renders and calculations
 */
export function useDebouncedStoreUpdate<T>(
  updateFn: (value: T) => void,
  delay: number = 300
) {
  const debouncedUpdate = useDebouncedCallback(updateFn, delay, [updateFn]);
  
  return {
    update: debouncedUpdate,
    flush: () => debouncedUpdate.flush(),
    cancel: () => debouncedUpdate.cancel(),
    isPending: () => debouncedUpdate.pending()
  };
}

// Missing import
import { useState } from 'react';
