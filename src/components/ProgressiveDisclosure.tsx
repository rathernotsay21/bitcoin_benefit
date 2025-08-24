'use client';

import { useState } from 'react';
import { InformationCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-1 transition-colors"
        aria-label="More information"
        aria-expanded={isVisible}
      >
        {children}
      </button>
      
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 mt-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-sm shadow-sm -left-32 transform">
          <div className="text-gray-700 dark:text-gray-300">
            {content}
          </div>
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-gray-200 dark:border-slate-600 rotate-45"></div>
          </div>
        </div>
      )}
    </span>
  );
}

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function ExpandableSection({ 
  title, 
  children, 
  defaultExpanded = false, 
  className = '' 
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border border-gray-200 dark:border-slate-600 rounded-sm ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-t-lg transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}

interface TechnicalDetailsProps {
  summary: string;
  details: string;
  className?: string;
}

export function TechnicalDetails({ summary, details, className = '' }: TechnicalDetailsProps) {
  return (
    <span className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="text-gray-700 dark:text-gray-300">{summary}</span>
      <Tooltip content={details}>
        <InformationCircleIcon className="w-4 h-4" />
      </Tooltip>
    </span>
  );
}