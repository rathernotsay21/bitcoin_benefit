'use client';

import { SatoshiIcon } from '@/components/icons';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MetricCardProps {
  value: string | number;
  label: string;
  color: 'orange' | 'green' | 'blue' | 'purple';
  sublabel?: string;
  icon?: React.ReactNode;
}

interface HistoricalMetricCardsProps {
  historicalResults: any;
  currentBitcoinPrice: number;
  startingYear: number;
}

function MetricCard({ value, label, color, sublabel, icon }: MetricCardProps) {
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
    purple: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
  };

  const textColorClasses = {
    orange: 'text-orange-900 dark:text-orange-100',
    green: 'text-green-900 dark:text-green-100',
    blue: 'text-blue-900 dark:text-blue-100',
    purple: 'text-purple-900 dark:text-purple-100',
  };

  return (
    <div className={`relative h-32 rounded-xl border-2 ${colorClasses[color]} p-4 flex flex-col justify-center items-center text-center transition-all duration-200 hover:shadow-md`}>
      {icon && (
        <div className="absolute top-3 right-3 opacity-30">
          {icon}
        </div>
      )}
      <div className={`text-2xl font-bold ${textColorClasses[color]} mb-1`}>
        {value}
      </div>
      <div className={`text-sm font-medium ${textColorClasses[color]} opacity-80`}>
        {label}
      </div>
      {sublabel && (
        <div className={`text-xs ${textColorClasses[color]} opacity-60 mt-1`}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

function formatBTC(amount: number): string {
  return `₿${amount.toFixed(3)}`;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

export default function HistoricalMetricCards({ historicalResults, currentBitcoinPrice, startingYear }: HistoricalMetricCardsProps) {
  if (!historicalResults) return null;

  const currentYear = new Date().getFullYear();
  const yearsAnalyzed = currentYear - startingYear;
  const roi = ((historicalResults.currentTotalValue - historicalResults.totalCostBasis) / historicalResults.totalCostBasis) * 100;
  const totalGainUSD = historicalResults.currentTotalValue - historicalResults.totalCostBasis;
  const gainMultiple = historicalResults.currentTotalValue / historicalResults.totalCostBasis;

  const metricGroups = [
    // Group 1: Core Values (matches the first set of cards from the image)
    [
      {
        value: formatNumber(historicalResults.currentTotalValue),
        label: 'Current Value',
        color: 'orange' as const,
        sublabel: `${formatBTC(historicalResults.totalBitcoinGranted)} total Bitcoin`,
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: formatNumber(historicalResults.totalCostBasis),
        label: 'What You Paid',
        color: 'blue' as const,
        sublabel: `Based on ${historicalResults.summary?.costBasisMethod || 'average'} yearly prices`,
        icon: undefined
      },
      {
        value: formatNumber(Math.max(0, totalGainUSD)),
        label: 'Your Profit',
        color: 'green' as const,
        sublabel: `${roi.toFixed(0)}% gain in ${yearsAnalyzed} years`,
        icon: undefined
      },
    ],
    // Group 2: Performance & Analysis
    [
      {
        value: formatPercent(historicalResults.annualizedReturn),
        label: 'Yearly Growth',
        color: 'purple' as const,
        sublabel: 'Average per year',
        icon: undefined
      },
      {
        value: `${gainMultiple.toFixed(1)}x`,
        label: 'Growth Multiple',
        color: 'blue' as const,
        sublabel: 'Value vs cost',
        icon: undefined
      },
      {
        value: `${roi.toFixed(0)}%`,
        label: 'Return on Investment',
        color: 'green' as const,
        sublabel: 'Total gain',
        icon: undefined
      },
    ],
    // Group 3: Historical Details (matches the second set of cards from the image)
    [
      {
        value: formatBTC(historicalResults.totalBitcoinGranted),
        label: 'Total Bitcoin Given',
        color: 'orange' as const,
        sublabel: 'All awards combined',
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: formatUSD(historicalResults.totalCostBasis),
        label: 'Total Cost',
        color: 'green' as const,
        sublabel: 'What you actually paid',
        icon: undefined
      },
      {
        value: formatUSD(historicalResults.currentTotalValue),
        label: "Today's Value",
        color: 'blue' as const,
        sublabel: 'Worth right now',
        icon: undefined
      },
    ],
    // Group 4: Historical Context
    [
      {
        value: `${startingYear}`,
        label: 'Starting Year',
        color: 'blue' as const,
        sublabel: `${yearsAnalyzed} years analyzed`,
        icon: undefined
      },
      {
        value: formatUSD(totalGainUSD),
        label: 'Total Return',
        color: 'green' as const,
        sublabel: 'Dollar gain',
        icon: undefined
      },
      {
        value: formatBTC(historicalResults.summary.averageAnnualGrant),
        label: 'Average Yearly Bonus',
        color: 'orange' as const,
        sublabel: 'Bitcoin per year',
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
    ],
  ];

  return (
    <div className="w-full mb-6">
      <div className="relative px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {metricGroups.map((group, groupIndex) => (
              <CarouselItem key={groupIndex} className="pl-2 md:pl-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {group.map((metric, index) => (
                    <MetricCard
                      key={index}
                      value={metric.value}
                      label={metric.label}
                      color={metric.color}
                      sublabel={metric.sublabel}
                      icon={metric.icon}
                    />
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        
        {/* Carousel indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {metricGroups.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
