'use client';

import React, { useMemo } from 'react';
import { VestingScheme, CustomVestingEvent } from '@/types/vesting';
import { ClockIcon, CheckCircleIcon, RocketLaunchIcon, BuildingOfficeIcon, ChartBarIcon } from '@heroicons/react/24/solid';
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

// Strategy-specific configurations
const STRATEGY_CONFIG = {
  accelerator: {
    name: 'The Pioneer Plan',
    icon: RocketLaunchIcon,
    colors: {
      primary: 'from-orange-500 to-red-500',
      secondary: 'from-orange-100 to-red-100',
      text: 'text-orange-700',
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      border: 'border-orange-200 dark:border-orange-800',
      accent: 'bg-orange-500'
    },
    description: 'Do less work to let your employee earn more'
  },
  'steady-builder': {
    name: 'The Stacker Plan',
    icon: ChartBarIcon,
    colors: {
      primary: 'from-blue-500 to-teal-500',
      secondary: 'from-blue-100 to-teal-100',
      text: 'text-blue-700',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-200 dark:border-blue-800',
      accent: 'bg-blue-500'
    },
    description: 'A balanced approach with steady award accumulation over time'
  },
  'slow-burn': {
    name: 'The Builder Plan',
    icon: BuildingOfficeIcon,
    colors: {
      primary: 'from-green-500 to-emerald-500',
      secondary: 'from-green-100 to-emerald-100',
      text: 'text-green-700',
      bg: 'bg-green-50 dark:bg-green-900/10',
      border: 'border-green-200 dark:border-green-800',
      accent: 'bg-green-500'
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
  
  let rawEvents: { date: Date; percentage: number; label: string }[] = [];
  
  if (customVestingEvents && customVestingEvents.length > 0) {
    // Use custom vesting events
    rawEvents = customVestingEvents.map(event => ({
      date: new Date(startDate.getTime() + (event.timePeriod * 30.44 * 24 * 60 * 60 * 1000)), // Convert months to milliseconds
      percentage: event.percentageVested,
      label: event.label
    }));
  } else {
    // Use default vesting schedule
    rawEvents = scheme.vestingSchedule.map(milestone => ({
      date: new Date(startDate.getTime() + (milestone.months * 30.44 * 24 * 60 * 60 * 1000)),
      percentage: milestone.grantPercent,
      label: milestone.months === 0 ? 'Immediate' : `${Math.round(milestone.months / 12)} years`
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
  
  // Create progress segments based on vesting events
  const createProgressSegments = () => {
    if (vestingEvents.length === 0) return [];
    
    let segments = [];
    let previousPercentage = 0;
    
    for (let i = 0; i < vestingEvents.length; i++) {
      const event = vestingEvents[i];
      const segmentWidth = event.percentage - previousPercentage;
      
      segments.push({
        width: segmentWidth,
        achieved: event.achieved,
        isNext: event.isNext,
        label: event.label,
        percentage: event.percentage
      });
      
      previousPercentage = event.percentage;
    }
    
    return segments;
  };
  
  const progressSegments = createProgressSegments();
  
  return (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl ${strategyConfig.colors.border} ${className}`}>
      {/* Enhanced Header with Strategy Information */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${strategyConfig.colors.secondary} dark:from-slate-700 dark:to-slate-600 mr-3`}>
            <StrategyIcon className={`w-6 h-6 ${strategyConfig.colors.text} dark:text-slate-200`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
              {strategyConfig.name}
              <HelpTooltip content={HELP_CONTENT.unlockingPercent} />
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {strategyConfig.description}
            </p>
          </div>
        </div>

      </div>
      
      {/* Enhanced Progress Visualization */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Unlock Timeline
          </span>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Change Plans and pick an Earning Schedule
          </span>
        </div>
        
        {/* Multi-segment Progress Bar */}
        <div className="relative">
          <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="flex h-full">
              {progressSegments.map((segment, index) => {
                const segmentColor = segment.achieved 
                  ? strategyConfig.colors.accent
                  : segment.isNext 
                  ? `${strategyConfig.colors.accent} opacity-60 animate-pulse`
                  : 'bg-gray-300 dark:bg-slate-600';
                
                return (
                  <div
                    key={index}
                    className={`h-full transition-all duration-500 ${segmentColor}`}
                    style={{ width: `${segment.width}%` }}
                    title={`${segment.label}: ${segment.percentage}% earned`}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Milestone Labels */}
          <div className="relative h-12 mt-2">
            {vestingEvents.map((event, index) => (
              <div 
                key={index}
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${event.percentage}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  event.achieved 
                    ? `${strategyConfig.colors.accent} border-white shadow-md`
                    : event.isNext
                    ? `${strategyConfig.colors.accent} opacity-60 border-white animate-pulse`
                    : 'bg-gray-300 border-gray-400 dark:bg-slate-600 dark:border-slate-500'
                }`}>
                  {event.achieved && (
                    <CheckCircleIcon className="w-2 h-2 text-white absolute -top-0.5 -left-0.5" />
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  event.achieved 
                    ? strategyConfig.colors.text + ' dark:text-slate-200'
                    : 'text-gray-500 dark:text-slate-400'
                }`}>
                  {event.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Unlocking Schedule Overview */}
      <div className={`p-4 ${strategyConfig.colors.bg} rounded-lg mb-4`} style={{border: '1px solid #777f89'}}>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
          <ClockIcon className="w-4 h-4 mr-2" />
          Earning Schedule Overview
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vestingEvents
            // Remove duplicate events with same label and percentage
            .filter((event, index, self) => 
              index === self.findIndex(e => e.label === event.label && e.percentage === event.percentage)
            )
            .map((event, index) => (
              <div key={`${event.label}-${event.percentage}-${index}`} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {event.label}
                </span>
                <div className="flex items-center">
                  {event.achieved && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    event.achieved 
                      ? 'text-green-600 dark:text-green-400'
                      : event.isNext
                      ? strategyConfig.colors.text
                      : 'text-gray-600 dark:text-slate-400'
                  }`} style={{color: '#777f89'}}>
                    {event.percentage}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      
      {/* Completion Message - Enhanced */}
      {currentProgress >= 100 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-full mr-3">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-green-900 dark:text-green-200">
                100% Earned! 🎉
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your employee has earned their full Bitcoin award.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* ARIA announcements for accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {strategyConfig.name}: {currentProgress.toFixed(1)}% earned.
        {nextVestingDate && ` Next earning milestone in ${daysUntilNext} days: ${nextVestingAmount.toFixed(1)}% additional award earned.`}
      </div>
    </div>
  );
}