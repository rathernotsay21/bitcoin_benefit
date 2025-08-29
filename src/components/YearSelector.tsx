'use client';

import { useState, useEffect, useCallback } from 'react';

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  minYear?: number; // Default: 2015
  maxYear?: number; // Default: current year
  disabled?: boolean;
  className?: string;
}

export default function YearSelector({
  selectedYear,
  onYearChange,
  minYear = 2015,
  maxYear = 2025, // Fixed value to prevent hydration mismatch
  disabled = false,
  className = ''
}: YearSelectorProps) {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Generate array of years from minYear to maxYear
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate selected year
  useEffect(() => {
    if (selectedYear < minYear || selectedYear > maxYear) {
      setIsValid(false);
      setErrorMessage(`Year must be between ${minYear} and ${maxYear}`);
    } else {
      setIsValid(true);
      setErrorMessage('');
    }
  }, [selectedYear, minYear, maxYear]);

  const handleYearChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    if (disabled) {
      return;
    }
    
    const year = parseInt(event.target.value, 10);
    
    if (!isNaN(year)) {
      onYearChange(year);
    }
  }, [disabled, onYearChange]);

  if (!mounted) {
    return (
      <div className={`space-y-2 input-container ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-white">
          Starting Year
        </label>
        <div className="input-field animate-pulse bg-gray-200 dark:bg-slate-700 h-12 flex items-center px-3">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 input-container ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-white">
        Starting Year
      </label>
      
      <select
        value={selectedYear}
        onChange={handleYearChange}
        disabled={disabled}
        className={`input-field ${
          !isValid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        aria-label="Select starting year for historical analysis"
        aria-invalid={!isValid}
        aria-describedby={!isValid ? 'year-error' : undefined}
      >
        <option value="" disabled>
          Select a year...
        </option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Error message */}
      {!isValid && errorMessage && (
        <p 
          id="year-error" 
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {/* Helper text */}
      {isValid && (
        <p className="text-sm text-gray-500 dark:text-white/70">
  See how your plan would have performed from {minYear} to today
        </p>
      )}
    </div>
  );
}