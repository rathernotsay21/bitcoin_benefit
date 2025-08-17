'use client';

import React, { useCallback } from 'react';
import { CustomVestingEvent } from '@/types/vesting';

interface VestingPresetsProps {
  schemeId: string;
  selectedPreset: string;
  onPresetSelect: (presetId: string, events: CustomVestingEvent[]) => void;
}

// Define the three preset vesting schedules
const VESTING_PRESETS = {
  recruit: {
    id: 'recruit',
    name: 'Recruit',
    description: 'Front-loaded to attract new hires',
    events: [
      { id: 'recruit-1', timePeriod: 3, percentageVested: 5, label: '90 Days' },
      { id: 'recruit-2', timePeriod: 12, percentageVested: 20, label: 'Year 1' },
      { id: 'recruit-3', timePeriod: 24, percentageVested: 40, label: 'Year 2' },
      { id: 'recruit-4', timePeriod: 36, percentageVested: 60, label: 'Year 3' },
      { id: 'recruit-5', timePeriod: 48, percentageVested: 100, label: 'Year 4' },
    ] as CustomVestingEvent[],
  },
  retain: {
    id: 'retain',
    name: 'Retain',
    description: 'Steady, predictable vesting path',
    events: [
      { id: 'retain-1', timePeriod: 12, percentageVested: 20, label: 'Year 1' },
      { id: 'retain-2', timePeriod: 24, percentageVested: 40, label: 'Year 2' },
      { id: 'retain-3', timePeriod: 36, percentageVested: 60, label: 'Year 3' },
      { id: 'retain-4', timePeriod: 48, percentageVested: 80, label: 'Year 4' },
      { id: 'retain-5', timePeriod: 60, percentageVested: 100, label: 'Year 5' },
    ] as CustomVestingEvent[],
  },
  reward: {
    id: 'reward',
    name: 'Reward',
    description: 'Long-term stakeholder focused',
    events: [
      { id: 'reward-1', timePeriod: 60, percentageVested: 50, label: 'Year 5' },
      { id: 'reward-2', timePeriod: 120, percentageVested: 100, label: 'Year 10' },
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

  return (
    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
      <h4 className="text-md font-semibold text-gray-900 dark:text-slate-100 mb-4">
        Vesting Schedule
      </h4>
      
      {/* Preset Selection Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Object.values(VESTING_PRESETS).map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset.id)}
            className={`px-3 py-2 rounded-lg border-2 transition-all duration-300 text-center ${
              selectedPreset === preset.id
                ? 'border-bitcoin bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 shadow-lg'
                : 'border-gray-200 dark:border-slate-600 hover:border-bitcoin hover:shadow-md bg-white dark:bg-slate-800'
            }`}
          >
            <div className="font-bold text-base text-gray-900 dark:text-slate-100">
              {preset.name}
            </div>
          </button>
        ))}
      </div>

      {/* Display Selected Preset Schedule */}
      {selectedPreset && VESTING_PRESETS[selectedPreset as keyof typeof VESTING_PRESETS] && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Vesting Timeline:
          </h5>
          <div className="space-y-2">
            {VESTING_PRESETS[selectedPreset as keyof typeof VESTING_PRESETS].events.map((event, index) => (
              <div 
                key={event.id} 
                className="flex justify-between items-center text-sm py-2 border-b border-blue-100 dark:border-blue-800 last:border-0"
              >
                <span className="text-blue-800 dark:text-blue-300">
                  {event.label}
                </span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {index === 0 ? event.percentageVested : event.percentageVested - VESTING_PRESETS[selectedPreset as keyof typeof VESTING_PRESETS].events[index - 1].percentageVested}% vested
                  <span className="text-xs ml-2 text-blue-600 dark:text-blue-400">
                    (cumulative: {event.percentageVested}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}