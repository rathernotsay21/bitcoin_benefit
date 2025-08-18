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

interface MetricCardsProps {
  displayScheme: any;
  currentBitcoinPrice: number;
  results: any;
  inputs: any;
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
  if (!amount || isNaN(amount)) return '₿0.000';
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

function formatNumber(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

export default function MetricCards({ displayScheme, currentBitcoinPrice, results, inputs }: MetricCardsProps) {
  // Defensive checks
  if (!displayScheme || typeof currentBitcoinPrice !== 'number' || currentBitcoinPrice <= 0 || !inputs) {
    return (
      <div className="w-full mb-6">
        <div className="card">
          <div className="text-center text-gray-500 dark:text-slate-400 py-8">
            <div className="text-4xl mb-2">📊</div>
            <div>Loading metrics...</div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate key metrics with safety checks
  const initialGrant = displayScheme.initialGrant || 0;
  const annualGrant = displayScheme.annualGrant || 0;
  const initialValueUSD = initialGrant * currentBitcoinPrice;
  
  // Calculate total BTC granted over time
  let totalBTCGranted = initialGrant;
  if (annualGrant > 0) {
    // Use the scheme's maxAnnualGrants if available, otherwise default values
    const maxAnnualYears = displayScheme.maxAnnualGrants || (displayScheme.id === 'steady-builder' ? 5 : 0);
    totalBTCGranted += annualGrant * maxAnnualYears;
  }

  // Calculate total investment cost (employer's perspective)
  const totalInvestmentCost = totalBTCGranted * currentBitcoinPrice;

  // Calculate 10-year projection with safety checks
  const projectedGrowthRate = Math.max(0, ((inputs?.projectedBitcoinGrowth ?? 15) || 15) / 100);
  const projectedPrice10Year = currentBitcoinPrice * Math.pow(1 + projectedGrowthRate, 10);
  const value10Year = results && results.timeline && results.timeline.length > 120 
    ? (results.timeline[120]?.employerBalance || 0) * (results.timeline[120]?.bitcoinPrice || currentBitcoinPrice)
    : totalBTCGranted * projectedPrice10Year;

  // Calculate growth multiple
  const growthMultiple = totalInvestmentCost > 0 ? value10Year / totalInvestmentCost : 0;

  // Calculate effective annual return (CAGR)
  const cagr = growthMultiple > 0 ? (Math.pow(growthMultiple, 1/10) - 1) * 100 : 0;

  // Calculate vested amounts based on custom vesting schedule or defaults
  const calculateVestedAmount = (months: number): number => {
    // Use custom vesting events if available
    const customEvents = displayScheme.customVestingEvents;
    if (customEvents && Array.isArray(customEvents) && customEvents.length > 0) {
      // Find all events that have occurred by this time (timePeriod <= months)
      const applicableEvents = customEvents.filter((e: any) => 
        e && typeof e.timePeriod === 'number' && e.timePeriod <= months
      );
      
      if (applicableEvents.length > 0) {
        // Get the highest vesting percentage from applicable events
        const maxVestingPercent = Math.max(...applicableEvents.map((e: any) => e.percentageVested || 0));
        return Math.max(0, (maxVestingPercent / 100) * totalBTCGranted);
      }
    }
    
    // Default fallback: Use the default "Recruit" preset as it's the most common
    // Recruit: 5% at 3 months, 20% at 1 year, 40% at 2 years, 60% at 3 years, 100% at 4 years
    let vestingPercent = 0;
    if (months >= 48) { // 4 years - 100% vested
      vestingPercent = 100;
    } else if (months >= 36) { // 3 years - 60% vested
      vestingPercent = 60;
    } else if (months >= 24) { // 2 years - 40% vested
      vestingPercent = 40;
    } else if (months >= 12) { // 1 year - 20% vested
      vestingPercent = 20;
    } else if (months >= 3) { // 3 months - 5% vested
      vestingPercent = 5;
    }
    
    return (vestingPercent / 100) * totalBTCGranted;
  };

  // Get vested amount at different milestones with safety checks
  const getVestedAtMonth = (months: number): number => {
    // First try to get from results timeline if available and reliable
    if (results && results.timeline && results.timeline.length > months) {
      const timelineEntry = results.timeline[months];
      const vestedBalance = timelineEntry?.vestedBalance || 0;
      // Only use timeline result if it's non-zero or if we're at month 0
      if (vestedBalance > 0 || months === 0) {
        return vestedBalance;
      }
    }
    
    // Use our calculation method
    return calculateVestedAmount(months);
  };

  const vested5Year = getVestedAtMonth(60);
  const vested10Year = getVestedAtMonth(120);

  // Return on investment
  const roi = totalInvestmentCost > 0 ? ((value10Year - totalInvestmentCost) / totalInvestmentCost * 100) : 0;

  const metricGroups = [
    // Group 1: Initial Investment
    [
      {
        value: formatBTC(displayScheme.initialGrant),
        label: 'Initial Grant',
        color: 'orange' as const,
        sublabel: 'Employer grants only',
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: formatUSD(initialValueUSD),
        label: 'Initial USD Value',
        color: 'green' as const,
        sublabel: 'At current BTC price',
        icon: undefined
      },
      {
        value: formatUSD(totalInvestmentCost),
        label: 'Total Invested',
        color: 'blue' as const,
        sublabel: 'At current BTC price',
        icon: undefined
      },
    ],
    // Group 2: Future Projections
    [
      {
        value: formatUSD(value10Year),
        label: '10-Year Projection',
        color: 'green' as const,
        sublabel: `Based on ${(inputs?.projectedBitcoinGrowth ?? 15) || 15}% annual growth`,
        icon: undefined
      },
      {
        value: formatBTC(totalBTCGranted),
        label: 'Total BTC Grants',
        color: 'orange' as const,
        sublabel: 'Employer grants only',
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: `${(growthMultiple || 0).toFixed(1)}x`,
        label: 'Growth Multiple',
        color: 'blue' as const,
        sublabel: 'From total cost invested',
        icon: undefined
      },
    ],
    // Group 3: Performance Metrics
    [
      {
        value: `${(roi || 0).toFixed(0)}%`,
        label: 'Return on Investment',
        color: 'green' as const,
        sublabel: 'Total gain',
        icon: undefined
      },
      {
        value: `${(cagr || 0).toFixed(1)}%`,
        label: 'Annualized Return',
        color: 'purple' as const,
        sublabel: 'CAGR over 10 years',
        icon: undefined
      },
      {
        value: `${(inputs?.projectedBitcoinGrowth ?? 15) || 15}%`,
        label: 'BTC Growth Rate',
        color: 'blue' as const,
        sublabel: 'Annual projection',
        icon: undefined
      },
    ],
    // Group 4: Vesting Progress
    [
      {
        value: formatBTC(vested5Year),
        label: 'Vested at 5 Years',
        color: 'orange' as const,
        sublabel: `${totalBTCGranted > 0 ? ((vested5Year / totalBTCGranted) * 100).toFixed(0) : '0'}% of total`,
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: formatBTC(vested10Year),
        label: 'Vested at 10 Years',
        color: 'orange' as const,
        sublabel: `${totalBTCGranted > 0 ? ((vested10Year / totalBTCGranted) * 100).toFixed(0) : '0'}% of total`,
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: `$${formatNumber(projectedPrice10Year)}`,
        label: 'BTC Price in 10Y',
        color: 'green' as const,
        sublabel: 'Projected value',
        icon: undefined
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
