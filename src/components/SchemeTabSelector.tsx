'use client';

import { useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { VestingScheme } from '@/types/vesting';
import { RocketLaunchIcon, ChartBarIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';

interface SchemeTabSelectorProps {
  selectedScheme: VestingScheme | null;
  onSchemeSelect: (schemeId: string) => void;
  currentPath?: string; // For URL synchronization
}

export default function SchemeTabSelector({ 
  selectedScheme, 
  onSchemeSelect,
  currentPath = 'calculator'
}: SchemeTabSelectorProps) {
  
  const getSchemeIcon = useCallback((iconName: string) => {
    switch (iconName) {
      case 'rocket':
        return RocketLaunchIcon;
      case 'chart-trending-up':
        return ChartBarIcon;
      case 'building-office':
        return BuildingOfficeIcon;
      default:
        return RocketLaunchIcon;
    }
  }, []);
  
  const handleTabChange = useCallback((value: string) => {
    onSchemeSelect(value);
    
    // Update URL to maintain scheme selection
    if (typeof window !== 'undefined') {
      if (currentPath === 'calculator') {
        // Calculator uses path params
        const url = `/${currentPath}/${value}`;
        window.history.replaceState(null, '', url);
      } else {
        // Historical and other pages use query params
        const url = new URL(window.location.href);
        url.searchParams.set('scheme', value);
        window.history.replaceState(null, '', url.toString());
      }
    }
  }, [onSchemeSelect, currentPath]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).closest('[role="tablist"]')) {
        const schemes = VESTING_SCHEMES.map(s => s.id);
        const currentIndex = selectedScheme ? schemes.indexOf(selectedScheme.id) : 0;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const newIndex = currentIndex > 0 ? currentIndex - 1 : schemes.length - 1;
          onSchemeSelect(schemes[newIndex]);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const newIndex = currentIndex < schemes.length - 1 ? currentIndex + 1 : 0;
          onSchemeSelect(schemes[newIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedScheme, onSchemeSelect]);

  return (
    <Tabs 
      value={selectedScheme?.id || 'accelerator'} 
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 dark:bg-slate-800">
        {VESTING_SCHEMES.map((scheme) => {
          const IconComponent = getSchemeIcon(scheme.icon || 'rocket');
          
          // Define color classes based on scheme
          const getColorClasses = () => {
            if (scheme.id === 'accelerator') {
              // Pioneer - Orange when active, grey when inactive
              return "text-gray-600 dark:text-gray-300 data-[state=active]:bg-bitcoin data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700";
            } else if (scheme.id === 'steady-builder') {
              // Stacker - Green when active, grey when inactive
              return "text-gray-600 dark:text-gray-300 data-[state=active]:bg-green-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:data-[state=active]:bg-green-700";
            } else if (scheme.id === 'slow-burn') {
              // Builder - Blue when active, grey when inactive
              return "text-gray-600 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-700";
            }
            return "";
          };
          
          return (
            <TabsTrigger
              key={scheme.id}
              value={scheme.id}
              className={`flex flex-col items-center py-4 px-3 text-sm font-medium transition-all duration-300 group ${getColorClasses()}`}
            >
              <IconComponent className="w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 group-data-[state=active]:scale-110 text-current" />
              <span className="text-xs font-semibold leading-tight text-center mb-1 text-current">
                {scheme.name}
              </span>
              <span className="text-[10px] opacity-75 leading-tight text-center hidden sm:inline text-current">
                {scheme.tagline || 'Custom Plan'}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}