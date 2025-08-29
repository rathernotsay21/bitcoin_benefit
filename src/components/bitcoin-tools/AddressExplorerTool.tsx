'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { createToolError } from '@/types/bitcoin-tools';
import { AddressService } from '@/lib/services/addressService';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';
import { EducationalSidebar } from './educational/EducationalSidebar';
import { addressEducation } from './educational/educationalContent';

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
    preferences: _preferences
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

  const _handlePageChange = (newPage: number) => {
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
      {/* Main Tool Content - 60% width */}
      <div className="lg:flex-[1.5] w-full min-w-0 space-y-6">
        {/* Explanatory Text for New Users */}
        {!addressExplorer.data && (
          <div className="card mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <span className="text-blue-600 text-3xl mr-3">💼</span>
            What is a Bitcoin Address?
          </h3>
          <p className="text-lg text-blue-800 dark:text-blue-200 mb-4">
            A Bitcoin address is like a digital mailbox where people can send you Bitcoin. It's a long string 
            of letters and numbers that starts with 1, 3, or bc1. Every address has a public record of all 
            the money sent to and from it - like a bank statement that anyone can view.
          </p>
          <p className="text-lg text-blue-700 dark:text-blue-300">
            <strong>To explore an address:</strong> Enter any Bitcoin address below to see its balance and 
            transaction history. Remember, all Bitcoin transactions are public, so only look up addresses 
            you own or have permission to view.
          </p>
          </div>
        )}

        {/* Address Input */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-slate-100 mb-6 flex items-center">
            <span className="text-bitcoin text-3xl mr-3">🔎</span>
            Address Explorer
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xl font-bold text-gray-900 dark:text-white dark:text-slate-100">
                Enter Bitcoin Address
                <BitcoinTooltip term="ADDRESS">
                  <span className="ml-2 cursor-help text-bitcoin text-lg">ⓘ</span>
                </BitcoinTooltip>
              </label>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter address starting with 1, 3, or bc1"
                className="input-field flex-1 font-mono text-lg"
              />
              <button
                type="submit"
                disabled={!addressInput.trim() || addressExplorer.loading.isLoading}
                className="btn-primary px-8 py-4 text-lg min-w-[120px]"
              >
                Explore
              </button>
            </form>
          </div>
        </div>

        {/* Privacy Warning - Moved below Address Explorer card */}
        {showPrivacyWarning && (
          <div className="card bg-bitcoin-50 dark:bg-bitcoin-900/20 border-2 border-amber-200 dark:border-amber-700 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-amber-500 text-3xl">🔒</div>
              <div>
                <h4 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-3">
                Privacy Reminder
                </h4>
                <p className="text-lg text-amber-700 dark:text-amber-300 mb-4">
                Looking up addresses is like looking at someone's financial records - they're public but should 
                be treated with respect. Only look up your own addresses or ones you have permission to view.
                </p>
                <p className="text-base text-amber-600 dark:text-amber-400">
                Your searches are not saved or tracked by this tool.
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

        {/* Address Analysis Results */}
        {addressExplorer.data && (
          <div className="space-y-6">
          {/* What This Means Section */}
          <div className="card mb-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center">
              <span className="text-green-600 text-3xl mr-3">✅</span>
              What We Found
            </h3>
            <p className="text-lg text-green-800 dark:text-green-200 leading-relaxed">
              This address has been used {addressExplorer.data.transactionCount} time{addressExplorer.data.transactionCount !== 1 ? 's' : ''} and currently 
              holds {formatBTC(addressExplorer.data.balance.btc)} ({formatUSD(addressExplorer.data.balance.usd)}). 
              {addressExplorer.data.balance.btc > 0 
                ? " The owner can spend this Bitcoin at any time."
                : " The address is currently empty."}
            </p>
          </div>

          {/* Address Header */}
          <div className="card mb-6 hover:shadow-sm transition-all duration-300">
            <div className="flex flex-col gap-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-slate-100">
                Address Details
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleCopy(addressExplorer.data!.address, 'address')}
                  className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {copiedItem === 'address' ? '✓ Copied' : 'Copy'}
                </button>
                <select
                  onChange={(e) => {
                    const urls = AddressService.getExplorerUrls(addressExplorer.data!.address);
                    window.open(urls[e.target.value as keyof typeof urls], '_blank');
                  }}
                  defaultValue=""
                  className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex-1 sm:flex-initial sm:min-w-[140px]"
                >
                  <option value="" disabled>View on Explorer</option>
                  <option value="mempool">Mempool.space</option>
                  <option value="blockstream">Blockstream</option>
                  <option value="blockchain">Blockchain.com</option>
                </select>
              </div>
            </div>
            
            <div className="font-mono text-base text-gray-600 dark:text-gray-400 dark:text-gray-600 break-all mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-sm">
              {addressExplorer.data.address}
            </div>
            
            <div className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-600">
              {addressExplorer.data.humanReadable.activitySummary}
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-sm p-6 mb-6 shadow-sm">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white dark:text-gray-100 mb-3">
              Current Balance
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600 mb-6">
              The total amount of Bitcoin currently stored at this address
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-bitcoin/5 rounded-sm">
                <div className="text-3xl font-bold text-bitcoin mb-2">
                  {formatBTC(addressExplorer.data.balance.btc)}
                </div>
                <div className="text-base font-medium text-gray-600 dark:text-gray-400 dark:text-gray-600">In Bitcoin</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-sm">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatUSD(addressExplorer.data.balance.usd)}
                </div>
                <div className="text-base font-medium text-gray-600 dark:text-gray-400 dark:text-gray-600">In US Dollars</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-sm">
                <div className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {addressExplorer.data.balance.sats.toLocaleString()}
                </div>
                <div className="text-base font-medium text-gray-600 dark:text-gray-400 dark:text-gray-600">In Satoshis (smallest unit)</div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-base text-gray-600 dark:text-gray-400 dark:text-gray-600">
              {addressExplorer.data.humanReadable.balanceDescription}
            </div>
          </div>

          {/* Transaction History */}
          {addressExplorer.data.transactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-sm p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white dark:text-gray-100">
                  Transaction History
                </h4>
                <div className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-600">
                  Showing {Math.min(25, addressExplorer.data.transactions.length)} of {addressExplorer.data.transactionCount}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600 mb-6">
                Every time Bitcoin was sent to or from this address
              </p>
              
              <div className="space-y-4">
                {addressExplorer.data.transactions.map((tx, index) => (
                  <div key={tx.txid} className="border-2 border-gray-200 dark:border-gray-600 rounded-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getStatusIcon(tx.status)}</span>
                        <span className="text-xl">{getTypeIcon(tx.type)}</span>
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white dark:text-gray-100">
                          {tx.type === 'received' ? 'Money Received' : 'Money Sent'}
                          </div>
                          <div className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-600">
                          {tx.date} • {tx.status === 'confirmed' ? 'Complete' : 'Processing'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xl font-bold ${tx.type === 'received' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {tx.type === 'received' ? '+' : '-'}{formatBTC(tx.amount.btc)}
                        </div>
                        <div className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-600">
                          {formatUSD(tx.amount.usd)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600">
                    Showing first 25 transactions. Use a full blockchain explorer for complete history.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Transactions */}
          {addressExplorer.data.transactions.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-sm p-8 mb-6 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white dark:text-gray-100 mb-2">
                No Transactions Found
              </h4>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-600">
                This address has no transaction history or has not been used yet.
              </p>
            </div>
          )}

          {/* Best Practices */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-sm p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
              <span className="mr-3 text-xl">💡</span>
              Good to Know
            </h4>
            <ul className="text-base text-blue-700 dark:text-blue-300 space-y-3">
              <li>• Every Bitcoin transaction is permanently recorded and visible to everyone</li>
              <li>• For better privacy, use a different address for each payment you receive</li>
              <li>• Never share your private keys - only share the address itself</li>
              <li>• Anyone who knows this address can see its entire transaction history</li>
            </ul>
          </div>
          </div>
        )}
      </div>

      {/* Educational Sidebar - 40% width */}
      <div className="lg:flex-[1] lg:max-w-md">
        <div className="lg:sticky lg:top-6">
          <EducationalSidebar sections={addressEducation} />
        </div>
      </div>
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