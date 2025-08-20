'use client';

import React, { useState, useCallback } from 'react';
import { CustomVestingEvent } from '@/types/vesting';
import { PlusIcon, TrashIcon, ExclamationTriangleIcon, CogIcon } from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import HelpTooltip from '@/components/HelpTooltip';
import { HELP_CONTENT } from '@/lib/help-content';

interface CustomVestingScheduleProps {
  schemeId: string;
  customVestingEvents: CustomVestingEvent[];
  onAddEvent: (event: CustomVestingEvent) => void;
  onRemoveEvent: (eventId: string) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CustomVestingEvent>) => void;
  triggerClassName?: string;
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
  triggerClassName = '',
}: CustomVestingScheduleProps) {
  const [open, setOpen] = useState(false);
  const [newEventPeriod, setNewEventPeriod] = useState<number>(12);
  const [newEventPercentage, setNewEventPercentage] = useState<number>(25);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    setHasUnsavedChanges(true);
    
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
      setHasUnsavedChanges(true);
    }
  }, [onUpdateEvent]);

  const handlePeriodChange = useCallback((eventId: string, newPeriod: number) => {
    const periodOption = TIME_PERIOD_OPTIONS.find(opt => opt.value === newPeriod);
    onUpdateEvent(eventId, { 
      timePeriod: newPeriod,
      label: periodOption?.label || `${newPeriod} months`
    });
    setHasUnsavedChanges(true);
  }, [onUpdateEvent]);

  const handleRemoveEvent = useCallback((eventId: string) => {
    onRemoveEvent(eventId);
    setHasUnsavedChanges(true);
  }, [onRemoveEvent]);

  const handleSave = useCallback(() => {
    setHasUnsavedChanges(false);
    setOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const shouldDiscard = confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!shouldDiscard) return;
    }
    setHasUnsavedChanges(false);
    setOpen(false);
  }, [hasUnsavedChanges]);

  const totalVested = getTotalVested();
  const isValidSchedule = totalVested === 100 || customVestingEvents.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center space-x-2 ${triggerClassName}`}
        >
          <CogIcon className="w-4 h-4" />
          <span>Custom Earning Schedule</span>
          {customVestingEvents.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-bitcoin text-white text-xs rounded-full">
              {customVestingEvents.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CogIcon className="w-5 h-5 text-bitcoin" />
            <span>Custom Earning Schedule</span>
            <HelpTooltip content={HELP_CONTENT.vestingSchedule} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total vested indicator */}
          {totalVested > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200 flex items-center">
                  Total Earned
                  <HelpTooltip content={HELP_CONTENT.vestingPercent} />
                </span>
                <span className={`text-xl font-bold ${
                  totalVested === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {totalVested}%
                </span>
              </div>
              {totalVested !== 100 && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Add more milestones to reach 100% earned
                </p>
              )}
            </div>
          )}

          {/* Existing vesting events */}
          {sortedEvents.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center">
                Earning Milestones
                <HelpTooltip content={HELP_CONTENT.gradualVesting} />
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sortedEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="text-xs text-gray-500 dark:text-slate-400 w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 rounded-full font-medium">
                      {index + 1}
                    </span>
                    
                    <select
                      value={event.timePeriod}
                      onChange={(e) => handlePeriodChange(event.id, parseFloat(e.target.value))}
                      className="flex-1 text-sm input-field py-2"
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
                        className="w-16 text-sm input-field py-2 text-center"
                      />
                      <span className="text-sm text-gray-600 dark:text-slate-400">%</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEvent(event.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2"
                      title="Remove earning milestone"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new vesting event */}
          {totalVested < 100 && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                Add Earning Milestone
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={newEventPeriod}
                  onChange={(e) => setNewEventPeriod(parseFloat(e.target.value))}
                  className="flex-1 text-sm input-field py-2"
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
                    className="w-16 text-sm input-field py-2 text-center"
                    placeholder="%"
                  />
                  <span className="text-sm text-gray-600 dark:text-slate-400">%</span>
                </div>

                <Button
                  onClick={handleAddEvent}
                  disabled={!canAddPercentage(newEventPercentage)}
                  className="bg-bitcoin hover:bg-orange-600 text-white px-3 py-2"
                  title="Add earning milestone"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {!canAddPercentage(newEventPercentage) && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Percentage must be higher than previous milestones and not exceed 100%
                </p>
              )}
            </div>
          )}

          {/* Example presets */}
          {customVestingEvents.length === 0 && (
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center">
                Quick Start Examples
                <HelpTooltip content="Common earning schedules you can use as starting points" />
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const baseTime = Date.now();
                    // 90-day cliff vest example
                    onAddEvent({
                      id: `event-${baseTime}`,
                      timePeriod: 3,
                      percentageVested: 10,
                      label: '90 days',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 1}`,
                      timePeriod: 12,
                      percentageVested: 30,
                      label: '1 year',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 2}`,
                      timePeriod: 24,
                      percentageVested: 50,
                      label: '2 years',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 3}`,
                      timePeriod: 36,
                      percentageVested: 75,
                      label: '3 years',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 4}`,
                      timePeriod: 48,
                      percentageVested: 100,
                      label: '4 years',
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-sm">90-Day Cliff + Annual</div>
                    <div className="text-xs text-gray-600 dark:text-slate-400">10% at 90 days, then 30%/50%/75%/100% yearly</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const baseTime = Date.now();
                    // Equal annual vesting
                    onAddEvent({
                      id: `event-${baseTime}`,
                      timePeriod: 12,
                      percentageVested: 25,
                      label: '1 year',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 1}`,
                      timePeriod: 24,
                      percentageVested: 50,
                      label: '2 years',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 2}`,
                      timePeriod: 36,
                      percentageVested: 75,
                      label: '3 years',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 3}`,
                      timePeriod: 48,
                      percentageVested: 100,
                      label: '4 years',
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-sm">Equal Annual</div>
                    <div className="text-xs text-gray-600 dark:text-slate-400">25% each year for 4 years</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const baseTime = Date.now();
                    // Traditional 5/10 year vesting
                    onAddEvent({
                      id: `event-${baseTime}`,
                      timePeriod: 60,
                      percentageVested: 50,
                      label: '5 years',
                    });
                    onAddEvent({
                      id: `event-${baseTime + 1}`,
                      timePeriod: 120,
                      percentageVested: 100,
                      label: '10 years',
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-sm">Traditional</div>
                    <div className="text-xs text-gray-600 dark:text-slate-400">50% at 5 years, 100% at 10 years</div>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValidSchedule}
            className={`sm:order-2 ${
              isValidSchedule
                ? 'bg-bitcoin hover:bg-orange-600 text-white'
                : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
            }`}
          >
            {customVestingEvents.length === 0 ? 'Close' : `Save ${customVestingEvents.length} Milestones`}
            {hasUnsavedChanges && <span className="ml-1">*</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
