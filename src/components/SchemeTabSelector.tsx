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
              return "text-gray-600 dark:text-gray-400 data-[state=active]:bg-bitcoin data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700";
            } else if (scheme.id === 'steady-builder') {
              // Stacker - Green when active, grey when inactive
              return "text-gray-600 dark:text-gray-400 data-[state=active]:bg-green-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:data-[state=active]:bg-green-700";
            } else if (scheme.id === 'slow-burn') {
              // Builder - Blue when active, grey when inactive
              return "text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:data-[state=active]:bg-blue-700";
            }
            return "";
          };
          
          return (
            <TabsTrigger
              key={scheme.id}
              value={scheme.id}
              className={`flex flex-col items-center py-4 px-3 text-sm font-medium transition-all duration-300 group ${getColorClasses()}`}
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
        
        // Define theme colors for description cards
        const getCardTheme = () => {
          if (scheme.id === 'accelerator') {
            // Pioneer - Orange/Bitcoin theme
            return {
              border: "border-bitcoin/20 hover:border-bitcoin/30",
              background: "bg-gradient-to-r from-bitcoin/5 to-orange-100/50 dark:from-bitcoin/10 dark:to-slate-800",
              iconBg: "bg-bitcoin/20 dark:bg-bitcoin/30 hover:bg-bitcoin/30 dark:hover:bg-bitcoin/40",
              iconColor: "text-bitcoin",
              tagBg: "bg-bitcoin/20 dark:bg-bitcoin/30",
              tagText: "text-bitcoin-800 dark:text-bitcoin-100"
            };
          } else if (scheme.id === 'steady-builder') {
            // Stacker - Green theme
            return {
              border: "border-green-500/20 hover:border-green-500/30",
              background: "bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-slate-800",
              iconBg: "bg-green-500/20 dark:bg-green-600/30 hover:bg-green-500/30 dark:hover:bg-green-600/40",
              iconColor: "text-green-600 dark:text-green-400",
              tagBg: "bg-green-500/20 dark:bg-green-600/30",
              tagText: "text-green-800 dark:text-green-100"
            };
          } else if (scheme.id === 'slow-burn') {
            // Builder - Blue theme
            return {
              border: "border-blue-500/20 hover:border-blue-500/30",
              background: "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-slate-800",
              iconBg: "bg-blue-500/20 dark:bg-blue-600/30 hover:bg-blue-500/30 dark:hover:bg-blue-600/40",
              iconColor: "text-blue-600 dark:text-blue-400",
              tagBg: "bg-blue-500/20 dark:bg-blue-600/30",
              tagText: "text-blue-800 dark:text-blue-100"
            };
          }
          return {
            border: "border-gray-300 hover:border-gray-400",
            background: "bg-gray-50 dark:bg-slate-800",
            iconBg: "bg-gray-200 dark:bg-gray-700",
            iconColor: "text-gray-600",
            tagBg: "bg-gray-200 dark:bg-gray-700",
            tagText: "text-gray-800 dark:text-gray-100"
          };
        };
        
        const theme = getCardTheme();
        
        return (
          <TabsContent key={scheme.id} value={scheme.id} className="mt-6">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 ${theme.iconBg} rounded-xl flex items-center justify-center transition-all duration-300`}>
                    <IconComponent className={`w-6 h-6 ${theme.iconColor}`} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-deepSlate dark:text-slate-100">
                      {scheme.name}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${theme.tagBg} ${theme.tagText}`}>
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