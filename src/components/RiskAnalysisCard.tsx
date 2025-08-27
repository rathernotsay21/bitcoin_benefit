'use client';

import { useEffect, useState, useCallback } from 'react';
import { RiskAnalysisEngine } from '@/lib/calculators';
import { formatUSD, formatPercent } from '@/lib/utils';
import { 
  SectionHeading, 
  BodyText, 
  SmallText, 
  Caption,
  Overline 
} from '@/components/ui/typography';
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
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <SectionHeading>Risk Analysis</SectionHeading>
        <button
          onClick={() => setShowAdvanced(prev => !prev)}
          className="text-accent hover:text-accent/80 transition-colors"
        >
          <SmallText>
            {showAdvanced ? 'Simple' : 'Advanced'} View
          </SmallText>
        </button>
      </div>

      {/* Key Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <BodyText className="text-2xl font-bold">
            {riskMetrics.volatility.toFixed(0)}%
          </BodyText>
          <Caption>Annual Volatility</Caption>
        </div>
        <div className="text-center">
          <BodyText className="text-2xl font-bold text-error">
            {formatUSD(riskMetrics.valueAtRisk)}
          </BodyText>
          <Caption>Value at Risk (95%)</Caption>
        </div>
        <div className="text-center">
          <BodyText className="text-2xl font-bold text-accent">
            {riskMetrics.sharpeRatio.toFixed(2)}
          </BodyText>
          <Caption>Sharpe Ratio</Caption>
        </div>
        <div className="text-center">
          <BodyText className="text-2xl font-bold text-warning">
            {riskMetrics.probabilityOfLoss.toFixed(0)}%
          </BodyText>
          <Caption>Probability of Loss</Caption>
        </div>
      </div>

      {/* Risk Scenarios Chart */}
      <div className="mb-6">
        <Overline className="mb-3">Potential Scenarios</Overline>
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
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-sm">
          <Overline className="mb-3">
            Monte Carlo Simulation Results ({timePeriodYears} years)
          </Overline>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Caption>Median Outcome</Caption>
              <BodyText className="text-lg font-semibold">
                {formatUSD(monteCarloResults.median)}
              </BodyText>
            </div>
            <div>
              <Caption>Probability of 2x</Caption>
              <BodyText className="text-lg font-semibold text-success">
                {(monteCarloResults.probabilityOfDoubling * 100).toFixed(0)}%
              </BodyText>
            </div>
            <div>
              <Caption>10th Percentile</Caption>
              <SmallText className="font-medium text-error">
                {formatUSD(monteCarloResults.percentile10)}
              </SmallText>
            </div>
            <div>
              <Caption>90th Percentile</Caption>
              <SmallText className="font-medium text-success">
                {formatUSD(monteCarloResults.percentile90)}
              </SmallText>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Risk Metrics */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Overline className="mb-3">Advanced Metrics</Overline>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <SmallText color="muted">Maximum Drawdown (95% CI)</SmallText>
              <SmallText className="font-medium text-error">
                -{formatUSD(riskMetrics.maxDrawdown)}
              </SmallText>
            </div>
            
            <div className="flex justify-between items-center">
              <SmallText color="muted">Risk-Adjusted Return</SmallText>
              <SmallText className="font-medium">
                {((expectedAnnualReturn - 0.045) / (riskMetrics.volatility / 100)).toFixed(2)}
              </SmallText>
            </div>

            <div className="flex justify-between items-center">
              <SmallText color="muted">Daily VaR (95%)</SmallText>
              <SmallText className="font-medium text-warning">
                {formatUSD(riskMetrics.valueAtRisk / Math.sqrt(252 * timePeriodYears))}
              </SmallText>
            </div>
          </div>

          <div className="mt-4 p-3 bg-bitcoin-50 dark:bg-bitcoin-900/20 rounded-sm">
            <Caption className="text-warning">
              <strong>Risk Warning:</strong> Bitcoin is a highly volatile asset. 
              Historical volatility of ~70% means your investment could fluctuate 
              significantly. Only invest what you can afford to lose.
            </Caption>
          </div>
        </div>
      )}
    </div>
  );
}
