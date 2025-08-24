'use client';

import { SatoshiIcon } from '@/components/icons';
import HelpTooltip from '@/components/HelpTooltip';
import { HELP_CONTENT } from '@/lib/help-content';
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
  helpContent?: string;
}

interface MetricCardsProps {
  displayScheme: any;
  currentBitcoinPrice: number;
  results: any;
  inputs: any;
}

function MetricCard({ value, label, color, sublabel, icon, helpContent }: MetricCardProps) {
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
    <div className={`relative h-32 rounded-sm border-2 ${colorClasses[color]} p-4 flex flex-col justify-center items-center text-center transition-all duration-200 hover:shadow-md`}>
      {icon && (
        <div className="absolute top-3 right-3 opacity-30">
          {icon}
        </div>
      )}
      <div className={`text-2xl font-bold ${textColorClasses[color]} mb-1`}>
        {value}
      </div>
      <div className={`text-sm font-medium ${textColorClasses[color]} opacity-80 flex items-center justify-center`}>
        {label}
        {helpContent && <HelpTooltip content={helpContent} />}
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
      <div className="w-full my-8 md:my-12">
        <div className="card">
          <div className="text-center text-gray-500 dark:text-slate-400 py-8">
            <div className="text-4xl mb-2">📊</div>
            <div>Loading metrics...</div>
          </div>
        </div>
      </div>
    );
  }

  // Debug log for testing (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`MetricCards Debug - ${displayScheme.name}:`, {
      initialGrant: displayScheme.initialGrant,
      annualGrant: displayScheme.annualGrant,
      schemeId: displayScheme.id
    });
  }

  // Calculate key metrics with safety checks
  const initialGrant = displayScheme.initialGrant || 0;
  const annualGrant = displayScheme.annualGrant || 0;
  const initialValueUSD = initialGrant * currentBitcoinPrice;
  
  // Calculate total BTC granted over time with scheme-specific logic
  let totalBTCGranted = initialGrant;
  if (annualGrant > 0) {
    // CRITICAL FIX: Respect custom vesting events for grant limits
    let maxAnnualYears = 0;
    
    // Get customVestingEvents from displayScheme
    const customVestingEvents = displayScheme.customVestingEvents;
    
    if (customVestingEvents && customVestingEvents.length > 0) {
      // Use custom vesting events to determine grant period
      const lastEventMonth = Math.max(...customVestingEvents.map(e => e.timePeriod));
      maxAnnualYears = Math.floor(lastEventMonth / 12);
      
      // For accelerator scheme, still no annual grants even with custom events
      if (displayScheme.id === 'accelerator') {
        maxAnnualYears = 0;
      }
    } else {
      // Fallback to scheme defaults if no custom vesting events
      switch (displayScheme.id) {
        case 'accelerator':
          maxAnnualYears = 0; // Pioneer scheme has no annual grants
          break;
        case 'steady-builder':
          maxAnnualYears = 5; // Stacker gets annual grants for 5 years
          break;
        case 'slow-burn':
          maxAnnualYears = 9; // Builder gets annual grants for 9 years
          break;
        default:
          maxAnnualYears = displayScheme.maxAnnualGrants || 0;
      }
    }
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

  // Calculate growth multiple using actual results data for accuracy
  let growthMultiple = 0;
  if (results && results.timeline && results.timeline.length > 0) {
    // Get the final timeline point (should be at or near 120 months/10 years)
    const finalPoint = results.timeline[results.timeline.length - 1];
    const finalValue = finalPoint.usdValue || (finalPoint.employerBalance * finalPoint.bitcoinPrice);
    growthMultiple = totalInvestmentCost > 0 ? finalValue / totalInvestmentCost : 0;
  } else {
    // Fallback calculation if results are not available
    growthMultiple = totalInvestmentCost > 0 ? value10Year / totalInvestmentCost : 0;
  }

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
    
    // Use the actual vesting schedule from the selected scheme
    if (displayScheme.vestingSchedule && displayScheme.vestingSchedule.length > 0) {
      let vestingPercent = 0;
      
      // Find the applicable vesting percentage based on months elapsed
      const sortedMilestones = [...displayScheme.vestingSchedule].sort((a, b) => a.months - b.months);
      
      for (const milestone of sortedMilestones) {
        if (months >= milestone.months) {
          vestingPercent = milestone.grantPercent;
        } else {
          break;
        }
      }
      
      return (vestingPercent / 100) * totalBTCGranted;
    }
    
    // Final fallback (should never reach here if scheme is properly configured)
    return 0;
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

  // Get the last two vesting milestones from the actual vesting schedule
  const getVestingMilestones = () => {
    let milestones: { months: number; label: string; percentage: number }[] = [];
    
    if (displayScheme.customVestingEvents && displayScheme.customVestingEvents.length > 0) {
      // Use custom vesting events
      milestones = displayScheme.customVestingEvents
        .filter((e: any) => e.percentageVested > 0)
        .sort((a: any, b: any) => a.timePeriod - b.timePeriod)
        .map((event: any) => ({
          months: event.timePeriod,
          label: event.label,
          percentage: event.percentageVested
        }));
    } else if (displayScheme.vestingSchedule && displayScheme.vestingSchedule.length > 0) {
      // Use default vesting schedule
      milestones = displayScheme.vestingSchedule
        .filter((m: any) => m.grantPercent > 0)
        .sort((a: any, b: any) => a.months - b.months)
        .map((milestone: any) => ({
          months: milestone.months,
          label: milestone.months === 0 ? 'Immediate' : 
                 milestone.months < 12 ? `${milestone.months} months` :
                 `Year ${Math.round(milestone.months / 12)}`,
          percentage: milestone.grantPercent
        }));
    }
    
    // Get the last two milestones
    const lastTwo = milestones.slice(-2);
    
    // Ensure we have at least 2 milestones, pad with defaults if needed
    if (lastTwo.length === 0) {
      lastTwo.push({ months: 60, label: 'Year 5', percentage: 50 });
      lastTwo.push({ months: 120, label: 'Year 10', percentage: 100 });
    } else if (lastTwo.length === 1) {
      lastTwo.unshift({ months: Math.max(0, lastTwo[0].months - 12), label: 'Previous', percentage: lastTwo[0].percentage / 2 });
    }
    
    return lastTwo;
  };
  
  const vestingMilestones = getVestingMilestones();
  const vested5Year = getVestedAtMonth(vestingMilestones[0].months);
  const vested10Year = getVestedAtMonth(vestingMilestones[1].months);

  // Return on investment
  const roi = totalInvestmentCost > 0 ? ((value10Year - totalInvestmentCost) / totalInvestmentCost * 100) : 0;

  const metricGroups = [
    // Group 1: Initial Investment
    [
      {
        value: formatBTC(displayScheme.initialGrant),
        label: 'Starting Bitcoin',
        color: 'orange' as const,
        sublabel: 'Your initial investment',
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: formatUSD(initialValueUSD),
        label: 'Cost Today',
        color: 'green' as const,
        sublabel: "At today's Bitcoin price",
        icon: undefined
      },
      {
        value: formatUSD(totalInvestmentCost),
        label: 'Total You Pay',
        color: 'blue' as const,
        sublabel: 'All awards combined',
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
        label: 'Total Bitcoin',
        color: 'orange' as const,
        sublabel: 'All awards given',
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: `${(growthMultiple || 0).toFixed(1)}x`,
        label: 'Growth Multiple',
        color: 'blue' as const,
        sublabel: 'Value vs. cost',
        icon: undefined,
        helpContent: HELP_CONTENT.growthMultiple
      },
    ],
    // Group 3: Performance Metrics
    [
      {
        value: `${(roi || 0).toFixed(0)}%`,
        label: 'Return on Investment',
        color: 'green' as const,
        sublabel: 'Total gain',
        icon: undefined,
        helpContent: HELP_CONTENT.roi
      },
      {
        value: `${(cagr || 0).toFixed(1)}%`,
        label: 'Yearly Return',
        color: 'purple' as const,
        sublabel: 'Average growth per year',
        icon: undefined,
        helpContent: HELP_CONTENT.cagr
      },
      {
        value: `${(inputs?.projectedBitcoinGrowth ?? 15) || 15}%`,
        label: 'Bitcoin Growth',
        color: 'blue' as const,
        sublabel: 'Your projection',
        icon: undefined
      },
    ],
    // Group 4: Vesting Progress
    [
      {
        value: formatBTC(vested5Year),
        label: `Unlocked by ${vestingMilestones[0].label}`,
        color: 'orange' as const,
        sublabel: `${vestingMilestones[0].percentage}% of total`,
        icon: <SatoshiIcon className="w-6 h-6 text-bitcoin" />
      },
      {
        value: formatBTC(vested10Year),
        label: `Unlocked by ${vestingMilestones[1].label}`,
        color: 'orange' as const,
        sublabel: `${vestingMilestones[1].percentage}% of total`,
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
    <div className="w-full my-8 md:my-12">
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
