/**
 * Development component for testing API endpoints
 * This should only be used during development to verify the proxy routes are working
 */
'use client';

import { useState } from 'react';

interface APITestResult {
  status: number | string;
  statusText?: string;
  data?: any;
  error?: string;
}

type APITestResults = Record<string, APITestResult>;

export default function APITester() {
  const [results, setResults] = useState<APITestResults>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, url: string) => {
    setLoading((prev: Record<string, boolean>) => ({ ...prev, [name]: true }));
    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults((prev: APITestResults) => ({ 
        ...prev, 
        [name]: { 
          status: response.status, 
          statusText: response.statusText,
          data: data 
        } 
      }));
    } catch (error) {
      setResults((prev: APITestResults) => ({ 
        ...prev, 
        [name]: { 
          status: 'ERROR', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    } finally {
      setLoading((prev: Record<string, boolean>) => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: 'Health Check',
      url: '/api/health',
      description: 'Basic API health check'
    },
    {
      name: 'Mempool API Test',
      url: '/api/mempool/address/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh/txs',
      description: 'Test mempool.space proxy with a known address'
    },
    {
      name: 'CoinGecko API Test',
      url: '/api/coingecko?from=1609459200&to=1609545600&vs_currency=usd',
      description: 'Test CoinGecko proxy with a date range (Jan 1-2, 2021)'
    }
  ];

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 dark:bg-slate-800 rounded-sm">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        API Endpoint Tester (Development Only)
      </h2>
      
      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test.name} className="border border-gray-300 dark:border-slate-600 rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{test.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{test.description}</p>
                <code className="text-xs bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded">
                  {test.url}
                </code>
              </div>
              <button
                onClick={() => testEndpoint(test.name, test.url)}
                disabled={loading[test.name]}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading[test.name] ? 'Testing...' : 'Test'}
              </button>
            </div>
            
            {results[test.name] && (
              <div className="mt-4 p-3 bg-white dark:bg-slate-700 rounded border">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Result:</h4>
                <pre className="text-xs overflow-auto max-h-64 bg-gray-50 dark:bg-slate-600 p-2 rounded">
                  {JSON.stringify(results[test.name], null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This component is only visible in development mode. 
          It helps verify that the API proxy routes are working correctly to resolve CORS issues.
        </p>
      </div>
    </div>
  );
}
