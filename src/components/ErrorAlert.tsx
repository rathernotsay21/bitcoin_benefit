'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { ToolError, isValidationError, isNetworkError, isRateLimitError } from '@/types/bitcoin-tools';

// Enhanced alert variant types
type AlertVariant = 'error' | 'warning' | 'info' | 'success';
type AlertDismissReason = 'user_dismissed' | 'auto_dismissed' | 'retry_initiated';

// Enhanced props with tool error integration
interface ErrorAlertProps {
  readonly variant?: AlertVariant;
  readonly title?: string; // Optional when using toolError
  readonly description?: string; // Optional when using toolError
  readonly toolError?: ToolError; // Use for automatic error handling
  readonly onRetry?: () => void | Promise<void>;
  readonly onDismiss?: (reason: AlertDismissReason) => void;
  readonly className?: string;
  readonly showIcon?: boolean;
  readonly autoRetryDelay?: number; // ms
  readonly showDetailsToggle?: boolean;
}

// Enhanced variant configuration with readonly properties
interface VariantConfig {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly className: string;
  readonly iconClassName: string;
  readonly titleClassName: string;
  readonly descriptionClassName: string;
}

const variantConfig: Record<AlertVariant, VariantConfig> = {
  error: {
    icon: XCircleIcon,
    className: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    iconClassName: 'text-red-600 dark:text-red-400',
    titleClassName: 'text-red-900 dark:text-red-200',
    descriptionClassName: 'text-red-800 dark:text-red-300',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    titleClassName: 'text-yellow-900 dark:text-yellow-200',
    descriptionClassName: 'text-yellow-800 dark:text-yellow-300',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    titleClassName: 'text-blue-900 dark:text-blue-200',
    descriptionClassName: 'text-blue-800 dark:text-blue-300',
  },
  success: {
    icon: CheckCircleIcon,
    className: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    iconClassName: 'text-green-600 dark:text-green-400',
    titleClassName: 'text-green-900 dark:text-green-200',
    descriptionClassName: 'text-green-800 dark:text-green-300',
  },
} as const;

// Utility function to determine variant from tool error
function getVariantFromToolError(toolError: ToolError): AlertVariant {
  if (isValidationError(toolError)) return 'warning';
  if (isNetworkError(toolError) || isRateLimitError(toolError)) return 'warning';
  return 'error';
}

// Enhanced component with tool error integration
export default function ErrorAlert({
  variant,
  title,
  description,
  toolError,
  onRetry,
  onDismiss,
  className = '',
  showIcon = true,
  autoRetryDelay,
  showDetailsToggle = false,
}: ErrorAlertProps) {
  // Determine variant, title, and description from toolError if provided
  const finalVariant = variant || (toolError ? getVariantFromToolError(toolError) : 'error');
  const finalTitle = title || toolError?.message || 'An error occurred';
  const finalDescription = description || toolError?.userFriendlyMessage || 'Please try again.';
  
  const config = variantConfig[finalVariant];
  const Icon = config.icon;
  
  // Enhanced retry handler with loading state
  const [isRetrying, setIsRetrying] = React.useState(false);
  
  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleDismiss = (reason: AlertDismissReason) => {
    onDismiss?.(reason);
  };

  return (
    <Alert className={`relative ${config.className} ${className}`}>
      {showIcon && <Icon className={`h-5 w-5 ${config.iconClassName}`} />}
      
      {onDismiss && (
        <button
          onClick={() => handleDismiss('user_dismissed')}
          className={`absolute top-3 right-3 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${config.iconClassName}`}
          aria-label="Dismiss alert"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
      
      <AlertTitle className={`font-semibold ${config.titleClassName} ${onDismiss ? 'pr-8' : ''}`}>
        {finalTitle}
      </AlertTitle>
      
      <AlertDescription className={`mt-2 ${config.descriptionClassName}`}>
        <p className="mb-3">{finalDescription}</p>
        
        {/* Show suggestions from tool error */}
        {toolError?.suggestions && toolError.suggestions.length > 0 && (
          <div className="mb-3">
            <p className="font-medium mb-2">Suggestions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {toolError.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {(onRetry || onDismiss) && (
          <div className="flex gap-2 mt-4">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying || !toolError?.retryable}
                className={`gap-2 border-current text-current hover:bg-current/10 disabled:opacity-50`}
              >
                <ArrowPathIcon className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            )}
            {onDismiss && !onRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss('user_dismissed')}
                className="text-current hover:bg-current/10"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}