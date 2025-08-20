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
      const url = `/${currentPath}/${value}`;
      window.history.replaceState(null, '', url);
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
          return (
            <TabsTrigger
              key={scheme.id}
              value={scheme.id}
              className="flex flex-col items-center py-4 px-3 data-[state=active]:bg-bitcoin data-[state=active]:text-white text-sm font-medium transition-all duration-300 hover:bg-bitcoin/10 dark:hover:bg-bitcoin/20 group"
            >
              <IconComponent className="w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-xs font-semibold leading-tight text-center mb-1">
                {scheme.name}
              </span>
              <span className="text-[10px] opacity-75 leading-tight text-center hidden sm:inline">
                {scheme.tagline || 'Custom Plan'}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {VESTING_SCHEMES.map((scheme) => {
        const IconComponent = getSchemeIcon(scheme.icon || 'rocket');
        return (
          <TabsContent key={scheme.id} value={scheme.id} className="mt-6">
            <div className="rounded-xl border-2 border-bitcoin/20 bg-gradient-to-r from-bitcoin/5 to-orange-100/50 dark:from-bitcoin/10 dark:to-slate-800 p-6 transition-all duration-300 hover:border-bitcoin/30">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-bitcoin/20 dark:bg-bitcoin/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-bitcoin/30 dark:hover:bg-bitcoin/40">
                    <IconComponent className="w-6 h-6 text-bitcoin" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-deepSlate dark:text-slate-100">
                      {scheme.name}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-bitcoin/20 text-bitcoin-800 dark:bg-bitcoin/30 dark:text-bitcoin-100">
                      {scheme.tagline || 'Custom Plan'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    {scheme.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}