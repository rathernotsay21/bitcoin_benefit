'use client';

import React, { useMemo } from 'react';
import { VestingScheme, CustomVestingEvent } from '@/types/vesting';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { BitcoinIcon, SatoshiIcon, MiningOutlineIcon } from '@/components/icons';
import HelpTooltip from '@/components/HelpTooltip';
import { HELP_CONTENT } from '@/lib/help-content';

interface VestingProgressProps {
  scheme: VestingScheme;
  currentDate?: Date;
  customVestingEvents?: CustomVestingEvent[];
  className?: string;
}

interface VestingProgressData {
  currentProgress: number;
  nextVestingDate: Date | null;
  nextVestingAmount: number;
  daysUntilNext: number;
  vestingEvents: {
    date: Date;
    percentage: number;
    achieved: boolean;
    isNext: boolean;
    label: string;
  }[];
}

// Helper function to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

// Generate color gradations for each plan
function generateColorGradations(baseColor: string): Array<{ bg: string, text: string, border: string, label: string }> {
  const colors = [];
  
  // First period uses the base color (same as plan selector button)
  colors.push({ bg: baseColor, text: baseColor, border: baseColor, label: 'Base' });
  
  // Generate 5 additional gradations (darker/lighter variants)
  for (let i = 1; i < 6; i++) {
    // Alternate between darker and lighter shades
    const adjustment = i % 2 === 1 ? -(i * 8) : (i * 6);
    const adjustedColor = adjustBrightness(baseColor, adjustment);
    colors.push({ 
      bg: adjustedColor, 
      text: adjustedColor, 
      border: adjustedColor, 
      label: `Variant ${i}` 
    });
  }
  
  return colors;
}

// Period color palettes for each strategy - based on plan selector button colors
const PERIOD_COLORS = {
  accelerator: {
    // Bitcoin orange base (#f7931b) with gradations
    colors: generateColorGradations('#f7931b')
  },
  'steady-builder': {
    // Green base (#10b981) with gradations - using Tailwind's green-500
    colors: generateColorGradations('#10b981')
  },
  'slow-burn': {
    // Blue base (#3b82f6) with gradations - using Tailwind's blue-500
    colors: generateColorGradations('#3b82f6')
  }
};

// Strategy-specific configurations
const STRATEGY_CONFIG = {
  accelerator: {
    name: 'The Pioneer Plan',
    icon: BitcoinIcon,
    colors: {
      primary: 'from-orange-500 to-red-500',
      secondary: 'from-orange-100 to-red-100',
      text: 'text-bitcoin-700',
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      border: 'border-bitcoin-200 dark:border-bitcoin-800',
      accent: 'bg-bitcoin-500',
      iconBg: 'bg-[#fcf3e8] dark:bg-slate-800',
      iconColor: 'text-[#f7931b]'
    },
    description: 'Numbers don\'t lie, but they don\'t tell the whole story either. This shows what\'s possible, not what\'s promised.'
  },
  'steady-builder': {
    name: 'The Stacker Plan',
    icon: SatoshiIcon,
    colors: {
      primary: 'from-green-500 to-emerald-500',
      secondary: 'from-green-100 to-emerald-100',
      text: 'text-green-700',
      bg: 'bg-green-50 dark:bg-green-900/10',
      border: 'border-green-200 dark:border-green-800',
      accent: 'bg-green-500',
      iconBg: 'bg-[#e8f5e8] dark:bg-slate-800',
      iconColor: 'text-green-600'
    },
    description: 'A balanced approach with steady award accumulation over time'
  },
  'slow-burn': {
    name: 'The Builder Plan',
    icon: MiningOutlineIcon,
    colors: {
      primary: 'from-blue-500 to-teal-500',
      secondary: 'from-blue-100 to-teal-100',
      text: 'text-blue-700',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-200 dark:border-blue-800',
      accent: 'bg-blue-500',
      iconBg: 'bg-[#e8f3fc] dark:bg-slate-800',
      iconColor: 'text-blue-600'
    },
    description: 'A gradual approach that spreads awards over many years'
  }
};

