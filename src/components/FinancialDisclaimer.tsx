'use client';

import React from 'react';

interface FinancialDisclaimerProps {
  className?: string;
}

export default function FinancialDisclaimer({ className = '' }: FinancialDisclaimerProps) {
  return (
    <div className={`mt-4 p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 rounded-lg ${className}`}>
      <p className="text-xs text-amber-800 dark:text-amber-200/80 leading-relaxed">
        <span className="font-semibold">⚠️ Disclaimer:</span> Educational estimates only. Not financial/investment advice. 
        Past performance ≠ future results. Bitcoin is volatile.
      </p>
    </div>
  );
}