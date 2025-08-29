'use client';

import { useState } from 'react';

interface TestResult {
  status: number | string;
  statusText?: string;
  ok?: boolean;
  data?: any;
  error?: string;
}

type TestResults = Record<string, TestResult>;

export default function APITestPage() {
  const [results, setResults] = useState<TestResults>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, url: string) => {
    setLoading((prev: Record<string, boolean>) => ({ ...prev, [name]: true }));
    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults((prev: TestResults) => ({ 
        ...prev, 
        [name]: { 
          status: response.status, 
          statusText: response.statusText,
          ok: response.ok,
          data: data 
        } 
      }));
    } catch (error) {
      setResults((prev: TestResults) => ({ 
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
      url: 'https://mempool.space/api/address/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh/txs',
      description: 'Test direct mempool.space API with a known address (CORS enabled)'
    },
    {
      name: 'CoinGecko API Test',
      url: '/api/coingecko?from=1609459200&to=1609545600&vs_currency=usd',
      description: 'Test CoinGecko proxy with a date range (Jan 1-2, 2021)'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          API Endpoint Testing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-slate-400 mb-8">
          Testing the proxy API endpoints to resolve CORS issues
        </p>
        
        <div className="space-y-6">
          {tests.map((test) => (
            <div key={test.name} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{test.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 dark:text-slate-400">{test.description}</p>
                  <code className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded mt-2 inline-block">
                    {test.url}
                  </code>
                </div>
                <button
                  onClick={() => testEndpoint(test.name, test.url)}
                  disabled={loading[test.name]}
                  className="px-6 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading[test.name] ? 'Testing...' : 'Test Endpoint'}
                </button>
              </div>
              
              {results[test.name] && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white mr-2">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      results[test.name]?.ok 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}>
                      {results[test.name]?.status} {results[test.name]?.statusText}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-slate-700 rounded border p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Response:</h4>
                    <pre className="text-sm overflow-auto max-h-96 bg-gray-100 dark:bg-slate-600 p-3 rounded">
                      {JSON.stringify(results[test.name] || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">What this tests:</h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• <strong>Health Check:</strong> Verifies that the API routes are working</li>
            <li>• <strong>Mempool Proxy:</strong> Tests Bitcoin transaction data fetching without CORS issues</li>
            <li>• <strong>CoinGecko Proxy:</strong> Tests historical price data fetching without CORS issues</li>
          </ul>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3">
            If all tests pass with status 200, the CORS issues have been resolved and the Track functionality should work properly.
          </p>
        </div>
      </div>
    </div>
  );
}
