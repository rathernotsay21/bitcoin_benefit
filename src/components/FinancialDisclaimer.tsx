'use client';

import React from 'react';

interface FinancialDisclaimerProps {
  className?: string;
}

export default function FinancialDisclaimer({ className = '' }: FinancialDisclaimerProps) {
  return (
    <div className={`mt-4 p-3 bg-bitcoin-50/50 dark:bg-bitcoin-900/10 border border-bitcoin-200/50 dark:border-bitcoin-700/30 rounded-sm ${className}`}>
      <p className="text-xs text-bitcoin-800 dark:text-bitcoin-200/80 leading-relaxed">
        <span className="font-semibold">⚠️ Disclaimer:</span> Educational estimates only. Not financial/investment advice. 
        Past performance ≠ future results. Bitcoin is volatile. Look, nobody knows what bitcoin will do tomorrow. These are tools for thinking, not promises about the future. Use your judgment.
      </p>
    </div>
  );
}