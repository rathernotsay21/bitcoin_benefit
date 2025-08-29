/**
 * Example component demonstrating optimized debounced input handling
 * This shows how to use the debounce utilities with the calculator store
 */

'use client';

import React, { useState } from 'react';
import { VestingScheme } from '@/types/vesting';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { useDebouncedState, useDebouncedStoreUpdate, useDebouncedSearch } from '@/hooks/useDebounce';

export function OptimizedCalculatorInput() {
  const { inputs, updateInputs } = useCalculatorStore();
  
  // Create a debounced store updater
  const { update: debouncedUpdate } = useDebouncedStoreUpdate(updateInputs, 300);
  
  // Use debounced state for the growth rate input
  const {
    value: growthRate,
    setValue: setGrowthRate,
    isPending
  } = useDebouncedState(
    inputs.projectedBitcoinGrowth || 15,
    (value) => {
      // This will be called after debounce delay
      debouncedUpdate({ projectedBitcoinGrowth: value });
    },
    300
  );

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="growth-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Projected Bitcoin Growth Rate (%)
        </label>
        <div className="relative">
          <input
            id="growth-rate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={growthRate}
            onChange={(e) => setGrowthRate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-bitcoin focus:border-transparent dark:bg-slate-800 dark:text-white"
          />
          {isPending() && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-bitcoin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
          Changes are automatically calculated after you stop typing
        </p>
      </div>
    </div>
  );
}

/**
 * Example of debounced search component for scheme selection
 */
export function OptimizedSchemeSearch() {
  const { setSelectedScheme } = useCalculatorStore();
  const [schemes, setSchemes] = useState<VestingScheme[]>([]);
  
  // Use debounced search hook
  const {
    query,
    setQuery,
    isSearching,
    clearSearch
  } = useDebouncedSearch(
    async (searchQuery) => {
      // Simulate API call or filtering
      const filtered = VESTING_SCHEMES.filter(scheme =>
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSchemes(filtered);
    },
    200 // Faster debounce for search
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vesting schemes..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-bitcoin focus:border-transparent dark:bg-slate-800 dark:text-white"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {isSearching && (
        <div className="text-sm text-gray-500 dark:text-gray-600 dark:text-gray-400">
          Searching...
        </div>
      )}
      
      {!isSearching && schemes.length > 0 && (
        <div className="grid gap-2">
          {schemes.map(scheme => (
            <button
              key={scheme.id}
              onClick={() => setSelectedScheme(scheme)}
              className="p-3 text-left border border-gray-200 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">{scheme.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-600 dark:text-gray-400">{scheme.description}</div>
            </button>
          ))}
        </div>
      )}
      
      {!isSearching && query && schemes.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-600 dark:text-gray-400">
          No schemes found matching "{query}"
        </div>
      )}
    </div>
  );
}
