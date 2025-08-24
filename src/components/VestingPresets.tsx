'use client';

import React, { useCallback } from 'react';
import { CustomVestingEvent } from '@/types/vesting';
import { GiftIcon, ShieldCheckIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface VestingPresetsProps {
  schemeId: string;
  selectedPreset: string;
  onPresetSelect: (presetId: string, events: CustomVestingEvent[]) => void;
}

// Define the three preset vesting schedules
export const VESTING_PRESETS = {
  reward: {
    id: 'reward',
    name: 'Reward',
    description: 'Long-term loyalty rewards',
    icon: GiftIcon,
    events: [
      { id: 'reward-1', timePeriod: 60, percentageVested: 50, label: 'Year 5' },
      { id: 'reward-2', timePeriod: 120, percentageVested: 100, label: 'Year 10' },
    ] as CustomVestingEvent[],
  },
  retain: {
    id: 'retain',
    name: 'Retain',
    description: 'Steady, predictable unlocking path',
    icon: ShieldCheckIcon,
    events: [
      { id: 'retain-1', timePeriod: 12, percentageVested: 20, label: 'Year 1' },
      { id: 'retain-2', timePeriod: 24, percentageVested: 40, label: 'Year 2' },
      { id: 'retain-3', timePeriod: 36, percentageVested: 60, label: 'Year 3' },
      { id: 'retain-4', timePeriod: 48, percentageVested: 80, label: 'Year 4' },
      { id: 'retain-5', timePeriod: 60, percentageVested: 100, label: 'Year 5' },
    ] as CustomVestingEvent[],
  },
  recruit: {
    id: 'recruit',
    name: 'Recruit',
    description: 'Fast unlocking to attract new talent',
    icon: UserPlusIcon,
    events: [
      { id: 'recruit-1', timePeriod: 3, percentageVested: 10, label: '90 Days' },
      { id: 'recruit-2', timePeriod: 12, percentageVested: 40, label: 'Year 1' },
      { id: 'recruit-3', timePeriod: 24, percentageVested: 100, label: 'Year 2' },
    ] as CustomVestingEvent[],
  },
};

export default function VestingPresets({
  schemeId,
  selectedPreset,
  onPresetSelect,
}: VestingPresetsProps) {
  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = VESTING_PRESETS[presetId as keyof typeof VESTING_PRESETS];
    if (preset) {
      onPresetSelect(presetId, preset.events);
    }
  }, [onPresetSelect]);

  // Check if dark mode is active
  const isDarkMode = typeof window !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  return (
    <div className="mt-6 p-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-slate-100 mb-4 text-center">
        Choose an Unlocking Schedule
      </h4>
      
      {/* Preset Selection Buttons - Fixed Responsive Layout */}
      <div className="flex flex-row gap-2 mb-4">
        {Object.values(VESTING_PRESETS).map((preset) => {
          const IconComponent = preset.icon;
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`flex-1 min-w-0 flex flex-col items-center px-2 sm:px-3 py-2 rounded-sm border-2 transition-all duration-300 relative group ${
                selectedPreset === preset.id
                  ? 'border-bitcoin shadow-sm bg-white dark:bg-slate-800'
                  : 'border-gray-200 dark:border-slate-600 hover:border-bitcoin hover:shadow-md bg-white dark:bg-slate-800'
              }`}
            style={selectedPreset === preset.id ? {
              backgroundImage: `
                linear-gradient(30deg, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 12%, transparent 12.5%, transparent 87%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 87.5%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'}),
                linear-gradient(150deg, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 12%, transparent 12.5%, transparent 87%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 87.5%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'}),
                linear-gradient(30deg, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 12%, transparent 12.5%, transparent 87%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 87.5%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'}),
                linear-gradient(150deg, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 12%, transparent 12.5%, transparent 87%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'} 87.5%, ${isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.08)'}),
                linear-gradient(60deg, ${isDarkMode ? 'rgba(156, 163, 175, 0.08)' : 'rgba(107, 114, 128, 0.05)'} 25%, transparent 25.5%, transparent 75%, ${isDarkMode ? 'rgba(156, 163, 175, 0.08)' : 'rgba(107, 114, 128, 0.05)'} 75%, ${isDarkMode ? 'rgba(156, 163, 175, 0.08)' : 'rgba(107, 114, 128, 0.05)'}),
                linear-gradient(60deg, ${isDarkMode ? 'rgba(156, 163, 175, 0.08)' : 'rgba(107, 114, 128, 0.05)'} 25%, transparent 25.5%, transparent 75%, ${isDarkMode ? 'rgba(156, 163, 175, 0.08)' : 'rgba(107, 114, 128, 0.05)'} 75%, ${isDarkMode ? 'rgba(156, 163, 175, 0.08)' : 'rgba(107, 114, 128, 0.05)'})
              `,
              backgroundSize: '20px 35px',
              backgroundPosition: '0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px',
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff'
            } : {}}
            >
              <IconComponent className={`w-5 h-5 mb-1 transition-transform duration-300 group-hover:scale-110 ${
                selectedPreset === preset.id 
                  ? 'text-bitcoin scale-110' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
              <span className={`text-xs font-semibold leading-tight text-center ${
                selectedPreset === preset.id 
                  ? 'text-black dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Display Selected Preset Schedule */}
      {selectedPreset && VESTING_PRESETS[selectedPreset as keyof typeof VESTING_PRESETS] && (
        <div className="mt-4">
          <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Unlocking Timeline:
          </h5>
          <div className="space-y-2">
            {VESTING_PRESETS[selectedPreset as keyof typeof VESTING_PRESETS].events.map((event, index) => (
              <div 
                key={event.id} 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-sm py-2 border-b border-purple-200 dark:border-purple-700 last:border-0"
              >
                <span className="text-blue-800 dark:text-blue-300 font-medium">
                  {event.label}
                </span>
                <span className="font-medium text-blue-900 dark:text-blue-200 text-right sm:text-left">
                  +{index === 0 ? event.percentageVested : event.percentageVested - VESTING_PRESETS[selectedPreset as keyof typeof VESTING_PRESETS].events[index - 1].percentageVested}% → {event.percentageVested}% total
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}