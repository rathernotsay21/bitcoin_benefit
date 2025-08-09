'use client';

import React, { Component, ReactNode, useState } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-white/90 mb-6">
              We encountered an error while processing your request. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.resetError}
                className="inline-flex items-center px-4 py-2 bg-bitcoin dark:bg-slate-700 text-white font-medium rounded-lg hover:bg-bitcoin-600 dark:hover:bg-slate-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-slate-600 text-white font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-slate-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-white/70 hover:text-gray-700 dark:hover:text-white">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-slate-800 dark:text-white p-3 rounded overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundary for calculator sections
export function CalculatorErrorBoundary({ children }: { children: ReactNode }) {
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  const resetCalculatorError = () => {
    setErrorBoundaryKey(prev => prev + 1);
  };

  return (
    <ErrorBoundary
      key={errorBoundaryKey}
      fallback={
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                Calculator Error
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                The calculator encountered an error. Please check your inputs and try again.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={resetCalculatorError}
                  className="text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                >
                  Reset Calculator →
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log calculator-specific errors
        console.error('Calculator error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Chart-specific error boundary
export function ChartErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Chart Unavailable
          </h3>
          <p className="text-sm text-gray-600 dark:text-white/80">
            Unable to render the chart. Please try refreshing the page.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
