'use client';

import { useState, useEffect } from 'react';

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
  maxYear = new Date().getFullYear(),
  disabled = false,
  className = ''
}: YearSelectorProps) {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Generate array of years from minYear to maxYear
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

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

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (disabled) {
      return;
    }
    
    const year = parseInt(event.target.value, 10);
    
    if (!isNaN(year)) {
      onYearChange(year);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-white">
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
          Historical Bitcoin data available from {minYear} to {maxYear}
        </p>
      )}
    </div>
  );
}