'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useOnChainStore } from '@/stores/onChainStore';
import { TrackerFormData, FormErrors } from '@/types/on-chain';
import { validateField } from '@/lib/on-chain/validation';

interface VestingTrackerFormProps {
  onSubmit?: (data: TrackerFormData) => void | Promise<void>;
  className?: string;
}

/**
 * Performance-optimized form component with React.memo and useCallback
 */
const VestingTrackerFormOptimized = memo(function VestingTrackerFormOptimized({
  onSubmit,
  className = ''
}: VestingTrackerFormProps) {
  // Store state
  const {
    address,
    vestingStartDate,
    annualGrantBtc,
    totalGrants,
    formErrors,
    isLoading,
    error,
    setFormData,
    validateField: storeValidateField,
    validateAndFetch
  } = useOnChainStore();

  // Local state for real-time validation
  const [localErrors, setLocalErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [rawAmountInput, setRawAmountInput] = useState<string>('');

  // Memoized validation handlers
  const handleAddressChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setFormData({ address: value });
    
    // Real-time validation
    if (touched.address || value.length > 0) {
      const error = validateField('address', value);
      setLocalErrors(prev => ({ ...prev, address: error || undefined }));
      storeValidateField('address', value);
    } else if (touched.address && value.length === 0) {
      // Clear errors when field is empty and was previously touched
      setLocalErrors(prev => ({ ...prev, address: undefined }));
    }
  }, [touched.address, setFormData, storeValidateField]);

  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData({ vestingStartDate: value });
    
    // Real-time validation
    if (touched.vestingStartDate || value.length > 0) {
      const error = validateField('vestingStartDate', value);
      setLocalErrors(prev => ({ ...prev, vestingStartDate: error || undefined }));
      storeValidateField('vestingStartDate', value);
    } else if (touched.vestingStartDate && value.length === 0) {
      // Clear errors when field is empty and was previously touched
      setLocalErrors(prev => ({ ...prev, vestingStartDate: undefined }));
    }
  }, [touched.vestingStartDate, setFormData, storeValidateField]);

  // Format number to avoid scientific notation
  const formatNumberForDisplay = (value: number): string => {
    if (value === 0) return '';
    // Convert to string and handle very small numbers that might show as scientific notation
    const str = value.toString();
    if (str.includes('e')) {
      // Convert scientific notation to decimal
      return value.toFixed(8).replace(/\.?0+$/, '');
    }
    return str;
  };

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Allow empty string, "0", or valid decimal numbers
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      // Store the raw input for display
      setRawAmountInput(inputValue);
      
      // Convert to numeric for validation and storage
      const numericValue = inputValue === '' ? 0 : parseFloat(inputValue) || 0;
      setFormData({ annualGrantBtc: numericValue });
      
      // Real-time validation - validate if touched or has meaningful content
      if (touched.annualGrantBtc || (inputValue.length > 0 && inputValue !== '0')) {
        const error = validateField('annualGrantBtc', numericValue);
        setLocalErrors(prev => ({ ...prev, annualGrantBtc: error || undefined }));
        storeValidateField('annualGrantBtc', numericValue);
      } else if (touched.annualGrantBtc && (inputValue === '' || inputValue === '0')) {
        // Clear errors when field is empty or just "0" and was previously touched
        setLocalErrors(prev => ({ ...prev, annualGrantBtc: undefined }));
      }
    }
  }, [touched.annualGrantBtc, setFormData, storeValidateField]);

  const handleTotalGrantsChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numericValue = inputValue === '' ? 0 : parseInt(inputValue);
    
    // Allow empty string or valid integers
    if (inputValue === '' || (!isNaN(numericValue) && numericValue > 0)) {
      setFormData({ totalGrants: numericValue });
      
      // Real-time validation - validate if touched or has content
      if (touched.totalGrants || inputValue.length > 0) {
        const error = validateField('totalGrants', numericValue);
        setLocalErrors(prev => ({ ...prev, totalGrants: error || undefined }));
        storeValidateField('totalGrants', numericValue);
      } else if (touched.totalGrants && inputValue === '') {
        // Clear errors when field is empty and was previously touched
        setLocalErrors(prev => ({ ...prev, totalGrants: undefined }));
      }
    }
  }, [touched.totalGrants, setFormData, storeValidateField]);

  // Memoized blur handlers
  const handleAddressBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, address: true }));
  }, []);

  const handleDateBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, vestingStartDate: true }));
  }, []);

  const handleAmountBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, annualGrantBtc: true }));
    // Clear raw input so we use the formatted display
    setRawAmountInput('');
  }, []);

  const handleTotalGrantsBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, totalGrants: true }));
  }, []);

  // Memoized form submission handler
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isLoading) {
      return;
    }

    // Mark all fields as touched
    setTouched({
      address: true,
      vestingStartDate: true,
      annualGrantBtc: true,
      totalGrants: true
    });

    // Validate all fields
    const addressError = validateField('address', address);
    const dateError = validateField('vestingStartDate', vestingStartDate);
    const amountError = validateField('annualGrantBtc', annualGrantBtc);
    const totalGrantsError = validateField('totalGrants', totalGrants);

    setLocalErrors({
      address: addressError || undefined,
      vestingStartDate: dateError || undefined,
      annualGrantBtc: amountError || undefined,
      totalGrants: totalGrantsError || undefined
    });

    // If there are validation errors, don't submit
    if (addressError || dateError || amountError || totalGrantsError) {
      return;
    }

    // Clear raw input after successful validation
    setRawAmountInput('');

    // Call custom onSubmit if provided, otherwise use store action
    if (onSubmit) {
      await onSubmit({ address, vestingStartDate, annualGrantBtc, totalGrants });
    } else {
      await validateAndFetch();
    }
  }, [
    isLoading, 
    address, 
    vestingStartDate, 
    annualGrantBtc, 
    totalGrants,
    onSubmit, 
    validateAndFetch
  ]);

  // Memoized derived state
  const displayErrors = React.useMemo(() => ({
    ...localErrors,
    ...formErrors
  }), [localErrors, formErrors]);

  const hasErrors = React.useMemo(() => 
    Object.values(displayErrors).some(error => error), 
    [displayErrors]
  );

  const isFormValid = React.useMemo(() => 
    address.length > 0 && 
    vestingStartDate.length > 0 && 
    annualGrantBtc > 0 && 
    totalGrants > 0 &&
    !hasErrors,
    [address, vestingStartDate, annualGrantBtc, totalGrants, hasErrors]
  );

  const maxDate = React.useMemo(() => 
    new Date().toISOString().split('T')[0],
    []
  );

  const minDate = React.useMemo(() => 
    '2009-01-03', // Bitcoin genesis block date
    []
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bitcoin Address Input */}
        <div className="space-y-2">
          <label 
            htmlFor="bitcoin-address"
            className="block text-sm font-medium text-gray-700 dark:text-white"
          >
            Bitcoin Address
          </label>
          
          <input
            id="bitcoin-address"
            type="text"
            value={address}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
            disabled={isLoading}
            placeholder="Enter your Bitcoin address (e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa)"
            className={`input-field ${
              displayErrors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
            aria-label="Bitcoin address for transaction tracking"
            aria-invalid={!!displayErrors.address}
            aria-describedby={displayErrors.address ? 'address-error' : 'address-help'}
          />

          {/* Error message */}
          {displayErrors.address && (
            <p 
              id="address-error" 
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {displayErrors.address}
            </p>
          )}

          {/* Helper text */}
          {!displayErrors.address && (
            <p 
              id="address-help"
              className="text-sm text-gray-500 dark:text-white/70"
            >
              Supports P2PKH (1...), P2SH (3...), and Bech32 (bc1...) address formats
            </p>
          )}
        </div>

        {/* Vesting Start Date Input */}
        <div className="space-y-2">
          <label 
            htmlFor="vesting-start-date"
            className="block text-sm font-medium text-gray-700 dark:text-white"
          >
            Vesting Start Date
          </label>
          
          <input
            id="vesting-start-date"
            type="date"
            value={vestingStartDate}
            onChange={handleDateChange}
            onBlur={handleDateBlur}
            disabled={isLoading}
            min={minDate} // Bitcoin genesis block date
            max={maxDate} // Prevent future dates
            className={`input-field ${
              displayErrors.vestingStartDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
            aria-label="Date when vesting schedule began"
            aria-invalid={!!displayErrors.vestingStartDate}
            aria-describedby={displayErrors.vestingStartDate ? 'date-error' : 'date-help'}
          />

          {/* Error message */}
          {displayErrors.vestingStartDate && (
            <p 
              id="date-error" 
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {displayErrors.vestingStartDate}
            </p>
          )}

          {/* Helper text */}
          {!displayErrors.vestingStartDate && (
            <p 
              id="date-help"
              className="text-sm text-gray-500 dark:text-white/70"
            >
              The date your vesting schedule began (between January 3, 2009 and today)
            </p>
          )}
        </div>

        {/* Total Number of Grants Input */}
        <div className="space-y-2">
          <label 
            htmlFor="total-grants"
            className="block text-sm font-medium text-gray-700 dark:text-white"
          >
            Total Number of Grants
          </label>
          
          <input
            id="total-grants"
            type="number"
            step="1"
            min="1"
            max="20"
            value={totalGrants === 0 ? '' : totalGrants}
            onChange={handleTotalGrantsChange}
            onBlur={handleTotalGrantsBlur}
            disabled={isLoading}
            placeholder="10"
            className={`input-field ${
              displayErrors.totalGrants ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
            aria-label="Total number of vesting grants"
            aria-invalid={!!displayErrors.totalGrants}
            aria-describedby={displayErrors.totalGrants ? 'total-grants-error' : 'total-grants-help'}
          />

          {/* Error message */}
          {displayErrors.totalGrants && (
            <p 
              id="total-grants-error" 
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {displayErrors.totalGrants}
            </p>
          )}

          {/* Helper text */}
          {!displayErrors.totalGrants && (
            <p 
              id="total-grants-help"
              className="text-sm text-gray-500 dark:text-white/70"
            >
              Total number of grants over the vesting period (e.g., 10 for yearly grants over 10 years, 5 for grants only in first 5 years)
            </p>
          )}
        </div>

        {/* Annual Grant Amount Input */}
        <div className="space-y-2">
          <label 
            htmlFor="annual-grant-btc"
            className="block text-sm font-medium text-gray-700 dark:text-white"
          >
            Annual Grant Amount (BTC)
          </label>
          
          <input
            id="annual-grant-btc"
            type="number"
            step="0.001"
            min="0"
            max="21"
            value={rawAmountInput || (annualGrantBtc === 0 ? '' : formatNumberForDisplay(annualGrantBtc))}
            onChange={handleAmountChange}
            onFocus={() => {
              // When focused, if there's a formatted value, put it in raw input for editing
              if (annualGrantBtc > 0 && !rawAmountInput) {
                setRawAmountInput(annualGrantBtc.toString());
              }
            }}
            onBlur={handleAmountBlur}
            disabled={isLoading}
            placeholder="0.00000000"
            className={`input-field ${
              displayErrors.annualGrantBtc ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
            aria-label="Annual Bitcoin grant amount"
            aria-invalid={!!displayErrors.annualGrantBtc}
            aria-describedby={displayErrors.annualGrantBtc ? 'amount-error' : 'amount-help'}
          />

          {/* Error message */}
          {displayErrors.annualGrantBtc && (
            <p 
              id="amount-error" 
              className="text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {displayErrors.annualGrantBtc}
            </p>
          )}

          {/* Helper text */}
          {!displayErrors.annualGrantBtc && (
            <p 
              id="amount-help"
              className="text-sm text-gray-500 dark:text-white/70"
            >
              The amount of Bitcoin you receive annually (minimum: 1 satoshi)
            </p>
          )}
        </div>

        {/* General Error Message */}
        {(error || displayErrors.general) && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error || displayErrors.general}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full btn-primary ${
            isLoading || !isFormValid 
              ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' 
              : ''
          }`}
          aria-label={isLoading ? 'Processing vesting tracker request' : 'Start tracking vesting grants'}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg 
                className="animate-spin h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyzing Vesting Grants...</span>
            </span>
          ) : (
            'Track Vesting Grants'
          )}
        </button>
      </form>
    </div>
  );
});

export default VestingTrackerFormOptimized;
