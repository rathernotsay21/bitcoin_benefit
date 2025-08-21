'use client';

import { useState } from 'react';
import TaxImplicationsCard from './TaxImplicationsCard';
import RiskAnalysisCard from './RiskAnalysisCard';
import RetentionAnalysisCard from './RetentionAnalysisCard';
import { VestingCalculationResult } from '@/types/vesting';

interface AdvancedAnalyticsDashboardProps {
  vestingResults: VestingCalculationResult;
  currentBitcoinPrice: number;
  projectedGrowth: number;
  employeeCount?: number;
  annualSalary?: number;
}

export default function AdvancedAnalyticsDashboard({
  vestingResults,
  currentBitcoinPrice: _currentBitcoinPrice,
  projectedGrowth,
  employeeCount = 100,
  annualSalary = 120000
}: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tax' | 'risk' | 'retention'>('tax');
  
  // Get final timeline values
  const finalMonth = vestingResults.timeline[vestingResults.timeline.length - 1];
  const vestingYears = vestingResults.timeline.length / 12;

  const tabs = [
    { id: 'tax', label: 'Tax Analysis', icon: '💰' },
    { id: 'risk', label: 'Risk Analysis', icon: '📊' },
    { id: 'retention', label: 'Retention Impact', icon: '👥' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Advanced Analytics</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'tax' && (
          <TaxImplicationsCard
            vestedValue={finalMonth?.usdValue ?? 0}
            costBasis={vestingResults.totalCost}
            holdingPeriodMonths={vestingResults.timeline.length}
            annualIncome={annualSalary}
          />
        )}
        
        {activeTab === 'risk' && (
          <RiskAnalysisCard
            portfolioValue={finalMonth?.usdValue ?? 0}
            expectedAnnualReturn={projectedGrowth / 100}
            timePeriodYears={vestingYears}
          />
        )}
        
        {activeTab === 'retention' && (
          <RetentionAnalysisCard
            employeeCount={employeeCount}
            vestingCostPerEmployee={vestingResults.totalCost / employeeCount}
            vestingPeriodMonths={vestingResults.timeline.length}
            annualSalaryPerEmployee={annualSalary}
          />
        )}
      </div>

      {/* Summary Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Key Insights</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Total investment needed: ${vestingResults.totalCost.toLocaleString()}</li>
          <li>• Average vesting period: {vestingResults.summary.averageVestingPeriod.toFixed(0)} months</li>
          <li>• Projected {vestingYears}-year value: ${(finalMonth?.usdValue ?? 0).toLocaleString()}</li>
          <li>• Value multiple: {((finalMonth?.usdValue ?? 0) / vestingResults.totalCost).toFixed(1)}x</li>
        </ul>
      </div>
    </div>
  );
}
