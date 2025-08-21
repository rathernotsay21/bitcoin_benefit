'use client';

import React from 'react';
import { ToolError, createToolError, isToolError } from '@/types/bitcoin-tools';

interface ToolErrorBoundaryState {
  hasError: boolean;
  error: ToolError | null;
  retryCount: number;
}

interface ToolErrorBoundaryProps {
  children: React.ReactNode;
  toolName: string;
  onError?: (error: ToolError) => void;
  maxRetries?: number;
}

export class ToolErrorBoundary extends React.Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  constructor(props: ToolErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error | ToolError): Partial<ToolErrorBoundaryState> {
    // If it's already a ToolError, use it directly
    const toolError = isToolError(error) 
      ? error
      : createToolError('unknown', 'UNKNOWN_ERROR', error instanceof Error ? error : new Error(String(error)));
    
    return {
      hasError: true,
      error: toolError
    };
  }

  componentDidCatch(error: Error | ToolError, errorInfo: React.ErrorInfo) {
    const toolError = isToolError(error)
      ? error
      : createToolError('unknown', 'UNKNOWN_ERROR', error instanceof Error ? error : new Error(String(error)), {
          componentStack: errorInfo.componentStack,
          errorBoundary: this.props.toolName
        });

    // Update state if not already a ToolError to include additional context
    if (!isToolError(error)) {
      this.setState({ error: toolError });
    }

    this.props.onError?.(toolError);
    
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${this.props.toolName}:`, error, errorInfo);
    }
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 2;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ToolErrorDisplay
          toolName={this.props.toolName}
          error={this.state.error}
          onRetry={this.state.error.retryable && this.state.retryCount < (this.props.maxRetries || 2) 
            ? this.handleRetry 
            : undefined}
          onReset={this.handleReset}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 2}
        />
      );
    }

    return this.props.children;
  }
}

interface ToolErrorDisplayProps {
  toolName: string;
  error: ToolError;
  onRetry?: () => void;
  onReset: () => void;
  retryCount: number;
  maxRetries: number;
}

function ToolErrorDisplay({ 
  toolName, 
  error, 
  onRetry, 
  onReset, 
  retryCount, 
  maxRetries 
}: ToolErrorDisplayProps) {
  const getErrorIcon = (errorType: ToolError['type']) => {
    switch (errorType) {
      case 'validation':
        return '⚠️';
      case 'network':
      case 'timeout':
        return '🌐';
      case 'api':
        return '🔧';
      case 'not_found':
        return '🔍';
      case 'rate_limit':
        return '⏱️';
      default:
        return '❌';
    }
  };

  const getErrorColor = (errorType: ToolError['type']) => {
    switch (errorType) {
      case 'validation':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20';
      case 'network':
      case 'timeout':
      case 'api':
        return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20';
      case 'not_found':
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20';
      case 'rate_limit':
        return 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20';
      default:
        return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${getErrorColor(error.type)}`}>
      {/* Error Header */}
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{getErrorIcon(error.type)}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {toolName} Error
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {error.userFriendlyMessage}
          </p>
        </div>
      </div>

      {/* Error Suggestions */}
      {error.suggestions && error.suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            What you can try:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {error.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Retry Information */}
      {error.retryable && retryCount > 0 && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Retry attempt: {retryCount} of {maxRetries}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-bitcoin hover:bg-bitcoin-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2"
          >
            🔄 Try Again
          </button>
        )}
        
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          🔄 Reset Tool
        </button>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          🔄 Refresh Page
        </button>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && error.originalError && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            Debug Information
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 overflow-auto">
            {error.originalError.stack || error.originalError.message}
          </pre>
        </details>
      )}
    </div>
  );
}

// Higher-order component for wrapping tools with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  toolName: string,
  options?: {
    maxRetries?: number;
    onError?: (error: ToolError) => void;
  }
) {
  const WrappedComponent = (props: T) => {
    return (
      <ToolErrorBoundary
        toolName={toolName}
        maxRetries={options?.maxRetries}
        onError={options?.onError}
      >
        <Component {...props} />
      </ToolErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default ToolErrorBoundary;