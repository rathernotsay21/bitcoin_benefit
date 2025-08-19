'use client';

import React from 'react';

interface ToolSkeletonProps {
  variant?: 'default' | 'transaction' | 'address' | 'network' | 'fee' | 'document';
  showProgress?: boolean;
  progressMessage?: string;
  className?: string;
}

export default function ToolSkeleton({ 
  variant = 'default', 
  showProgress = false,
  progressMessage = 'Loading...',
  className = ''
}: ToolSkeletonProps) {
  const baseClasses = `animate-pulse ${className}`;

  const renderSkeletonContent = () => {
    switch (variant) {
      case 'transaction':
        return (
          <div className="space-y-4">
            {/* Transaction ID Input Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
            
            {/* Transaction Status Skeleton */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            {/* Address Input Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
            
            {/* Balance Skeleton */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            </div>
            
            {/* Transaction List Skeleton */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-4">
            {/* Network Status Header Skeleton */}
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            </div>
            
            {/* Network Metrics Skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
            </div>
            
            {/* Recommendation Skeleton */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-36"></div>
            </div>
          </div>
        );

      case 'fee':
        return (
          <div className="space-y-4">
            {/* Transaction Size Input Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
            
            {/* Fee Options Skeleton */}
            <div className="grid grid-cols-3 gap-3">
              {['Economy', 'Balanced', 'Priority'].map((label, i) => (
                <div key={label} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg">
                      {i === 0 ? '🐢' : i === 1 ? '⚖️' : '🚀'}
                    </div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            {/* File Upload Skeleton */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48 mx-auto"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto"></div>
              </div>
            </div>
            
            {/* Status Skeleton */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            {/* Default Input Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
            
            {/* Content Area Skeleton */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={baseClasses}>
      {showProgress && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bitcoin"></div>
            <span>{progressMessage}</span>
          </div>
        </div>
      )}
      
      {renderSkeletonContent()}
    </div>
  );
}

// Progress indicator component for multi-step operations
interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-bitcoin h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Current Step Description */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {steps[currentStep]}
      </div>
      
      {/* Step List */}
      <div className="space-y-1">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              index < currentStep 
                ? 'bg-green-500' 
                : index === currentStep 
                  ? 'bg-bitcoin animate-pulse' 
                  : 'bg-gray-300 dark:bg-gray-600'
            }`}></div>
            <span className={
              index <= currentStep 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-500 dark:text-gray-500'
            }>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}