function calculateVestingProgress(
  scheme: VestingScheme,
  currentDate: Date,
  customVestingEvents?: CustomVestingEvent[]
): VestingProgressData {
  const startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // Assume started Jan 1 of previous year for demo
  
  let rawEvents: { date: Date; percentage: number; label: string; fullLabel?: string }[] = [];
  
  if (customVestingEvents && customVestingEvents.length > 0) {
    // Use custom vesting events
    rawEvents = customVestingEvents.map(event => ({
      date: new Date(startDate.getTime() + (event.timePeriod * 30.44 * 24 * 60 * 60 * 1000)), // Convert months to milliseconds
      percentage: event.percentageVested,
      label: event.label.replace(/Year\s*/i, '').trim(), // Remove "Year" for timeline display
      fullLabel: event.label // Keep full label for overview
    }));
  } else {
    // Use default vesting schedule
    rawEvents = scheme.vestingSchedule.map(milestone => ({
      date: new Date(startDate.getTime() + (milestone.months * 30.44 * 24 * 60 * 60 * 1000)),
      percentage: milestone.grantPercent,
      label: milestone.months === 0 ? 'Immediate' : `${Math.round(milestone.months / 12)}`,
      fullLabel: milestone.months === 0 ? 'Immediate' : `${Math.round(milestone.months / 12)} years`
    }));
  }
  
  // Sort by date and filter out 0% events
  const sortedEvents = rawEvents
    .filter(event => event.percentage > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Find current progress
  let currentProgress = 0;
  let nextVestingDate: Date | null = null;
  let nextVestingAmount = 0;
  
  for (const event of sortedEvents) {
    if (event.date <= currentDate) {
      currentProgress = event.percentage;
    } else {
      nextVestingDate = event.date;
      nextVestingAmount = event.percentage - currentProgress;
      break;
    }
  }
  
  const daysUntilNext = nextVestingDate 
    ? Math.ceil((nextVestingDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000))
    : 0;
  
  // Create vesting events with achievement status
  const vestingEvents = sortedEvents.map(event => ({
    ...event,
    achieved: event.date <= currentDate,
    isNext: nextVestingDate ? event.date.getTime() === nextVestingDate.getTime() : false
  }));
  
  return {
    currentProgress,
    nextVestingDate,
    nextVestingAmount,
    daysUntilNext,
    vestingEvents
  };
}

export default function VestingProgress({
  scheme,
  currentDate = new Date(),
  customVestingEvents,
  className = ''
}: VestingProgressProps) {
  const progressData = useMemo(
    () => calculateVestingProgress(scheme, currentDate, customVestingEvents),
    [scheme, currentDate, customVestingEvents]
  );
  
  const { currentProgress, nextVestingDate, nextVestingAmount, daysUntilNext, vestingEvents } = progressData;
  const strategyConfig = STRATEGY_CONFIG[scheme.id as keyof typeof STRATEGY_CONFIG] || STRATEGY_CONFIG['steady-builder'];
  const StrategyIcon = strategyConfig.icon;
  
  // Get color palette for current strategy
  const strategyKey = scheme.id as keyof typeof PERIOD_COLORS;
  const colorPalette = PERIOD_COLORS[strategyKey] || PERIOD_COLORS['steady-builder'];
  
  // Create progress segments based on vesting events with unique colors
  const createProgressSegments = () => {
    if (vestingEvents.length === 0) return [];
    
    let segments = [];
    let previousPercentage = 0;
    
    for (let i = 0; i < vestingEvents.length; i++) {
      const event = vestingEvents[i];
      const segmentWidth = event.percentage - previousPercentage;
      const colorIndex = i % colorPalette.colors.length;
      const periodColor = colorPalette.colors[colorIndex];
      
      segments.push({
        width: segmentWidth,
        achieved: event.achieved,
        isNext: event.isNext,
        label: event.label,
        percentage: event.percentage,
        color: periodColor,
        index: i
      });
      
      previousPercentage = event.percentage;
    }
    
    return segments;
  };
  
  const progressSegments = createProgressSegments();
  
  return (
    <div 
      className={`p-4 bg-white dark:bg-slate-800 rounded-sm border-2 shadow-sm transition-all duration-300 hover:shadow-md border-bitcoin dark:border-0 ${className}`}
    >
      {/* Enhanced Header with Strategy Information */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="mr-3">
            <StrategyIcon className={`w-10 h-10 ${strategyConfig.colors.iconColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-slate-100 flex items-center">
              {strategyConfig.name}
              <HelpTooltip content={HELP_CONTENT.unlockingPercent} />
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 dark:text-slate-400">
              {strategyConfig.description}
            </p>
          </div>
        </div>

      </div>
      
      {/* Unlocking Schedule Overview */}
      <div className={`p-3 ${strategyConfig.colors.bg} rounded-sm`} style={{border: '1px solid #777f89'}}>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white dark:text-slate-100 mb-2 flex items-center">
          <ClockIcon className="w-4 h-4 mr-2" />
          Unlocking Schedule Overview
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {vestingEvents
            // Remove duplicate events with same label and percentage
            .filter((event, index, self) => 
              index === self.findIndex(e => e.label === event.label && e.percentage === event.percentage)
            )
            .map((event, eventIndex) => {
              // Find the matching color from the segments
              const matchingSegment = progressSegments.find(
                seg => seg.label === event.label && seg.percentage === event.percentage
              );
              const colorIndex = matchingSegment?.index ?? eventIndex;
              const periodColor = colorPalette.colors[colorIndex % colorPalette.colors.length];
              
              // Improved color contrast settings
              let backgroundColor = periodColor.bg;
              let textColor = '#ffffff';
              let borderStyle = `2px solid ${periodColor.border}`;
              let boxShadow = 'none';
              
              if (event.achieved) {
                // Full color with white text for achieved milestones
                backgroundColor = periodColor.bg;
                textColor = '#ffffff';
                boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              } else if (event.isNext) {
                // Next milestone: medium opacity with white text
                backgroundColor = `${periodColor.bg}cc`; // 80% opacity via hex
                textColor = '#ffffff';
                borderStyle = `2px solid ${periodColor.bg}`;
              } else {
                // Future milestones: very light background with appropriate text color
                backgroundColor = `${periodColor.bg}1a`; // 10% opacity via hex for light mode
                // Use dark color for text in light mode, lighter text in dark mode
                textColor = '#1f2937'; // Dark gray for better contrast
                borderStyle = `1px solid ${periodColor.bg}4d`; // 30% opacity border
              }
              
              // Calculate incremental percentage for this event
              const previousEvent = eventIndex > 0 ? vestingEvents[eventIndex - 1] : null;
              const incrementalPercentage = previousEvent 
                ? event.percentage - previousEvent.percentage 
                : event.percentage;
              
              return (
                <div 
                  key={`${event.label}-${event.percentage}-${eventIndex}`} 
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md ${
                    !event.achieved && !event.isNext ? 'dark:bg-slate-800/50' : ''
                  }`}
                  style={{
                    backgroundColor: backgroundColor,
                    border: borderStyle,
                    boxShadow: boxShadow,
                    transform: event.achieved ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <span 
                    className={`text-sm font-semibold ${
                      !event.achieved && !event.isNext ? 'dark:text-slate-300' : ''
                    }`}
                    style={{ color: event.achieved || event.isNext ? textColor : undefined }}
                  >
                    {(event as any).fullLabel || event.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`text-xs ${
                        !event.achieved && !event.isNext ? 'dark:text-slate-400' : ''
                      }`}
                      style={{ color: event.achieved || event.isNext ? textColor : undefined, opacity: 0.8 }}
                    >
                      +{incrementalPercentage}%
                    </span>
                    <span 
                      className={`text-xs ${
                        !event.achieved && !event.isNext ? 'dark:text-slate-400' : ''
                      }`}
                      style={{ color: event.achieved || event.isNext ? textColor : undefined, opacity: 0.7 }}
                    >
                      →
                    </span>
                    <span 
                      className={`text-sm font-bold ${
                        !event.achieved && !event.isNext ? 'dark:text-slate-300' : ''
                      }`}
                      style={{ color: event.achieved || event.isNext ? textColor : undefined }}
                    >
                      {event.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      
      {/* Completion Message - Enhanced */}
      {currentProgress >= 100 && (
        <div className="p-3 mt-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-sm border-2 border-green-200 dark:border-green-700">
          <div className="flex items-center">
            <div className="p-1.5 bg-green-500 rounded-full mr-2">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-800 dark:text-green-200 font-semibold text-sm">Fully Unlocked!</p>
              <p className="text-xs text-green-600 dark:text-green-300">All awards have been unlocked.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}