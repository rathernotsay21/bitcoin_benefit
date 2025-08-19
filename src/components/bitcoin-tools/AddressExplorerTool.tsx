'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { AddressInfo, createToolError } from '@/types/bitcoin-tools';
import { AddressService } from '@/lib/services/addressService';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';

interface AddressExplorerToolProps {
  initialAddress?: string;
}

function AddressExplorerTool({ initialAddress }: AddressExplorerToolProps) {
  const {
    tools: { addressExplorer },
    setAddressExplorerLoading,
    setAddressExplorerData,
    setAddressExplorerError,
    setAddressExplorerPage,
    checkRateLimit,
    recordRequest,
    preferences
  } = useBitcoinToolsStore();

  const [addressInput, setAddressInput] = useState(initialAddress || addressExplorer.lastAddress || '');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(true);
  const [lastSearchedAddress, setLastSearchedAddress] = useState('');
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeAddress = useCallback(async (address: string, page: number = 1) => {
    if (!address.trim()) {
      setAddressExplorerError(createToolError('validation', 'INVALID_ADDRESS'));
      return;
    }

    if (!checkRateLimit('address-explorer')) {
      setAddressExplorerError(createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED'));
      return;
    }

    setAddressExplorerLoading({
      isLoading: true,
      loadingMessage: 'Analyzing Bitcoin address...'
    });

    try {
      recordRequest('address-explorer');
      const data = await AddressService.analyzeAddress(address.trim(), page);
      setAddressExplorerData(data);
      setLastSearchedAddress(address.trim());
    } catch (error) {
      console.error('Address analysis error:', error);
      setAddressExplorerError(
        error && typeof error === 'object' && 'type' in error
          ? error as any
          : createToolError('unknown', 'UNKNOWN_ERROR', error instanceof Error ? error : undefined)
      );
    }
  }, [checkRateLimit, recordRequest, setAddressExplorerLoading, setAddressExplorerData, setAddressExplorerError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      analyzeAddress(addressInput.trim());
    }
  };

  const handleCopy = async (text: string, item: string) => {
    const success = await AddressService.copyToClipboard(text);
    if (success) {
      setCopiedItem(item);
      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      // Set new timeout with cleanup reference
      copyTimeoutRef.current = setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const handlePageChange = (newPage: number) => {
    setAddressExplorerPage(newPage);
    if (lastSearchedAddress) {
      analyzeAddress(lastSearchedAddress, newPage);
    }
  };

  const getStatusIcon = (status: 'confirmed' | 'pending') => {
    return status === 'confirmed' ? '✅' : '⏳';
  };

  const getTypeIcon = (type: 'received' | 'sent') => {
    return type === 'received' ? '📈' : '📉';
  };

  const formatBTC = (amount: number): string => {
    if (amount >= 1) {
      return `${amount.toFixed(4)} BTC`;
    } else if (amount >= 0.001) {
      return `${amount.toFixed(6)} BTC`;
    } else {
      return `${Math.round(amount * 100000000).toLocaleString()} sats`;
    }
  };

  const formatUSD = (amount: number): string => {
    return amount >= 0.01 ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '<$0.01';
  };

  // Initialize with initial address if provided
  useEffect(() => {
    if (initialAddress && !addressExplorer.data) {
      setAddressInput(initialAddress);
      analyzeAddress(initialAddress);
    }
  }, [initialAddress, analyzeAddress, addressExplorer.data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  if (addressExplorer.loading.isLoading) {
    return <ToolSkeleton variant="address" showProgress progressMessage={addressExplorer.loading.loadingMessage} />;
  }

  if (addressExplorer.error) {
    throw addressExplorer.error; // Will be caught by error boundary
  }

  return (
    <div className="space-y-6">
      {/* Privacy Warning */}
      {showPrivacyWarning && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="text-amber-500 text-xl">🔒</div>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Privacy Notice
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                  Bitcoin addresses are public, but exploring them can reveal transaction patterns. 
                  Only explore addresses you own or have permission to analyze.
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  This tool fetches data from public APIs and does not store your queries.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacyWarning(false)}
              className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Address Input */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bitcoin Address
            <BitcoinTooltip term="ADDRESS">
              <span className="ml-1 cursor-help text-bitcoin">ⓘ</span>
            </BitcoinTooltip>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Enter Bitcoin address (1..., 3..., or bc1...)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:ring-2 focus:ring-bitcoin focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!addressInput.trim() || addressExplorer.loading.isLoading}
            className="px-6 py-3 bg-bitcoin text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bitcoin-600 transition-colors"
          >
            Explore
          </button>
        </form>
      </div>

      {/* Address Analysis Results */}
      {addressExplorer.data && (
        <div className="space-y-6">
          {/* Address Header */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Address Analysis
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopy(addressExplorer.data!.address, 'address')}
                  className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {copiedItem === 'address' ? '✓ Copied' : 'Copy'}
                </button>
                <select
                  onChange={(e) => {
                    const urls = AddressService.getExplorerUrls(addressExplorer.data!.address);
                    window.open(urls[e.target.value as keyof typeof urls], '_blank');
                  }}
                  defaultValue=""
                  className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                >
                  <option value="" disabled>View on Explorer</option>
                  <option value="mempool">Mempool.space</option>
                  <option value="blockstream">Blockstream</option>
                  <option value="blockchain">Blockchain.com</option>
                </select>
              </div>
            </div>
            
            <div className="font-mono text-sm text-gray-600 dark:text-gray-400 break-all mb-3">
              {addressExplorer.data.address}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {addressExplorer.data.humanReadable.activitySummary}
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Current Balance
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-bitcoin mb-1">
                  {formatBTC(addressExplorer.data.balance.btc)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bitcoin</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {formatUSD(addressExplorer.data.balance.usd)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">US Dollar</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {addressExplorer.data.balance.sats.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Satoshis</div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {addressExplorer.data.humanReadable.balanceDescription}
            </div>
          </div>

          {/* Transaction History */}
          {addressExplorer.data.transactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Transactions
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {Math.min(25, addressExplorer.data.transactions.length)} of {addressExplorer.data.transactionCount}
                </div>
              </div>
              
              <div className="space-y-3">
                {addressExplorer.data.transactions.map((tx, index) => (
                  <div key={tx.txid} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(tx.status)}</span>
                        <span className="text-lg">{getTypeIcon(tx.type)}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {tx.type}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {tx.date} • {tx.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${tx.type === 'received' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {tx.type === 'received' ? '+' : '-'}{formatBTC(tx.amount.btc)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatUSD(tx.amount.usd)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-mono">
                        {AddressService.formatAddressForDisplay(tx.txid, 8)}
                      </span>
                      <button
                        onClick={() => handleCopy(tx.txid, `tx-${index}`)}
                        className="hover:text-bitcoin transition-colors"
                      >
                        {copiedItem === `tx-${index}` ? '✓ Copied' : 'Copy TXID'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination would go here if needed */}
              {addressExplorer.data.transactionCount > 25 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing first 25 transactions. Use a full blockchain explorer for complete history.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Transactions */}
          {addressExplorer.data.transactions.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Transactions Found
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                This address has no transaction history or has not been used yet.
              </p>
            </div>
          )}

          {/* Best Practices */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Bitcoin Privacy Best Practices
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use a new address for each transaction to maintain privacy</li>
              <li>• Avoid reusing addresses after they've been spent from</li>
              <li>• Consider using privacy-focused wallets with coin mixing features</li>
              <li>• Be aware that all Bitcoin transactions are publicly visible</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddressExplorerToolWithErrorBoundary(props: AddressExplorerToolProps) {
  return (
    <ToolErrorBoundary toolName="Address Explorer">
      <AddressExplorerTool {...props} />
    </ToolErrorBoundary>
  );
}