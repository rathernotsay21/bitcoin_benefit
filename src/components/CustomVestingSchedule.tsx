'use client';

import React, { useState, useCallback } from 'react';
import { CustomVestingEvent } from '@/types/vesting';
import { PlusIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface CustomVestingScheduleProps {
  schemeId: string;
  customVestingEvents: CustomVestingEvent[];
  onAddEvent: (event: CustomVestingEvent) => void;
  onRemoveEvent: (eventId: string) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CustomVestingEvent>) => void;
}

// Predefined time period options
const TIME_PERIOD_OPTIONS = [
  { value: 3, label: '90 days', months: 3 }, // 3 months = ~90 days
  { value: 6, label: '6 months', months: 6 },
  { value: 12, label: '1 year', months: 12 },
  { value: 24, label: '2 years', months: 24 },
  { value: 36, label: '3 years', months: 36 },
  { value: 48, label: '4 years', months: 48 },
  { value: 60, label: '5 years', months: 60 },
  { value: 72, label: '6 years', months: 72 },
  { value: 84, label: '7 years', months: 84 },
  { value: 96, label: '8 years', months: 96 },
  { value: 108, label: '9 years', months: 108 },
  { value: 120, label: '10 years', months: 120 },
];

export default function CustomVestingSchedule({
  schemeId,
  customVestingEvents = [],
  onAddEvent,
  onRemoveEvent,
  onUpdateEvent,
}: CustomVestingScheduleProps) {
  const [showCustomSchedule, setShowCustomSchedule] = useState(customVestingEvents.length > 0);
  const [newEventPeriod, setNewEventPeriod] = useState<number>(12);
  const [newEventPercentage, setNewEventPercentage] = useState<number>(25);

  // Calculate total vested percentage
  const getTotalVested = useCallback(() => {
    if (customVestingEvents.length === 0) return 0;
    // Find the maximum cumulative percentage
    return Math.max(...customVestingEvents.map(e => e.percentageVested), 0);
  }, [customVestingEvents]);

  // Validate if percentage can be added
  const canAddPercentage = useCallback((percentage: number, excludeEventId?: string) => {
    const events = excludeEventId 
      ? customVestingEvents.filter(e => e.id !== excludeEventId)
      : customVestingEvents;
    
    const maxExisting = events.length > 0 
      ? Math.max(...events.map(e => e.percentageVested))
      : 0;
    
    return percentage > maxExisting && percentage <= 100;
  }, [customVestingEvents]);

  // Sort events by time period
  const sortedEvents = [...customVestingEvents].sort((a, b) => a.timePeriod - b.timePeriod);

  const handleAddEvent = useCallback(() => {
    if (!canAddPercentage(newEventPercentage)) {
      alert('Percentage must be higher than previous vesting events and not exceed 100%');
      return;
    }

    const periodOption = TIME_PERIOD_OPTIONS.find(opt => opt.value === newEventPeriod);
    const newEvent: CustomVestingEvent = {
      id: `event-${Date.now()}`,
      timePeriod: newEventPeriod,
      percentageVested: newEventPercentage,
      label: periodOption?.label || `${newEventPeriod} months`,
    };

    onAddEvent(newEvent);
    
    // Reset to next suggested values
    setNewEventPercentage(Math.min(newEventPercentage + 25, 100));
    if (newEventPeriod < 120) {
      const nextPeriodIndex = TIME_PERIOD_OPTIONS.findIndex(opt => opt.value > newEventPeriod);
      if (nextPeriodIndex !== -1) {
        setNewEventPeriod(TIME_PERIOD_OPTIONS[nextPeriodIndex].value);
      }
    }
  }, [newEventPeriod, newEventPercentage, canAddPercentage, onAddEvent]);

  const handlePercentageChange = useCallback((eventId: string, newPercentage: number) => {
    if (newPercentage > 0 && newPercentage <= 100) {
      onUpdateEvent(eventId, { percentageVested: newPercentage });
    }
  }, [onUpdateEvent]);

  const handlePeriodChange = useCallback((eventId: string, newPeriod: number) => {
    const periodOption = TIME_PERIOD_OPTIONS.find(opt => opt.value === newPeriod);
    onUpdateEvent(eventId, { 
      timePeriod: newPeriod,
      label: periodOption?.label || `${newPeriod} months`
    });
  }, [onUpdateEvent]);

  const toggleCustomSchedule = useCallback(() => {
    if (showCustomSchedule && customVestingEvents.length > 0) {
      // Clear all custom events when disabling
      customVestingEvents.forEach(event => onRemoveEvent(event.id));
    }
    setShowCustomSchedule(!showCustomSchedule);
  }, [showCustomSchedule, customVestingEvents, onRemoveEvent]);

  const totalVested = getTotalVested();

  return (
    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-slate-100">
          Custom Vesting Schedule
        </h4>
        <button
          onClick={toggleCustomSchedule}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            showCustomSchedule
              ? 'bg-bitcoin text-white hover:bg-orange-600'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
          }`}
        >
          {showCustomSchedule ? 'Use Default' : 'Customize'}
        </button>
      </div>

      {showCustomSchedule && (
        <div className="space-y-4">
          {/* Total vested indicator */}
          {totalVested > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Total Vested
                </span>
                <span className={`text-lg font-bold ${
                  totalVested === 100 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {totalVested}%
                </span>
              </div>
              {totalVested !== 100 && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                  Add more events to reach 100% vesting
                </p>
              )}
            </div>
          )}

          {/* Existing vesting events */}
          {sortedEvents.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Vesting Events
              </label>
              {sortedEvents.map((event, index) => (
                <div key={event.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-xs text-gray-500 dark:text-slate-400 w-6">
                    #{index + 1}
                  </span>
                  
                  <select
                    value={event.timePeriod}
                    onChange={(e) => handlePeriodChange(event.id, parseFloat(e.target.value))}
                    className="flex-1 text-sm input-field py-1"
                  >
                    {TIME_PERIOD_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={event.percentageVested}
                      onChange={(e) => handlePercentageChange(event.id, parseFloat(e.target.value))}
                      className="w-16 text-sm input-field py-1 text-center"
                    />
                    <span className="text-sm text-gray-600 dark:text-slate-400">%</span>
                  </div>

                  <button
                    onClick={() => onRemoveEvent(event.id)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove vesting event"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new vesting event */}
          {totalVested < 100 && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Add Vesting Event
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={newEventPeriod}
                  onChange={(e) => setNewEventPeriod(parseFloat(e.target.value))}
                  className="flex-1 text-sm input-field py-1"
                >
                  {TIME_PERIOD_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newEventPercentage}
                    onChange={(e) => setNewEventPercentage(parseFloat(e.target.value))}
                    className="w-16 text-sm input-field py-1 text-center"
                    placeholder="%"
                  />
                  <span className="text-sm text-gray-600 dark:text-slate-400">%</span>
                </div>

                <button
                  onClick={handleAddEvent}
                  className="p-1 bg-bitcoin text-white rounded hover:bg-orange-600 transition-colors"
                  title="Add vesting event"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Example presets */}
          {customVestingEvents.length === 0 && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Quick Start Examples:
              </p>
              <div className="space-y-2 text-xs text-gray-600 dark:text-slate-400">
                <button
                  onClick={() => {
                    // 90-day cliff vest example
                    onAddEvent({
                      id: `event-${Date.now()}`,
                      timePeriod: 3,
                      percentageVested: 10,
                      label: '90 days',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 1}`,
                      timePeriod: 12,
                      percentageVested: 30,
                      label: '1 year',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 2}`,
                      timePeriod: 24,
                      percentageVested: 50,
                      label: '2 years',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 3}`,
                      timePeriod: 36,
                      percentageVested: 75,
                      label: '3 years',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 4}`,
                      timePeriod: 48,
                      percentageVested: 100,
                      label: '4 years',
                    });
                  }}
                  className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  <strong>90-Day Cliff + Annual:</strong> 10% at 90 days, then 30%/50%/75%/100% yearly
                </button>
                
                <button
                  onClick={() => {
                    // Equal annual vesting
                    onAddEvent({
                      id: `event-${Date.now()}`,
                      timePeriod: 12,
                      percentageVested: 25,
                      label: '1 year',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 1}`,
                      timePeriod: 24,
                      percentageVested: 50,
                      label: '2 years',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 2}`,
                      timePeriod: 36,
                      percentageVested: 75,
                      label: '3 years',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 3}`,
                      timePeriod: 48,
                      percentageVested: 100,
                      label: '4 years',
                    });
                  }}
                  className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  <strong>Equal Annual:</strong> 25% each year for 4 years
                </button>

                <button
                  onClick={() => {
                    // Traditional 5/10 year vesting
                    onAddEvent({
                      id: `event-${Date.now()}`,
                      timePeriod: 60,
                      percentageVested: 50,
                      label: '5 years',
                    });
                    onAddEvent({
                      id: `event-${Date.now() + 1}`,
                      timePeriod: 120,
                      percentageVested: 100,
                      label: '10 years',
                    });
                  }}
                  className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  <strong>Traditional:</strong> 50% at 5 years, 100% at 10 years
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
