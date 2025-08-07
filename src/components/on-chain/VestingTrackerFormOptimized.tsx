'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useOnChainStore } from '@/stores/onChainStore';
import { TrackerFormData, FormErrors } from '@/types/on-chain';
import { validateField } from '@/lib/on-chain/validation';

interface VestingTrackerFormProps {
  onSubmit?: (data: TrackerFormData) => void;
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

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData({ annualGrantBtc: value });
    
    // Real-time validation
    if (touched.annualGrantBtc || value > 0) {
      const error = validateField('annualGrantBtc', value);
      setLocalErrors(prev => ({ ...prev, annualGrantBtc: error || undefined }));
      storeValidateField('annualGrantBtc', value);
    } else if (touched.annualGrantBtc && value === 0) {
      // Clear errors when field is empty and was previously touched
      setLocalErrors(prev => ({ ...prev, annualGrantBtc: undefined }));
    }
  }, [touched.annualGrantBtc, setFormData, storeValidateField]);

  // Memoized blur handlers
  const handleAddressBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, address: true }));
  }, []);

  const handleDateBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, vestingStartDate: true }));
  }, []);

  const handleAmountBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, annualGrantBtc: true }));
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
      annualGrantBtc: true
    });

    // Validate all fields
    const addressError = validateField('address', address);
    const dateError = validateField('vestingStartDate', vestingStartDate);
    const amountError = validateField('annualGrantBtc', annualGrantBtc);

    setLocalErrors({
      address: addressError || undefined,
      vestingStartDate: dateError || undefined,
      annualGrantBtc: amountError || undefined
    });

    // If there are validation errors, don't submit
    if (addressError || dateError || amountError) {
      return;
    }

    // Call custom onSubmit if provided, otherwise use store action
    if (onSubmit) {
      onSubmit({ address, vestingStartDate, annualGrantBtc });
    } else {
      await validateAndFetch();
    }
  }, [
    isLoading, 
    address, 
    vestingStartDate, 
    annualGrantBtc, 
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
    !hasErrors,
    [address, vestingStartDate, annualGrantBtc, hasErrors]
  );

  const maxDate = React.useMemo(() => 
    new Date().toISOString().split('T')[0],
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
              The date your vesting schedule began (cannot be in the future)
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
            step="0.00000001"
            min="0.00000001"
            max="21"
            value={annualGrantBtc || ''}
            onChange={handleAmountChange}
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
              <span>Tracking Vesting Grants...</span>
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
