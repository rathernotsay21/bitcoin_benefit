'use client';

import { useEffect, useState } from 'react';
import { EmployeeRetentionModeler } from '@/lib/calculators';
import { formatUSD } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface RetentionAnalysisCardProps {
  employeeCount: number;
  vestingCostPerEmployee: number;
  vestingPeriodMonths: number;
  annualSalaryPerEmployee: number;
}

export default function RetentionAnalysisCard({
  employeeCount,
  vestingCostPerEmployee,
  vestingPeriodMonths,
  annualSalaryPerEmployee
}: RetentionAnalysisCardProps) {
  const [retentionData, setRetentionData] = useState<any>(null);
  const [retentionCurve, setRetentionCurve] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const modeler = new EmployeeRetentionModeler();
    
    // Calculate cost effectiveness
    const costEffectiveness = modeler.calculateCostEffectiveness(
      employeeCount,
      vestingCostPerEmployee,
      vestingPeriodMonths,
      annualSalaryPerEmployee
    );
    setRetentionData(costEffectiveness);

    // Model retention curve
    const vestingSchedule = [
      { months: 0, percent: 0 },
      { months: vestingPeriodMonths / 2, percent: 50 },
      { months: vestingPeriodMonths, percent: 100 }
    ];
    
    const curve = modeler.modelRetentionCurve(
      employeeCount,
      vestingSchedule,
      vestingPeriodMonths
    );
    
    // Sample data points for chart (every 6 months)
    const chartData = curve
      .filter((_, index) => index % 6 === 0)
      .map(point => ({
        month: point.month,
        year: point.month / 12,
        withVesting: point.remainingEmployees,
        withoutVesting: Math.round(employeeCount * Math.pow(0.85, point.month / 12)),
        retentionRate: point.retentionRate
      }));
    
    setRetentionCurve(chartData);
  }, [employeeCount, vestingCostPerEmployee, vestingPeriodMonths, annualSalaryPerEmployee]);

  if (!retentionData) return null;

  const additionalRetained = Math.round(
    employeeCount * (retentionData.withVesting.retentionRate - retentionData.withoutVesting.retentionRate) / 100
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Retention Analysis</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 mb-1">With Vesting</p>
          <p className="text-2xl font-bold text-green-900">
            {retentionData.withVesting.retentionRate.toFixed(0)}%
          </p>
          <p className="text-xs text-green-600">Retention Rate</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-1">Without Vesting</p>
          <p className="text-2xl font-bold text-gray-900">
            {retentionData.withoutVesting.retentionRate.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600">Retention Rate</p>
        </div>
      </div>

      {/* Retention Curve Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Employee Retention Over Time</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={retentionCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              label={{ value: 'Employees', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'withVesting') return [value, 'With Vesting'];
                if (name === 'withoutVesting') return [value, 'Without Vesting'];
                return [value, name];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="withVesting"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="With Vesting"
            />
            <Area
              type="monotone"
              dataKey="withoutVesting"
              stroke="#6b7280"
              fill="#6b7280"
              fillOpacity={0.3}
              name="Without Vesting"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ROI Summary */}
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-900">Additional Employees Retained</span>
          <span className="text-lg font-bold text-blue-900">+{additionalRetained}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-blue-900">ROI from Retention</span>
          <span className="text-lg font-bold text-green-600">
            {retentionData.incrementalValue > 0 ? '+' : ''}{formatUSD(retentionData.incrementalValue)}
          </span>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Tenure</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">With Vesting</span>
                <span className="text-sm font-medium text-gray-900">
                  {(retentionData.withVesting.expectedTenureMonths / 12).toFixed(1)} years
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Without Vesting</span>
                <span className="text-sm font-medium text-gray-900">
                  {(retentionData.withoutVesting.expectedTenureMonths / 12).toFixed(1)} years
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vesting Completion</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Probability of Full Vesting</span>
              <span className="text-sm font-medium text-gray-900">
                {retentionData.withVesting.vestingCompletionProbability.toFixed(0)}%
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cost Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost per Retained Employee</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatUSD(retentionData.withVesting.costPerRetainedEmployee)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Replacement Cost Saved</span>
                <span className="text-sm font-medium text-green-600">
                  {formatUSD(additionalRetained * annualSalaryPerEmployee * 1.5)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>Retention Insight:</strong> Vesting programs typically increase retention by 15-20%. 
              With replacement costs at 150% of annual salary, the ROI on vesting programs is often 
              positive within the first 2-3 years.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
