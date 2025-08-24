'use client';

import { useState, useEffect, useRef } from 'react';
import { useOnChainStore } from '@/stores/onChainStore';
import { TrackerFormData, FormErrors } from '@/types/on-chain';
import { validateField } from '@/lib/on-chain/validation';

interface VestingTrackerFormProps {
  onSubmit?: (data: TrackerFormData) => void;
  className?: string;
}

export default function VestingTrackerForm({
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

  // Local state for enhanced UX
  const [localErrors, setLocalErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showTooltips, setShowTooltips] = useState<Record<string, boolean>>({});
  const [rawAmountInput, setRawAmountInput] = useState<string>('');
  
  // Refs for form elements
  const addressRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const totalGrantsRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Focus management
  useEffect(() => {
    // Focus first field on mount
    if (addressRef.current && !address) {
      addressRef.current.focus();
    }
  }, [address]);

  // Announce errors to screen readers
  const announceError = (field: string, message: string) => {
    const announcement = `${field} field error: ${message}`;
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;
    
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  // Enhanced field validation with announcements
  const validateFieldWithAnnouncement = (field: keyof TrackerFormData, value: any, shouldAnnounce = false) => {
    const error = validateField(field, value);
    
    if (error && shouldAnnounce) {
      announceError(field.charAt(0).toUpperCase() + field.slice(1), error);
    }
    
    setLocalErrors(prev => ({ ...prev, [field]: error || undefined }));
    storeValidateField(field, value);
    
    return !error;
  };

  // Handle input changes with real-time validation
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setFormData({ address: value });
    
    if (touched.address || value.length > 0) {
      validateFieldWithAnnouncement('address', value);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData({ vestingStartDate: value });
    
    if (touched.vestingStartDate || value.length > 0) {
      validateFieldWithAnnouncement('vestingStartDate', value);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        validateFieldWithAnnouncement('annualGrantBtc', numericValue);
      }
    }
  };

  const handleTotalGrantsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numericValue = inputValue === '' ? 0 : parseInt(inputValue);
    
    // Allow empty string or valid integers
    if (inputValue === '' || (!isNaN(numericValue) && numericValue > 0)) {
      setFormData({ totalGrants: numericValue });
      
      if (touched.totalGrants || inputValue.length > 0) {
        validateFieldWithAnnouncement('totalGrants', numericValue);
      }
    }
  };

  // Handle field blur events
  const handleBlur = (field: keyof TrackerFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear raw input for amount field when it loses focus
    if (field === 'annualGrantBtc') {
      setRawAmountInput('');
    }
    
    // Validate on blur with announcement for errors
    let value: any;
    switch (field) {
      case 'address':
        value = address;
        break;
      case 'vestingStartDate':
        value = vestingStartDate;
        break;
      case 'annualGrantBtc':
        value = annualGrantBtc;
        break;
      case 'totalGrants':
        value = totalGrants;
        break;
    }
    
    validateFieldWithAnnouncement(field, value, true);
  };

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

  // Handle form submission with comprehensive validation
  const handleSubmit = async (event: React.FormEvent) => {
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
    const addressValid = validateFieldWithAnnouncement('address', address, true);
    const dateValid = validateFieldWithAnnouncement('vestingStartDate', vestingStartDate, true);
    const amountValid = validateFieldWithAnnouncement('annualGrantBtc', annualGrantBtc, true);
    const totalGrantsValid = validateFieldWithAnnouncement('totalGrants', totalGrants, true);

    // Focus first invalid field
    if (!addressValid && addressRef.current) {
      addressRef.current.focus();
      return;
    }
    if (!dateValid && dateRef.current) {
      dateRef.current.focus();
      return;
    }
    if (!amountValid && amountRef.current) {
      amountRef.current.focus();
      return;
    }
    if (!totalGrantsValid && totalGrantsRef.current) {
      totalGrantsRef.current.focus();
      return;
    }

    // If validation passes, submit
    if (addressValid && dateValid && amountValid && totalGrantsValid) {
      // Clear raw input after successful validation
      setRawAmountInput('');
      
      // Announce successful submission start
      const announcement = 'Form submitted successfully. Processing vesting tracker request.';
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = announcement;
      
      document.body.appendChild(liveRegion);
      setTimeout(() => document.body.removeChild(liveRegion), 1000);

      if (onSubmit) {
        onSubmit({ address, vestingStartDate, annualGrantBtc, totalGrants });
      } else {
        await validateAndFetch();
      }
    }
  };

  // Combine local and store errors
  const displayErrors = {
    ...localErrors,
    ...formErrors
  };

  // Check if form has any errors
  const hasErrors = Object.values(displayErrors).some(error => error);

  // Check if form is valid for submission
  const isFormValid = address.length > 0 && 
                     vestingStartDate.length > 0 && 
                     annualGrantBtc > 0 && 
                     totalGrants > 0 &&
                     !hasErrors;

  // Toggle tooltip visibility
  const toggleTooltip = (field: string) => {
    setShowTooltips(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="space-y-6"
        noValidate
        aria-label="Bitcoin vesting tracker configuration"
      >
        <fieldset className="space-y-6">
          <legend className="sr-only">
            Enter your Bitcoin address, vesting start date, and annual award amount to track your vesting history
          </legend>

          {/* Bitcoin Address Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label 
                htmlFor="bitcoin-address"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Bitcoin Address <span className="text-red-500" aria-label="required">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => toggleTooltip('address')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-1"
                aria-label="More information about Bitcoin address field"
                aria-expanded={showTooltips.address}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Tooltip */}
            {showTooltips.address && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-sm p-3 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Supported Address Formats:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Legacy (P2PKH): starts with "1"</li>
                  <li>• Script Hash (P2SH): starts with "3"</li>
                  <li>• Bech32 (P2WPKH/P2WSH): starts with "bc1"</li>
                </ul>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                  Use a view-only address for enhanced privacy
                </p>
              </div>
            )}
            
            <input
              ref={addressRef}
              id="bitcoin-address"
              type="text"
              value={address}
              onChange={handleAddressChange}
              onBlur={() => handleBlur('address')}
              disabled={isLoading}
              placeholder="Enter your Bitcoin address (e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa)"
              className={`input-field ${
                displayErrors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
              aria-label="Bitcoin address for transaction tracking"
              aria-invalid={!!displayErrors.address}
              aria-describedby={`${displayErrors.address ? 'address-error' : 'address-help'}`}
              aria-required="true"
              autoComplete="off"
              spellCheck={false}
            />

            {/* Error message */}
            {displayErrors.address && (
              <p 
                id="address-error" 
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
            <div className="flex items-center gap-2">
              <label 
                htmlFor="vesting-start-date"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Vesting Start Date <span className="text-red-500" aria-label="required">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => toggleTooltip('date')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-1"
                aria-label="More information about vesting start date field"
                aria-expanded={showTooltips.date}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Tooltip */}
            {showTooltips.date && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-sm p-3 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Vesting Start Date:</p>
                <ul className="space-y-1 text-xs">
                  <li>• The date your vesting schedule began</li>
                  <li>• Must be in the past (not future)</li>
                  <li>• Used to calculate expected grant dates</li>
                  <li>• Annual awards expected on anniversaries</li>
                </ul>
              </div>
            )}
            
            <input
              ref={dateRef}
              id="vesting-start-date"
              type="date"
              value={vestingStartDate}
              onChange={handleDateChange}
              onBlur={() => handleBlur('vestingStartDate')}
              disabled={isLoading}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              className={`input-field ${
                displayErrors.vestingStartDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
              aria-label="Date when vesting schedule began"
              aria-invalid={!!displayErrors.vestingStartDate}
              aria-describedby={displayErrors.vestingStartDate ? 'date-error' : 'date-help'}
              aria-required="true"
            />

            {/* Error message */}
            {displayErrors.vestingStartDate && (
              <p 
                id="date-error" 
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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

          {/* Annual Award Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label 
                htmlFor="annual-grant-btc"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Annual Award Amount (BTC) <span className="text-red-500" aria-label="required">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => toggleTooltip('amount')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-1"
                aria-label="More information about annual award amount field"
                aria-expanded={showTooltips.amount}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Tooltip */}
            {showTooltips.amount && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-sm p-3 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Annual Award Amount:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Amount of Bitcoin you receive each year</li>
                  <li>• Minimum: 0.00000001 BTC (1 satoshi)</li>
                  <li>• Maximum: 21 BTC</li>
                  <li>• Used to match against actual transactions</li>
                </ul>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                  Example: 0.1 BTC annually
                </p>
              </div>
            )}
            
            <input
              ref={amountRef}
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
              onBlur={() => handleBlur('annualGrantBtc')}
              disabled={isLoading}
              placeholder="0.00000000"
              className={`input-field ${
                displayErrors.annualGrantBtc ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
              aria-label="Annual Bitcoin award amount"
              aria-invalid={!!displayErrors.annualGrantBtc}
              aria-describedby={displayErrors.annualGrantBtc ? 'amount-error' : 'amount-help'}
              aria-required="true"
            />

            {/* Error message */}
            {displayErrors.annualGrantBtc && (
              <p 
                id="amount-error" 
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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

          {/* Total Number of Grants Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label 
                htmlFor="total-grants"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Total Number of Grants <span className="text-red-500" aria-label="required">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => toggleTooltip('totalGrants')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-1"
                aria-label="More information about total grants field"
                aria-expanded={showTooltips.totalGrants}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Tooltip */}
            {showTooltips.totalGrants && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-sm p-3 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Total Number of Grants:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Total awards over the vesting period</li>
                  <li>• 10 for yearly grants over 10 years</li>
                  <li>• 5 for grants only in first 5 years</li>
                  <li>• 1 for single grant scenarios</li>
                </ul>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                  Example: 10 grants for standard 10-year vesting
                </p>
              </div>
            )}
            
            <input
              ref={totalGrantsRef}
              id="total-grants"
              type="number"
              step="1"
              min="1"
              max="20"
              value={totalGrants === 0 ? '' : totalGrants}
              onChange={handleTotalGrantsChange}
              onBlur={() => handleBlur('totalGrants')}
              disabled={isLoading}
              placeholder="10"
              className={`input-field ${
                displayErrors.totalGrants ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed dark:bg-slate-700' : ''}`}
              aria-label="Total number of vesting grants"
              aria-invalid={!!displayErrors.totalGrants}
              aria-describedby={displayErrors.totalGrants ? 'total-grants-error' : 'total-grants-help'}
              aria-required="true"
            />

            {/* Error message */}
            {displayErrors.totalGrants && (
              <p 
                id="total-grants-error" 
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {displayErrors.totalGrants}
              </p>
            )}

            {/* Helper text */}
            {!displayErrors.totalGrants && (
              <p 
                id="total-grants-help"
                className="text-sm text-gray-500 dark:text-white/70"
              >
                Total number of grants over the vesting period (1-20)
              </p>
            )}
          </div>
        </fieldset>

        {/* General Error Message */}
        {(error || displayErrors.general) && (
          <div 
            className="p-4 rounded-sm bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error || displayErrors.general}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full btn-primary flex items-center justify-center space-x-2 ${
            isLoading || !isFormValid 
              ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' 
              : ''
          }`}
          aria-label={isLoading ? 'Processing vesting tracker request' : 'Start tracking vesting grants'}
        >
          {isLoading ? (
            <>
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
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Track Vesting Grants</span>
            </>
          )}
        </button>

        {/* Form progress indicator */}
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-2">
            {[1, 2, 3, 4].map((step) => {
              let isComplete = false;
              if (step === 1) isComplete = !!address && !displayErrors.address;
              if (step === 2) isComplete = !!vestingStartDate && !displayErrors.vestingStartDate;
              if (step === 3) isComplete = !!annualGrantBtc && !displayErrors.annualGrantBtc;
              if (step === 4) isComplete = !!totalGrants && !displayErrors.totalGrants;

              return (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isComplete 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                  aria-label={`Form step ${step} ${isComplete ? 'completed' : 'incomplete'}`}
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Complete all fields to track your vesting grants
          </p>
        </div>
      </form>
    </div>
  );
}
