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
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  BriefcaseIcon, 
  MagnifyingGlassIcon, 
  LockClosedIcon, 
  XMarkIcon, 
  DocumentIcon, 
  LightBulbIcon 
} from '@heroicons/react/24/outline';

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
    return status === 'confirmed' ? 
      <CheckCircleIcon className="w-5 h-5 text-bitcoin" /> : 
      <ClockIcon className="w-5 h-5 text-bitcoin" />;
  };

  const getTypeIcon = (type: 'received' | 'sent') => {
    return type === 'received' ? 
      <ArrowUpIcon className="w-5 h-5 text-bitcoin" /> : 
      <ArrowDownIcon className="w-5 h-5 text-bitcoin" />;
  };

  // Enhanced number formatting functions with abbreviation support
  const formatBTC = (amount: number, options?: { abbreviated?: boolean; precision?: 'auto' | number }): string => {
    const { abbreviated = false, precision = 'auto' } = options || {};
    
    if (amount >= 1000000 && abbreviated) {
      return `${(amount / 1000000).toFixed(2)}M BTC`;
    } else if (amount >= 1000 && abbreviated) {
      return `${(amount / 1000).toFixed(3)}K BTC`;
    } else if (amount >= 1) {
      const decimals = precision === 'auto' ? 4 : precision;
      return `${amount.toFixed(decimals)} BTC`;
    } else if (amount >= 0.001) {
      const decimals = precision === 'auto' ? 6 : precision;
      return `${amount.toFixed(decimals)} BTC`;
    } else {
      return `${Math.round(amount * 100000000).toLocaleString()} sats`;
    }
  };

  const formatUSD = (amount: number, options?: { abbreviated?: boolean }): string => {
    const { abbreviated = false } = options || {};
    
    if (amount < 0.01) return '<$0.01';
    
    if (amount >= 1000000 && abbreviated) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000 && abbreviated) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatSatoshis = (amount: number, options?: { abbreviated?: boolean }): string => {
    const { abbreviated = false } = options || {};
    const sats = Math.round(amount * 100000000);
    
    if (sats >= 1000000000 && abbreviated) {
      return `${(sats / 1000000000).toFixed(2)}B sats`;
    } else if (sats >= 1000000 && abbreviated) {
      return `${(sats / 1000000).toFixed(1)}M sats`;
    } else if (sats >= 1000 && abbreviated) {
      return `${(sats / 1000).toFixed(1)}K sats`;
    }
    
    return `${sats.toLocaleString()} sats`;
  };
  
  // Function to determine if values need abbreviation based on their size
  const shouldAbbreviate = (btcAmount: number, usdAmount: number): boolean => {
    const sats = Math.round(btcAmount * 100000000);
    return btcAmount >= 100 || usdAmount >= 100000 || sats >= 100000000;
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
        {/* Address Input */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-slate-100 mb-6 flex items-center">
            <MagnifyingGlassIcon className="w-10 h-10 text-bitcoin mr-3" />
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


        {/* Address Analysis Results */}
        {addressExplorer.data && (
          <div className="space-y-6">
          {/* Address Header */}
          <div className="card mb-6 hover:shadow-sm transition-all duration-300">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-slate-100">
                  Address Details
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(addressExplorer.data!.address, 'address')}
                    className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors whitespace-nowrap font-medium"
                  >
                    {copiedItem === 'address' ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-1 inline text-bitcoin" />
                        Copied
                      </>
                    ) : 'Copy'}
                  </button>
                  <select
                    onChange={(e) => {
                      const urls = AddressService.getExplorerUrls(addressExplorer.data!.address);
                      window.open(urls[e.target.value as keyof typeof urls], '_blank');
                    }}
                    defaultValue=""
                    className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 hover:scale-105 hover:shadow-sm transition-all duration-200 font-medium appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5rem]"
                  >
                    <option value="" disabled>View on Explorer</option>
                    <option value="mempool">Mempool.space</option>
                    <option value="blockstream">Blockstream</option>
                    <option value="blockchain">Blockchain.com</option>
                  </select>
                </div>
              </div>
              
              <div className="font-mono text-base text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-3 rounded-sm">
                {addressExplorer.data.address}
              </div>
              
              <div className="text-base text-gray-600 dark:text-gray-400 mt-3">
                {addressExplorer.data.humanReadable.activitySummary}
              </div>
            </div>
          </div>

          {/* Balance Display - Redesigned */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                Current Balance
              </h4>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {addressExplorer.data.address.slice(0, 8)}...{addressExplorer.data.address.slice(-6)}
              </div>
            </div>
            
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              The total amount of Bitcoin currently stored at this address
            </p>
            
            {(() => {
              const balance = addressExplorer.data.balance;
              const needsAbbreviation = shouldAbbreviate(balance.btc, balance.usd);
              
              return (
                <div className="space-y-6">
                  {/* Primary Balance - BTC */}
                  <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      <div className="text-4xl lg:text-5xl font-bold text-bitcoin mb-2 font-mono tracking-tight">
                        {formatBTC(balance.btc, { abbreviated: needsAbbreviation })}
                      </div>
                      {needsAbbreviation && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          Exact: {formatBTC(balance.btc, { abbreviated: false, precision: 8 })}
                        </div>
                      )}
                      <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Primary Balance
                      </div>
                    </div>
                  </div>
                  
                  {/* Secondary Values Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* USD Value */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-lg p-4 border border-green-200/50 dark:border-green-800/30">
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-green-700 dark:text-green-400 mb-1 font-mono">
                          {formatUSD(balance.usd, { abbreviated: needsAbbreviation })}
                        </div>
                        {needsAbbreviation && (
                          <div className="text-xs text-green-600 dark:text-green-500 font-mono mb-1">
                            {formatUSD(balance.usd, { abbreviated: false })}
                          </div>
                        )}
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          USD Value
                        </div>
                      </div>
                    </div>
                    
                    {/* Satoshis */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/20 dark:to-gray-700/10 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/30">
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-1 font-mono">
                          {formatSatoshis(balance.btc, { abbreviated: needsAbbreviation })}
                        </div>
                        {needsAbbreviation && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono mb-1">
                            {formatSatoshis(balance.btc, { abbreviated: false })}
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Satoshis (smallest unit)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Balance Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/30">
                    <div className="text-center text-base text-blue-700 dark:text-blue-300 font-medium">
                      {addressExplorer.data.humanReadable.balanceDescription}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Transaction History */}
          {addressExplorer.data.transactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-sm p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white dark:text-gray-100">
                  Transaction History
                </h4>
                <div className="text-base text-gray-600 dark:text-gray-400">
                  Showing {Math.min(25, addressExplorer.data.transactions.length)} of {addressExplorer.data.transactionCount}
                </div>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Every time Bitcoin was sent to or from this address
              </p>
              
              <div className="space-y-4">
                {addressExplorer.data.transactions.map((tx, index) => (
                  <div key={tx.txid} className="border-2 border-gray-200 dark:border-gray-600 rounded-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(tx.status)}
                        {getTypeIcon(tx.type)}
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white dark:text-gray-100">
                          {tx.type === 'received' ? 'Money Received' : 'Money Sent'}
                          </div>
                          <div className="text-base text-gray-600 dark:text-gray-400">
                          {tx.date} • {tx.status === 'confirmed' ? 'Complete' : 'Processing'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xl font-bold ${tx.type === 'received' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {tx.type === 'received' ? '+' : '-'}{formatBTC(tx.amount.btc)}
                        </div>
                        <div className="text-base text-gray-600 dark:text-gray-400">
                          {formatUSD(tx.amount.usd)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-3">
                      <span className="font-mono">
                        {AddressService.formatAddressForDisplay(tx.txid, 8)}
                      </span>
                      <button
                        onClick={() => handleCopy(tx.txid, `tx-${index}`)}
                        className="hover:text-bitcoin transition-colors duration-200"
                      >
                        {copiedItem === `tx-${index}` ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-1 inline text-bitcoin" />
                            Copied
                          </>
                        ) : 'Copy TXID'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination would go here if needed */}
              {addressExplorer.data.transactionCount > 25 && (
                <div className="mt-4 text-center">
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Showing first 25 transactions. Use a full blockchain explorer for complete history.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Transactions */}
          {addressExplorer.data.transactions.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-sm p-8 mb-6 text-center">
              <DocumentIcon className="w-14 h-14 text-bitcoin mb-4 mx-auto" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white dark:text-gray-100 mb-2">
                No Transactions Found
              </h4>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                This address has no transaction history or has not been used yet.
              </p>
            </div>
          )}

          {/* Best Practices */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-sm p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
              <LightBulbIcon className="w-8 h-8 text-bitcoin mr-3" />
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
        <div className="lg:sticky lg:top-6 space-y-6">
          {/* Explanatory Text for New Users - Moved from left column */}
          {!addressExplorer.data && (
            <div className="card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <BriefcaseIcon className="w-8 h-8 text-bitcoin mr-2" />
                What is a Bitcoin Address?
              </h3>
              <p className="text-base text-blue-800 dark:text-blue-200 mb-3">
                A Bitcoin address is like a digital mailbox where people can send you Bitcoin. It's a long string 
                of letters and numbers that starts with 1, 3, or bc1. Every address has a public record of all 
                the money sent to and from it - like a bank statement that anyone can view.
              </p>
              <p className="text-base text-blue-700 dark:text-blue-300">
                <strong>To explore an address:</strong> Enter any Bitcoin address below to see its balance and 
                transaction history. Remember, all Bitcoin transactions are public, so only look up addresses 
                you own or have permission to view.
              </p>
            </div>
          )}

          {/* What We Found Section - Moved from left column */}
          {addressExplorer.data && (
            <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3 flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-bitcoin mr-2" />
                What We Found
              </h3>
              <p className="text-base text-green-800 dark:text-green-200 leading-relaxed">
                This address has been used {addressExplorer.data.transactionCount} time{addressExplorer.data.transactionCount !== 1 ? 's' : ''} and currently 
                holds {formatBTC(addressExplorer.data.balance.btc)} ({formatUSD(addressExplorer.data.balance.usd)}). 
                {addressExplorer.data.balance.btc > 0 
                  ? " The owner can spend this Bitcoin at any time."
                  : " The address is currently empty."}
              </p>
            </div>
          )}

          {/* Educational content */}
          <EducationalSidebar sections={addressEducation} />
          
          {/* Privacy Warning moved to bottom of right pane */}
          {showPrivacyWarning && (
            <div className="card bg-bitcoin-50 dark:bg-bitcoin-900/20 border-2 border-amber-200 dark:border-amber-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <LockClosedIcon className="w-8 h-8 text-bitcoin" />
                  <div>
                    <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                      Privacy Reminder
                    </h4>
                    <p className="text-base text-amber-700 dark:text-amber-300 mb-3">
                      Looking up addresses is like looking at someone's financial records - they're public but should 
                      be treated with respect. Only look up your own addresses or ones you have permission to view.
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Your searches are not saved or tracked by this tool.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrivacyWarning(false)}
                  className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
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