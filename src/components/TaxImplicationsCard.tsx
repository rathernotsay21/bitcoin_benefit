'use client';

import { useEffect, useState } from 'react';
import { TaxImplicationCalculator } from '@/lib/calculators';
import { formatUSD, formatPercent } from '@/lib/utils';

interface TaxImplicationsCardProps {
  vestedValue: number;
  costBasis: number;
  holdingPeriodMonths: number;
  annualIncome?: number;
}

export default function TaxImplicationsCard({
  vestedValue,
  costBasis,
  holdingPeriodMonths,
  annualIncome = 100000
}: TaxImplicationsCardProps) {
  const [taxData, setTaxData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const calculator = new TaxImplicationCalculator();
    const result = calculator.calculateVestingTax(
      vestedValue,
      costBasis,
      holdingPeriodMonths,
      annualIncome
    );
    setTaxData(result);
  }, [vestedValue, costBasis, holdingPeriodMonths, annualIncome]);

  if (!taxData) return null;

  const isLongTerm = holdingPeriodMonths >= 12;

  return (
    <div className="bg-white rounded-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tax Implications</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gross Value</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatUSD(taxData.grossValue)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Net After Tax</p>
          <p className="text-xl font-bold text-green-600">{formatUSD(taxData.netValue)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <span className="text-sm text-gray-600 dark:text-gray-400">Total Tax</span>
        <span className="text-lg font-semibold text-red-600">
          -{formatUSD(taxData.totalTax)}
        </span>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <span className="text-sm text-gray-600 dark:text-gray-400">Effective Tax Rate</span>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {taxData.effectiveTaxRate.toFixed(1)}%
        </span>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Income Tax</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatUSD(taxData.incomeTax)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Capital Gains Tax ({isLongTerm ? 'Long-term' : 'Short-term'})
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatUSD(taxData.capitalGainsTax)}
            </span>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-sm">
            <p className="text-xs text-blue-800">
              <strong>Tax Strategy Tip:</strong> {isLongTerm 
                ? 'Your holdings qualify for favorable long-term capital gains rates.'
                : `Hold for ${12 - holdingPeriodMonths} more months to qualify for lower long-term capital gains rates.`
              }
            </p>
          </div>

          {/* Tax Bracket Info */}
          <div className="mt-3 p-3 bg-gray-50 rounded-sm">
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
              <strong>Your Tax Brackets:</strong>
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Income Tax: Up to 37% (based on total income)</li>
              <li>• Long-term Capital Gains: {
                annualIncome < 44625 ? '0%' :
                annualIncome < 492300 ? '15%' : '20%'
              }</li>
              <li>• Short-term Capital Gains: Taxed as ordinary income</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
