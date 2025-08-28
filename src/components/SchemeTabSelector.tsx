'use client';

import { useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { VestingScheme } from '@/types/vesting';
import { BitcoinIcon, SatoshiIcon, MiningOutlineIcon } from '@/components/icons';
import '@/styles/textured-backgrounds.css';

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
        return BitcoinIcon;
      case 'chart-trending-up':
        return SatoshiIcon;
      case 'building-office':
        return MiningOutlineIcon;
      default:
        return BitcoinIcon;
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
          
          // Define color classes based on scheme - colored backgrounds with black text for readability
          const getColorClasses = () => {
            if (scheme.id === 'accelerator') {
              // Pioneer - Orange/gold background with black text for active state
              return "text-gray-600 dark:text-gray-300 data-[state=active]:bg-bitcoin data-[state=active]:text-black hover:bg-gray-50 dark:hover:bg-gray-700";
            } else if (scheme.id === 'steady-builder') {
              // Stacker - Green background with black text for active state
              return "text-gray-600 dark:text-gray-300 data-[state=active]:bg-green-500 data-[state=active]:text-black hover:bg-gray-50 dark:hover:bg-gray-700";
            } else if (scheme.id === 'slow-burn') {
              // Builder - Blue background with black text for active state
              return "text-gray-600 dark:text-gray-300 data-[state=active]:bg-blue-500 data-[state=active]:text-black hover:bg-gray-50 dark:hover:bg-gray-700";
            }
            return "";
          };
          
          // Add texture overlay for active state
          const isActive = selectedScheme?.id === scheme.id;
          
          return (
            <TabsTrigger
              key={scheme.id}
              value={scheme.id}
              className={`relative overflow-hidden flex flex-col items-center py-4 px-3 text-sm font-medium transition-all duration-300 group border border-transparent ${getColorClasses()}`}
            >
              {/* Texture overlay for active state */}
              {isActive && (
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <div className="w-full h-full textured-preset-selected-light dark:textured-preset-selected-dark" />
                </div>
              )}
              <IconComponent className="relative z-10 w-8 h-8 mb-2 transition-transform duration-300 group-hover:scale-110 group-data-[state=active]:scale-110 group-data-[state=active]:text-black text-current" />
              <span className="relative z-10 text-sm font-semibold leading-tight text-center mb-1 group-data-[state=active]:text-black text-current">
                {scheme.name}
              </span>
              <span className="relative z-10 text-xs opacity-75 group-data-[state=active]:opacity-100 group-data-[state=active]:text-black leading-tight text-center hidden sm:inline text-current">
                {scheme.tagline || 'Custom Plan'}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}