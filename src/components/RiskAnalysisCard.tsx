'use client';

import { useEffect, useState } from 'react';
import { RiskAnalysisEngine } from '@/lib/calculators';
import { formatUSD, formatPercent } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface RiskAnalysisCardProps {
  portfolioValue: number;
  expectedAnnualReturn: number;
  timePeriodYears: number;
}

export default function RiskAnalysisCard({
  portfolioValue,
  expectedAnnualReturn,
  timePeriodYears
}: RiskAnalysisCardProps) {
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [monteCarloResults, setMonteCarloResults] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const engine = new RiskAnalysisEngine();
    
    // Calculate risk metrics
    const metrics = engine.calculateRiskMetrics(
      portfolioValue,
      expectedAnnualReturn,
      timePeriodYears
    );
    setRiskMetrics(metrics);

    // Generate scenarios
    const riskScenarios = engine.generateRiskScenarios();
    setScenarios(riskScenarios);

    // Run Monte Carlo simulation
    const simulation = engine.monteCarloSimulation(
      portfolioValue,
      expectedAnnualReturn,
      timePeriodYears,
      1000
    );
    setMonteCarloResults(simulation);
  }, [portfolioValue, expectedAnnualReturn, timePeriodYears]);

  if (!riskMetrics) return null;

  // Prepare data for scenario chart
  const scenarioData = scenarios.map(scenario => ({
    name: scenario.name,
    probability: scenario.probability * 100,
    priceChange: scenario.bitcoinPriceChange,
    finalValue: portfolioValue * (1 + scenario.bitcoinPriceChange / 100)
  }));

  // Colors for scenario bars
  const getBarColor = (priceChange: number) => {
    if (priceChange < -30) return '#dc2626'; // red-600
    if (priceChange < 0) return '#f59e0b';   // amber-500
    if (priceChange < 50) return '#10b981';  // green-500
    return '#3b82f6'; // blue-500
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Risk Analysis</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showAdvanced ? 'Simple' : 'Advanced'} View
        </button>
      </div>

      {/* Key Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {riskMetrics.volatility.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600">Annual Volatility</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {formatUSD(riskMetrics.valueAtRisk)}
          </p>
          <p className="text-xs text-gray-600">Value at Risk (95%)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {riskMetrics.sharpeRatio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600">Sharpe Ratio</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">
            {riskMetrics.probabilityOfLoss.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600">Probability of Loss</p>
        </div>
      </div>

      {/* Risk Scenarios Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Potential Scenarios</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={scenarioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'priceChange') return [`${value}%`, 'Price Change'];
                if (name === 'probability') return [`${value.toFixed(1)}%`, 'Probability'];
                return [formatUSD(value), 'Final Value'];
              }}
            />
            <Bar dataKey="priceChange" name="Price Change">
              {scenarioData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.priceChange)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monte Carlo Results */}
      {monteCarloResults && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Monte Carlo Simulation Results ({timePeriodYears} years)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Median Outcome</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatUSD(monteCarloResults.median)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Probability of 2x</p>
              <p className="text-lg font-semibold text-green-600">
                {(monteCarloResults.probabilityOfDoubling * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">10th Percentile</p>
              <p className="text-sm font-medium text-red-600">
                {formatUSD(monteCarloResults.percentile10)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">90th Percentile</p>
              <p className="text-sm font-medium text-green-600">
                {formatUSD(monteCarloResults.percentile90)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Risk Metrics */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Metrics</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Maximum Drawdown (95% CI)</span>
              <span className="text-sm font-medium text-red-600">
                -{formatUSD(riskMetrics.maxDrawdown)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Risk-Adjusted Return</span>
              <span className="text-sm font-medium text-gray-900">
                {((expectedAnnualReturn - 0.045) / (riskMetrics.volatility / 100)).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily VaR (95%)</span>
              <span className="text-sm font-medium text-amber-600">
                {formatUSD(riskMetrics.valueAtRisk / Math.sqrt(252 * timePeriodYears))}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Risk Warning:</strong> Bitcoin is a highly volatile asset. 
              Historical volatility of ~70% means your investment could fluctuate 
              significantly. Only invest what you can afford to lose.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
