# 🚀 Bitcoin Benefits 2.0: OnChain4Dummies Implementation Guide

> **Mission**: Strip away blockchain complexity. Make Bitcoin tools so simple your grandma could use them.

## 📋 Implementation Status Overview

| Feature | Status | Priority | Difficulty | Time Estimate |
|---------|--------|----------|------------|--------------|
| Transaction Status Tracker | 🟡 Not Started | **HIGH** | Medium | 3-4 days |
| Smart Fee Recommender | 🟡 Not Started | **HIGH** | Hard | 4-5 days |
| OpenTimestamps Integration | 🟡 Not Started | **MEDIUM** | Medium | 3-4 days |
| Wallet Activity Summary | 🟡 Not Started | **MEDIUM** | Easy | 2-3 days |
| Network Pulse | 🟡 Not Started | **HIGH** | Easy | 1-2 days |
| UTXO Optimizer | 🟡 Not Started | LOW | Hard | 5-6 days |
| Lightning Network Gateway | 🟡 Not Started | LOW | Medium | 3-4 days |
| Multi-Sig Helper | 🟡 Not Started | LOW | Hard | 5-6 days |

**Status Legend:** 
- 🟢 Complete
- 🟡 Not Started  
- 🔵 In Progress
- 🔴 Blocked

---

## 🏗️ Phase 1: Core Infrastructure Setup (Week 1)

### ✅ Task Checklist

#### Dependencies Installation
- [ ] Install mempool.js client
- [ ] Install OpenTimestamps library
- [ ] Install bitcoinjs-lib
- [ ] Install WebSocket client
- [ ] Install Lightning bolt11 decoder
- [ ] Update TypeScript types

```bash
# Run this command to install all dependencies
npm install @mempool/mempool.js opentimestamps bitcoinjs-lib ws bolt11 @types/ws
```

#### Project Structure Setup
- [ ] Create services directory structure
- [ ] Setup API client configurations  
- [ ] Create shared types/interfaces
- [ ] Setup error handling utilities
- [ ] Configure environment variables

```bash
# Create directory structure
mkdir -p src/services/{bitcoin-rpc,mempool-api,timestamp-service,fee-oracle,network-pulse}
mkdir -p src/components/{tx-status,fee-selector,wallet-viewer,network-health,lightning}
mkdir -p src/types
mkdir -p src/utils
```

### 📁 Core Configuration Files

#### `src/config/api.config.ts`
```typescript
export const API_CONFIG = {
  mempool: {
    baseUrl: process.env.NEXT_PUBLIC_MEMPOOL_API || 'https://mempool.space/api',
    wsUrl: process.env.NEXT_PUBLIC_MEMPOOL_WS || 'wss://ws.mempool.space',
    timeout: 10000,
    retries: 3
  },
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY
  },
  opentimestamps: {
    servers: [
      'https://alice.btc.calendar.opentimestamps.org',
      'https://bob.btc.calendar.opentimestamps.org'
    ]
  },
  caching: {
    txStatus: 30, // seconds
    feeEstimates: 60,
    addressBalance: 120,
    networkHealth: 10
  }
};
```

#### `src/types/bitcoin.types.ts`
```typescript
// Core type definitions for the entire project
export interface Transaction {
  txid: string;
  status: TxStatus;
  fee: number;
  size: number;
  weight: number;
  value: number;
  blockHeight?: number;
  blockTime?: number;
  confirmations: number;
}

export interface TxStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export interface FeeEstimate {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface AddressInfo {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

export interface NetworkHealth {
  difficulty: number;
  hashrate: number;
  mempoolSize: number;
  mempoolBytes: number;
  nextBlockETA: number;
  currentFeeEnvironment: 'low' | 'normal' | 'high' | 'extreme';
}
```

---

## 📦 Feature 1: Transaction Status Tracker

### Implementation Checklist
- [ ] Create Mempool API service
- [ ] Build transaction status component
- [ ] Add TXID validation
- [ ] Implement caching layer
- [ ] Add real-time updates via WebSocket
- [ ] Create status display animations
- [ ] Add copy/share functionality
- [ ] Write unit tests

### `src/services/mempool-api/tx-tracker.ts`
```typescript
import { mempoolJS } from '@mempool/mempool.js';
import { API_CONFIG } from '@/config/api.config';

export class TransactionTracker {
  private mempool: ReturnType<typeof mempoolJS>;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor() {
    const { hostname, pathname } = new URL(API_CONFIG.mempool.baseUrl);
    this.mempool = mempoolJS({
      hostname,
      network: pathname.includes('testnet') ? 'testnet' : 'main'
    });
  }

  async getTransactionStatus(txid: string): Promise<TransactionStatusResponse> {
    // Validate TXID format
    if (!this.isValidTxid(txid)) {
      throw new Error('Invalid transaction ID format');
    }

    // Check cache first
    const cached = this.getCached(txid);
    if (cached) return cached;

    try {
      // Fetch transaction details
      const [tx, status] = await Promise.all([
        this.mempool.bitcoin.transactions.getTx({ txid }),
        this.mempool.bitcoin.transactions.getTxStatus({ txid })
      ]);

      // Calculate human-readable values
      const result = this.formatTransactionStatus(tx, status);
      
      // Cache the result
      this.setCached(txid, result);
      
      return result;
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      throw new Error('Transaction not found or network error');
    }
  }

  private formatTransactionStatus(tx: any, status: any): TransactionStatusResponse {
    const now = Date.now();
    const isConfirmed = status.confirmed;
    
    return {
      txid: tx.txid,
      status: isConfirmed ? 'confirmed' : 'pending',
      confirmations: status.block_height ? 
        (this.getCurrentBlockHeight() - status.block_height + 1) : 0,
      blockHeight: status.block_height,
      blockTime: status.block_time,
      timeAgo: this.getTimeAgo(status.block_time || tx.firstSeen),
      fee: {
        total: tx.fee,
        rate: Math.round(tx.fee / (tx.weight / 4)),
        btc: tx.fee / 100000000,
        usd: this.convertToUSD(tx.fee / 100000000)
      },
      size: tx.size,
      weight: tx.weight,
      value: {
        btc: tx.value / 100000000,
        usd: this.convertToUSD(tx.value / 100000000)
      },
      inputs: tx.vin.length,
      outputs: tx.vout.length,
      estimatedConfirmation: !isConfirmed ? 
        this.estimateConfirmationTime(tx.fee / (tx.weight / 4)) : null
    };
  }

  private isValidTxid(txid: string): boolean {
    return /^[a-fA-F0-9]{64}$/.test(txid);
  }

  private getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  private estimateConfirmationTime(feeRate: number): string {
    // Implement fee-based confirmation time estimation
    if (feeRate > 100) return 'Next block (~10 minutes)';
    if (feeRate > 50) return '2-3 blocks (~30 minutes)';
    if (feeRate > 20) return '4-6 blocks (~1 hour)';
    return 'May take several hours';
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > API_CONFIG.caching.txStatus * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCurrentBlockHeight(): number {
    // This should be fetched from the API and cached
    return 870000; // Placeholder
  }

  private convertToUSD(btc: number): number {
    // This should use real BTC price from your existing service
    const btcPrice = 95000; // Placeholder
    return Number((btc * btcPrice).toFixed(2));
  }
}

export interface TransactionStatusResponse {
  txid: string;
  status: 'confirmed' | 'pending' | 'dropped';
  confirmations: number;
  blockHeight?: number;
  blockTime?: number;
  timeAgo: string;
  fee: {
    total: number;
    rate: number;
    btc: number;
    usd: number;
  };
  size: number;
  weight: number;
  value: {
    btc: number;
    usd: number;
  };
  inputs: number;
  outputs: number;
  estimatedConfirmation: string | null;
}
```

### `src/components/tx-status/TransactionStatus.tsx`
```tsx
'use client';

import { useState } from 'react';
import { TransactionTracker } from '@/services/mempool-api/tx-tracker';
import { Copy, Check, Search, ExternalLink } from 'lucide-react';

export function TransactionStatus() {
  const [txid, setTxid] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tracker = new TransactionTracker();

  const handleSearch = async () => {
    if (!txid.trim()) {
      setError('Please enter a transaction ID');
      return;
    }

    setLoading(true);
    setError('');
    setStatus(null);

    try {
      const result = await tracker.getTransactionStatus(txid.trim());
      setStatus(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transaction');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = () => {
    if (!status) return null;
    if (status.status === 'confirmed') {
      return <div className="text-green-500 text-4xl">✅</div>;
    }
    if (status.status === 'pending') {
      return <div className="text-yellow-500 text-4xl animate-pulse">⏳</div>;
    }
    return <div className="text-red-500 text-4xl">❌</div>;
  };

  const getStatusColor = () => {
    if (status?.status === 'confirmed') return 'bg-green-50 border-green-200';
    if (status?.status === 'pending') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Transaction Status Checker
        </h2>

        {/* Search Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Paste transaction ID (TXID)..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Status Display */}
        {status && (
          <div className={`border-2 rounded-xl p-6 ${getStatusColor()}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div>
                  <h3 className="text-xl font-semibold">
                    {status.status === 'confirmed' ? 'Confirmed' : 
                     status.status === 'pending' ? 'Pending' : 'Dropped'}
                  </h3>
                  <p className="text-gray-600">{status.timeAgo}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(status.txid)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {status.status === 'confirmed' && (
                <>
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Block Height</div>
                    <div className="font-semibold">{status.blockHeight?.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Confirmations</div>
                    <div className="font-semibold">{status.confirmations}</div>
                  </div>
                </>
              )}
              
              {status.status === 'pending' && (
                <div className="bg-white/70 rounded-lg p-3 md:col-span-2">
                  <div className="text-sm text-gray-500">Estimated Confirmation</div>
                  <div className="font-semibold">{status.estimatedConfirmation}</div>
                </div>
              )}

              <div className="bg-white/70 rounded-lg p-3">
                <div className="text-sm text-gray-500">Transaction Fee</div>
                <div className="font-semibold">
                  {status.fee.btc.toFixed(8)} BTC
                  <span className="text-sm text-gray-500 ml-2">
                    (${status.fee.usd})
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {status.fee.rate} sat/vB
                </div>
              </div>

              <div className="bg-white/70 rounded-lg p-3">
                <div className="text-sm text-gray-500">Transaction Value</div>
                <div className="font-semibold">
                  {status.value.btc.toFixed(8)} BTC
                  <span className="text-sm text-gray-500 ml-2">
                    (${status.value.usd.toLocaleString()})
                  </span>
                </div>
              </div>

              <div className="bg-white/70 rounded-lg p-3">
                <div className="text-sm text-gray-500">Size</div>
                <div className="font-semibold">
                  {status.size} bytes / {status.weight} WU
                </div>
              </div>

              <div className="bg-white/70 rounded-lg p-3">
                <div className="text-sm text-gray-500">Inputs / Outputs</div>
                <div className="font-semibold">
                  {status.inputs} → {status.outputs}
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
              <a
                href={`https://mempool.space/tx/${status.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                View on Mempool.space
              </a>
              <a
                href={`https://blockstream.info/tx/${status.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                View on Blockstream
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 💰 Feature 2: Smart Fee Recommender

### Implementation Checklist
- [ ] Create fee estimation service
- [ ] Build ML-based prediction model
- [ ] Create simple toggle UI
- [ ] Add transaction size calculator
- [ ] Implement fee history analysis
- [ ] Add savings calculator
- [ ] Create visual fee trends
- [ ] Write integration tests

### `src/services/fee-oracle/smart-fees.ts`
```typescript
import { mempoolJS } from '@mempool/mempool.js';

export class SmartFeeRecommender {
  private mempool: ReturnType<typeof mempoolJS>;
  private feeHistory: FeeDataPoint[] = [];
  private predictions: Map<string, FeePrediction> = new Map();

  constructor() {
    this.mempool = mempoolJS({ hostname: 'mempool.space' });
    this.startFeeTracking();
  }

  async getSmartFees(txSize: number = 250): Promise<FeeRecommendation[]> {
    try {
      // Get current fee estimates
      const fees = await this.mempool.bitcoin.fees.getFeesRecommended();
      
      // Get mempool blocks for better prediction
      const mempoolBlocks = await this.mempool.bitcoin.fees.getMempoolBlocks();
      
      // Calculate intelligent recommendations
      return this.calculateRecommendations(fees, mempoolBlocks, txSize);
    } catch (error) {
      console.error('Failed to get fee recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  private calculateRecommendations(
    fees: any, 
    mempoolBlocks: any[], 
    txSize: number
  ): FeeRecommendation[] {
    const btcPrice = this.getBTCPrice();
    
    return [
      {
        level: 'economy',
        label: 'Save Money 🐢',
        timeEstimate: this.estimateTime(fees.economyFee, mempoolBlocks),
        satPerVByte: fees.economyFee,
        totalCost: {
          sats: fees.economyFee * txSize,
          btc: (fees.economyFee * txSize) / 100000000,
          usd: ((fees.economyFee * txSize) / 100000000) * btcPrice
        },
        reliability: this.calculateReliability(fees.economyFee, mempoolBlocks),
        savings: {
          percent: 100 - (fees.economyFee / fees.fastestFee * 100),
          usd: ((fees.fastestFee - fees.economyFee) * txSize / 100000000) * btcPrice
        }
      },
      {
        level: 'normal',
        label: 'Balanced ⚖️',
        timeEstimate: this.estimateTime(fees.halfHourFee, mempoolBlocks),
        satPerVByte: fees.halfHourFee,
        totalCost: {
          sats: fees.halfHourFee * txSize,
          btc: (fees.halfHourFee * txSize) / 100000000,
          usd: ((fees.halfHourFee * txSize) / 100000000) * btcPrice
        },
        reliability: this.calculateReliability(fees.halfHourFee, mempoolBlocks),
        savings: {
          percent: 100 - (fees.halfHourFee / fees.fastestFee * 100),
          usd: ((fees.fastestFee - fees.halfHourFee) * txSize / 100000000) * btcPrice
        }
      },
      {
        level: 'priority',
        label: 'Fast 🚀',
        timeEstimate: '~10 minutes',
        satPerVByte: fees.fastestFee,
        totalCost: {
          sats: fees.fastestFee * txSize,
          btc: (fees.fastestFee * txSize) / 100000000,
          usd: ((fees.fastestFee * txSize) / 100000000) * btcPrice
        },
        reliability: 99,
        savings: {
          percent: 0,
          usd: 0
        }
      }
    ];
  }

  private estimateTime(feeRate: number, mempoolBlocks: any[]): string {
    let totalSize = 0;
    let blockCount = 0;
    
    for (const block of mempoolBlocks) {
      totalSize += block.blockSize;
      if (block.medianFee <= feeRate) {
        blockCount++;
        if (totalSize >= 1000000) break; // 1MB
      }
    }
    
    if (blockCount === 0) return 'Next block';
    if (blockCount === 1) return '~10 minutes';
    if (blockCount <= 3) return '~30 minutes';
    if (blockCount <= 6) return '~1 hour';
    return `~${Math.ceil(blockCount / 6)} hours`;
  }

  private calculateReliability(feeRate: number, mempoolBlocks: any[]): number {
    // Calculate probability of confirmation based on mempool analysis
    const totalTxs = mempoolBlocks.reduce((sum, block) => sum + block.nTx, 0);
    const higherFeeTxs = mempoolBlocks
      .filter(block => block.medianFee > feeRate)
      .reduce((sum, block) => sum + block.nTx, 0);
    
    const position = 1 - (higherFeeTxs / totalTxs);
    return Math.round(position * 100);
  }

  private startFeeTracking(): void {
    // Track fee history for better predictions
    setInterval(async () => {
      try {
        const fees = await this.mempool.bitcoin.fees.getFeesRecommended();
        this.feeHistory.push({
          timestamp: Date.now(),
          fees: fees,
          mempoolSize: await this.getMempoolSize()
        });
        
        // Keep only last 24 hours
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        this.feeHistory = this.feeHistory.filter(f => f.timestamp > cutoff);
      } catch (error) {
        console.error('Failed to track fees:', error);
      }
    }, 60000); // Every minute
  }

  private async getMempoolSize(): Promise<number> {
    try {
      const mempool = await this.mempool.bitcoin.mempool.getMempool();
      return mempool.size;
    } catch {
      return 0;
    }
  }

  private getBTCPrice(): number {
    // Get from your existing price service
    return 95000;
  }

  private getFallbackRecommendations(): FeeRecommendation[] {
    // Fallback if API fails
    return [
      {
        level: 'economy',
        label: 'Save Money 🐢',
        timeEstimate: '2-4 hours',
        satPerVByte: 10,
        totalCost: { sats: 2500, btc: 0.000025, usd: 2.38 },
        reliability: 70,
        savings: { percent: 80, usd: 7.12 }
      },
      {
        level: 'normal',
        label: 'Balanced ⚖️',
        timeEstimate: '~30 minutes',
        satPerVByte: 25,
        totalCost: { sats: 6250, btc: 0.0000625, usd: 5.94 },
        reliability: 90,
        savings: { percent: 50, usd: 3.56 }
      },
      {
        level: 'priority',
        label: 'Fast 🚀',
        timeEstimate: 'Next block',
        satPerVByte: 50,
        totalCost: { sats: 12500, btc: 0.000125, usd: 11.88 },
        reliability: 99,
        savings: { percent: 0, usd: 0 }
      }
    ];
  }

  async predictNextBlockFees(): Promise<FeePrediction> {
    // ML-based prediction using historical data
    if (this.feeHistory.length < 10) {
      return { 
        nextBlock: 50, 
        confidence: 0.5,
        trend: 'stable'
      };
    }

    // Simple moving average for now
    const recent = this.feeHistory.slice(-10);
    const avgFee = recent.reduce((sum, f) => sum + f.fees.fastestFee, 0) / recent.length;
    const trend = this.calculateTrend(recent);
    
    return {
      nextBlock: Math.round(avgFee * (trend === 'up' ? 1.1 : trend === 'down' ? 0.9 : 1)),
      confidence: 0.75,
      trend
    };
  }

  private calculateTrend(data: FeeDataPoint[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const first = data[0].fees.fastestFee;
    const last = data[data.length - 1].fees.fastestFee;
    const change = (last - first) / first;
    
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
  }
}

// Type definitions
export interface FeeRecommendation {
  level: 'economy' | 'normal' | 'priority';
  label: string;
  timeEstimate: string;
  satPerVByte: number;
  totalCost: {
    sats: number;
    btc: number;
    usd: number;
  };
  reliability: number;
  savings: {
    percent: number;
    usd: number;
  };
}

interface FeeDataPoint {
  timestamp: number;
  fees: any;
  mempoolSize: number;
}

interface FeePrediction {
  nextBlock: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}
```

### `src/components/fee-selector/SmartFeeSelector.tsx`
```tsx
'use client';

import { useState, useEffect } from 'react';
import { SmartFeeRecommender, FeeRecommendation } from '@/services/fee-oracle/smart-fees';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export function SmartFeeSelector() {
  const [fees, setFees] = useState<FeeRecommendation[]>([]);
  const [selected, setSelected] = useState<'economy' | 'normal' | 'priority'>('normal');
  const [txSize, setTxSize] = useState(250);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const recommender = new SmartFeeRecommender();

  useEffect(() => {
    loadFees();
    const interval = setInterval(loadFees, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [txSize]);

  const loadFees = async () => {
    try {
      const [recommendations, nextBlockPrediction] = await Promise.all([
        recommender.getSmartFees(txSize),
        recommender.predictNextBlockFees()
      ]);
      setFees(recommendations);
      setPrediction(nextBlockPrediction);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load fees:', error);
      setLoading(false);
    }
  };

  const selectedFee = fees.find(f => f.level === selected);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Smart Fee Recommender
          </h2>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        {/* Fee Trend Indicator */}
        {prediction && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {prediction.trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500" />}
              {prediction.trend === 'down' && <TrendingDown className="w-5 h-5 text-green-500" />}
              {prediction.trend === 'stable' && <Minus className="w-5 h-5 text-gray-500" />}
              <span className="text-sm font-medium">
                Fee trend: {prediction.trend}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Next block: ~{prediction.nextBlock} sat/vB
              <span className="ml-2 text-xs">
                ({Math.round(prediction.confidence * 100)}% confidence)
              </span>
            </div>
          </div>
        )}

        {/* Fee Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {fees.map((fee) => (
            <button
              key={fee.level}
              onClick={() => setSelected(fee.level)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selected === fee.level
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{fee.label}</div>
              <div className="text-lg font-bold mb-1">
                ${fee.totalCost.usd.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {fee.timeEstimate}
              </div>
              <div className="text-xs text-gray-500">
                {fee.reliability}% reliable
              </div>
              {fee.savings.percent > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  Save {fee.savings.percent.toFixed(0)}% (${fee.savings.usd.toFixed(2)})
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selected Fee Details */}
        {selectedFee && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">You'll pay</div>
                <div className="text-2xl font-bold">
                  ${selectedFee.totalCost.usd.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedFee.totalCost.btc.toFixed(8)} BTC
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Confirmation time</div>
                <div className="text-lg font-semibold">
                  {selectedFee.timeEstimate}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedFee.reliability}% reliability
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Advanced Settings</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Size (vBytes)
              </label>
              <input
                type="number"
                value={txSize}
                onChange={(e) => setTxSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="100"
                max="2000"
              />
              <div className="text-xs text-gray-500 mt-1">
                Typical: 250 vB (1 input, 2 outputs)
              </div>
            </div>

            {selectedFee && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fee Rate:</span>
                  <span className="font-mono">{selectedFee.satPerVByte} sat/vB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Sats:</span>
                  <span className="font-mono">{selectedFee.totalCost.sats.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weight Units:</span>
                  <span className="font-mono">{txSize * 4} WU</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔐 Feature 3: OpenTimestamps Integration

### Implementation Checklist
- [ ] Setup OpenTimestamps client
- [ ] Create timestamp verification service
- [ ] Build proof generation flow
- [ ] Add proof download feature
- [ ] Create visual proof display
- [ ] Implement batch timestamping
- [ ] Add proof storage
- [ ] Write verification tests

### `src/services/timestamp-service/ots-handler.ts`
```typescript
import * as OpenTimestamps from 'opentimestamps';

export class TimestampService {
  private calendars = [
    'https://alice.btc.calendar.opentimestamps.org',
    'https://bob.btc.calendar.opentimestamps.org',
    'https://finney.calendar.eternitywall.com'
  ];

  async verifyTimestamp(data: string): Promise<TimestampVerification> {
    try {
      // Check if it's a transaction ID
      if (this.isTxid(data)) {
        return this.verifyTxid(data);
      }
      
      // Check if it's an OTS proof file
      if (this.isOtsProof(data)) {
        return this.verifyProof(data);
      }
      
      // Otherwise, hash the data and check
      return this.verifyData(data);
    } catch (error) {
      console.error('Verification failed:', error);
      return {
        verified: false,
        error: 'Failed to verify timestamp'
      };
    }
  }

  async createTimestamp(data: string): Promise<TimestampCreation> {
    try {
      // Create detached timestamp
      const detached = OpenTimestamps.DetachedTimestampFile
        .fromBytes(new TextEncoder().encode(data));
      
      // Submit to calendar servers
      await OpenTimestamps.stamp(detached, this.calendars);
      
      // Get the proof
      const otsProof = detached.serializeToBytes();
      const base64Proof = Buffer.from(otsProof).toString('base64');
      
      return {
        success: true,
        proof: base64Proof,
        hash: this.getHash(data),
        timestamp: new Date().toISOString(),
        instructions: 'Save this proof. You\'ll need it to verify your timestamp later.'
      };
    } catch (error) {
      console.error('Failed to create timestamp:', error);
      return {
        success: false,
        error: 'Failed to create timestamp'
      };
    }
  }

  async upgradeProof(proofData: string): Promise<UpgradeResult> {
    try {
      const proofBytes = Buffer.from(proofData, 'base64');
      const detached = OpenTimestamps.DetachedTimestampFile
        .deserialize(proofBytes);
      
      // Try to upgrade incomplete timestamp
      const upgraded = await OpenTimestamps.upgrade(detached, this.calendars);
      
      if (upgraded) {
        const upgradedProof = detached.serializeToBytes();
        return {
          upgraded: true,
          proof: Buffer.from(upgradedProof).toString('base64'),
          attestations: this.getAttestations(detached)
        };
      }
      
      return {
        upgraded: false,
        message: 'Proof is already complete or cannot be upgraded yet'
      };
    } catch (error) {
      console.error('Failed to upgrade proof:', error);
      return {
        upgraded: false,
        error: 'Failed to upgrade proof'
      };
    }
  }

  private async verifyTxid(txid: string): Promise<TimestampVerification> {
    // Check if this transaction has been timestamped
    try {
      // Query OTS calendar servers for this txid
      const response = await fetch(
        `${this.calendars[0]}/timestamp/${txid}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          verified: true,
          type: 'transaction',
          blockHeight: data.blockHeight,
          blockTime: data.blockTime,
          attestations: data.attestations
        };
      }
      
      return {
        verified: false,
        message: 'No timestamp found for this transaction'
      };
    } catch (error) {
      return {
        verified: false,
        error: 'Failed to check transaction timestamp'
      };
    }
  }

  private async verifyProof(proofData: string): Promise<TimestampVerification> {
    try {
      const proofBytes = Buffer.from(proofData, 'base64');
      const detached = OpenTimestamps.DetachedTimestampFile
        .deserialize(proofBytes);
      
      // Verify the timestamp
      const results = await OpenTimestamps.verify(detached, this.calendars);
      
      if (results.length > 0) {
        const attestation = results[0];
        return {
          verified: true,
          type: 'proof',
          blockHeight: attestation.height,
          blockTime: attestation.timestamp,
          hash: Buffer.from(detached.fileHash()).toString('hex'),
          attestations: results
        };
      }
      
      return {
        verified: false,
        message: 'Proof is valid but not yet confirmed on Bitcoin'
      };
    } catch (error) {
      return {
        verified: false,
        error: 'Invalid proof format'
      };
    }
  }

  private async verifyData(data: string): Promise<TimestampVerification> {
    // Hash the data and check if it's been timestamped
    const hash = this.getHash(data);
    
    try {
      const response = await fetch(
        `${this.calendars[0]}/timestamp/${hash}`
      );
      
      if (response.ok) {
        const result = await response.json();
        return {
          verified: true,
          type: 'data',
          hash: hash,
          blockHeight: result.blockHeight,
          blockTime: result.blockTime,
          attestations: result.attestations
        };
      }
      
      return {
        verified: false,
        message: 'No timestamp found for this data'
      };
    } catch (error) {
      return {
        verified: false,
        error: 'Failed to verify data timestamp'
      };
    }
  }

  private isTxid(data: string): boolean {
    return /^[a-fA-F0-9]{64}$/.test(data);
  }

  private isOtsProof(data: string): boolean {
    try {
      const decoded = Buffer.from(data, 'base64');
      return decoded[0] === 0x00 && decoded[1] === 0x4f; // OTS magic bytes
    } catch {
      return false;
    }
  }

  private getHash(data: string): string {
    // Use Web Crypto API to hash
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    return this.sha256(dataBuffer);
  }

  private async sha256(data: Uint8Array): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getAttestations(detached: any): any[] {
    // Extract attestation information from the proof
    const attestations = [];
    // Implementation depends on OpenTimestamps library structure
    return attestations;
  }

  downloadProof(proofData: string, filename: string = 'timestamp.ots'): void {
    const blob = new Blob([Buffer.from(proofData, 'base64')], {
      type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Type definitions
export interface TimestampVerification {
  verified: boolean;
  type?: 'transaction' | 'proof' | 'data';
  blockHeight?: number;
  blockTime?: number;
  hash?: string;
  attestations?: any[];
  message?: string;
  error?: string;
}

export interface TimestampCreation {
  success: boolean;
  proof?: string;
  hash?: string;
  timestamp?: string;
  instructions?: string;
  error?: string;
}

export interface UpgradeResult {
  upgraded: boolean;
  proof?: string;
  attestations?: any[];
  message?: string;
  error?: string;
}
```

---

## 📊 Feature 4: Wallet Activity Summary

### Implementation Checklist
- [ ] Create address lookup service
- [ ] Build activity analyzer
- [ ] Create balance display component
- [ ] Add transaction timeline
- [ ] Implement activity categorization
- [ ] Add risk scoring
- [ ] Create export functionality
- [ ] Write address validation tests

### `src/services/wallet-viewer/address-analyzer.ts`
```typescript
import { mempoolJS } from '@mempool/mempool.js';

export class WalletAnalyzer {
  private mempool: ReturnType<typeof mempoolJS>;
  private cache = new Map<string, any>();

  constructor() {
    this.mempool = mempoolJS({ hostname: 'mempool.space' });
  }

  async analyzeAddress(address: string): Promise<WalletSummary> {
    try {
      // Validate address format
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid Bitcoin address format');
      }

      // Get address info and transactions
      const [addressInfo, transactions] = await Promise.all([
        this.mempool.bitcoin.addresses.getAddress({ address }),
        this.mempool.bitcoin.addresses.getAddressTxs({ address })
      ]);

      // Analyze the data
      return this.createWalletSummary(addressInfo, transactions);
    } catch (error) {
      console.error('Failed to analyze address:', error);
      throw error;
    }
  }

  private createWalletSummary(info: any, txs: any[]): WalletSummary {
    const btcPrice = this.getBTCPrice();
    const balance = (info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum) / 100000000;
    
    return {
      address: info.address,
      balance: {
        btc: balance,
        usd: balance * btcPrice
      },
      transactions: {
        total: info.chain_stats.tx_count,
        received: info.chain_stats.funded_txo_count,
        sent: info.chain_stats.spent_txo_count
      },
      lastActivity: this.getLastActivity(txs),
      activityLevel: this.categorizeActivity(txs),
      riskScore: this.calculateRiskScore(info, txs),
      timeline: this.createTimeline(txs),
      stats: {
        totalReceived: info.chain_stats.funded_txo_sum / 100000000,
        totalSent: info.chain_stats.spent_txo_sum / 100000000,
        averageTxValue: this.calculateAverageTxValue(txs),
        largestTx: this.findLargestTx(txs)
      }
    };
  }

  private categorizeActivity(txs: any[]): ActivityLevel {
    if (txs.length === 0) return 'dormant';
    
    const thirtyDaysAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;
    const recentTxs = txs.filter(tx => 
      (tx.status.block_time || Date.now() / 1000) > thirtyDaysAgo
    );
    
    if (recentTxs.length === 0) return 'dormant';
    if (recentTxs.length < 5) return 'occasional';
    if (recentTxs.length < 20) return 'active';
    return 'very-active';
  }

  private calculateRiskScore(info: any, txs: any[]): number {
    let score = 0;
    
    // High value transactions increase risk
    const highValueTxs = txs.filter(tx => tx.value > 100000000); // > 1 BTC
    score += highValueTxs.length * 5;
    
    // Very new addresses are higher risk
    const ageInDays = (Date.now() / 1000 - txs[0]?.status.block_time) / 86400;
    if (ageInDays < 7) score += 20;
    else if (ageInDays < 30) score += 10;
    
    // High transaction frequency
    const txPerDay = txs.length / Math.max(ageInDays, 1);
    if (txPerDay > 10) score += 30;
    else if (txPerDay > 5) score += 15;
    
    return Math.min(score, 100);
  }

  private createTimeline(txs: any[]): TimelineItem[] {
    return txs.slice(0, 20).map(tx => ({
      txid: tx.txid,
      type: this.determineTransactionType(tx),
      amount: Math.abs(tx.value) / 100000000,
      fee: tx.fee / 100000000,
      time: tx.status.block_time || Date.now() / 1000,
      confirmations: tx.status.confirmed ? 
        (this.getCurrentBlockHeight() - tx.status.block_height + 1) : 0,
      status: tx.status.confirmed ? 'confirmed' : 'pending'
    }));
  }

  private determineTransactionType(tx: any): 'in' | 'out' | 'self' {
    // Simplified - would need more logic for accurate determination
    return tx.value > 0 ? 'in' : 'out';
  }

  private getLastActivity(txs: any[]): Date | null {
    if (txs.length === 0) return null;
    const lastTx = txs[0];
    return new Date((lastTx.status.block_time || Date.now() / 1000) * 1000);
  }

  private calculateAverageTxValue(txs: any[]): number {
    if (txs.length === 0) return 0;
    const total = txs.reduce((sum, tx) => sum + Math.abs(tx.value), 0);
    return total / txs.length / 100000000;
  }

  private findLargestTx(txs: any[]): number {
    if (txs.length === 0) return 0;
    return Math.max(...txs.map(tx => Math.abs(tx.value))) / 100000000;
  }

  private isValidAddress(address: string): boolean {
    // Basic validation - implement full validation
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || // Legacy
           /^bc1[a-z0-9]{39,59}$/.test(address); // SegWit
  }

  private getCurrentBlockHeight(): number {
    // Should be fetched and cached
    return 870000;
  }

  private getBTCPrice(): number {
    // Get from your price service
    return 95000;
  }
}

// Type definitions
export interface WalletSummary {
  address: string;
  balance: {
    btc: number;
    usd: number;
  };
  transactions: {
    total: number;
    received: number;
    sent: number;
  };
  lastActivity: Date | null;
  activityLevel: ActivityLevel;
  riskScore: number;
  timeline: TimelineItem[];
  stats: {
    totalReceived: number;
    totalSent: number;
    averageTxValue: number;
    largestTx: number;
  };
}

export type ActivityLevel = 'dormant' | 'occasional' | 'active' | 'very-active';

export interface TimelineItem {
  txid: string;
  type: 'in' | 'out' | 'self';
  amount: number;
  fee: number;
  time: number;
  confirmations: number;
  status: 'confirmed' | 'pending';
}
```

---

## 🚦 Feature 5: Network Pulse

### Implementation Checklist
- [ ] Create WebSocket connection manager
- [ ] Build network health monitor
- [ ] Create traffic light UI component
- [ ] Add block countdown timer
- [ ] Implement mempool visualization
- [ ] Add hashrate tracker
- [ ] Create network alerts
- [ ] Write WebSocket tests

### `src/services/network-pulse/health-monitor.ts`
```typescript
export class NetworkHealthMonitor {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private currentHealth: NetworkHealth | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket('wss://ws.mempool.space/api/v1/ws');
      
      this.ws.onopen = () => {
        console.log('Connected to mempool WebSocket');
        this.reconnectAttempts = 0;
        this.subscribeToUpdates();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
    }
  }

  private subscribeToUpdates(): void {
    if (!this.ws) return;
    
    // Subscribe to relevant data
    this.ws.send(JSON.stringify({ action: 'init' }));
    this.ws.send(JSON.stringify({ action: 'want', data: ['blocks', 'mempool-blocks', 'stats'] }));
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'block':
        this.handleNewBlock(message.data);
        break;
      case 'mempool-blocks':
        this.handleMempoolUpdate(message.data);
        break;
      case 'stats':
        this.handleStatsUpdate(message.data);
        break;
    }
    
    this.updateHealth();
  }

  private handleNewBlock(block: any): void {
    this.emit('block', block);
    this.updateNextBlockEstimate();
  }

  private handleMempoolUpdate(mempoolBlocks: any): void {
    this.emit('mempool', mempoolBlocks);
  }

  private handleStatsUpdate(stats: any): void {
    this.emit('stats', stats);
  }

  private updateHealth(): void {
    // Calculate network health based on current data
    // This would use real data from WebSocket
    this.currentHealth = {
      status: this.calculateStatus(),
      nextBlock: this.estimateNextBlock(),
      mempoolSize: this.getMempoolSize(),
      feeEnvironment: this.calculateFeeEnvironment(),
      hashrate: this.getHashrate(),
      difficulty: this.getDifficulty(),
      blockHeight: this.getBlockHeight()
    };
    
    this.emit('health-update', this.currentHealth);
  }

  private calculateStatus(): 'healthy' | 'congested' | 'critical' {
    const mempoolSize = this.getMempoolSize();
    if (mempoolSize.mb < 50) return 'healthy';
    if (mempoolSize.mb < 200) return 'congested';
    return 'critical';
  }

  private estimateNextBlock(): { minutes: number; confidence: number } {
    // Calculate based on recent block times
    return {
      minutes: 10,
      confidence: 0.8
    };
  }

  private getMempoolSize(): { mb: number; txCount: number; vsize: number } {
    // Get from WebSocket data
    return {
      mb: 45,
      txCount: 15000,
      vsize: 45000000
    };
  }

  private calculateFeeEnvironment(): 'low' | 'normal' | 'high' | 'extreme' {
    // Based on current mempool state
    const size = this.getMempoolSize();
    if (size.mb < 10) return 'low';
    if (size.mb < 50) return 'normal';
    if (size.mb < 200) return 'high';
    return 'extreme';
  }

  private getHashrate(): { current: number; unit: string; trend: 'up' | 'down' | 'stable' } {
    return {
      current: 450,
      unit: 'EH/s',
      trend: 'stable'
    };
  }

  private getDifficulty(): number {
    return 72.01; // Trillion
  }

  private getBlockHeight(): number {
    return 870000;
  }

  private updateNextBlockEstimate(): void {
    // Update countdown timer
    const estimate = this.estimateNextBlock();
    this.emit('next-block-update', estimate);
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  getCurrentHealth(): NetworkHealth | null {
    return this.currentHealth;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Type definitions
export interface NetworkHealth {
  status: 'healthy' | 'congested' | 'critical';
  nextBlock: {
    minutes: number;
    confidence: number;
  };
  mempoolSize: {
    mb: number;
    txCount: number;
    vsize: number;
  };
  feeEnvironment: 'low' | 'normal' | 'high' | 'extreme';
  hashrate: {
    current: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  };
  difficulty: number;
  blockHeight: number;
}
```

---

## 🎯 Integration & Testing Plan

### Phase 1 Testing Checklist
- [ ] Unit tests for all services
- [ ] Component integration tests
- [ ] API endpoint testing
- [ ] WebSocket connection testing
- [ ] Error handling verification
- [ ] Performance benchmarking

### `src/tests/services/transaction-tracker.test.ts`
```typescript
import { TransactionTracker } from '@/services/mempool-api/tx-tracker';

describe('TransactionTracker', () => {
  let tracker: TransactionTracker;

  beforeEach(() => {
    tracker = new TransactionTracker();
  });

  test('validates transaction ID format', () => {
    const validTxid = 'a'.repeat(64);
    const invalidTxid = 'xyz123';
    
    expect(() => tracker.getTransactionStatus(validTxid))
      .not.toThrow();
    expect(() => tracker.getTransactionStatus(invalidTxid))
      .toThrow('Invalid transaction ID format');
  });

  test('returns correct status for confirmed transaction', async () => {
    const txid = 'test-confirmed-txid';
    const status = await tracker.getTransactionStatus(txid);
    
    expect(status.status).toBe('confirmed');
    expect(status.confirmations).toBeGreaterThan(0);
    expect(status.blockHeight).toBeDefined();
  });

  test('returns correct status for pending transaction', async () => {
    const txid = 'test-pending-txid';
    const status = await tracker.getTransactionStatus(txid);
    
    expect(status.status).toBe('pending');
    expect(status.confirmations).toBe(0);
    expect(status.estimatedConfirmation).toBeDefined();
  });

  test('caches transaction results', async () => {
    const txid = 'test-cached-txid';
    
    const start = Date.now();
    await tracker.getTransactionStatus(txid);
    const firstCallTime = Date.now() - start;
    
    const cachedStart = Date.now();
    await tracker.getTransactionStatus(txid);
    const cachedCallTime = Date.now() - cachedStart;
    
    expect(cachedCallTime).toBeLessThan(firstCallTime / 2);
  });
});
```

---

## 📱 Mobile Optimization Checklist

- [ ] Responsive design for all components
- [ ] Touch-friendly UI elements
- [ ] Optimized bundle size
- [ ] Progressive Web App setup
- [ ] Offline mode support
- [ ] Mobile-specific gestures

---

## 🚀 Deployment Checklist

### Environment Setup
- [ ] Configure environment variables
- [ ] Setup API keys
- [ ] Configure WebSocket endpoints
- [ ] Setup caching strategy
- [ ] Configure CDN

### Performance Optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle analysis
- [ ] Service worker setup

### Monitoring & Analytics
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User analytics
- [ ] API usage tracking
- [ ] WebSocket health monitoring

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | < 2s | Lighthouse |
| Transaction Lookup | < 1s | API Response |
| Fee Accuracy | > 85% | Confirmation Analysis |
| Mobile Usage | > 60% | Analytics |
| User Retention | > 40% WAU | Analytics |
| Error Rate | < 1% | Sentry |
| API Uptime | > 99.9% | Status Page |

---

## 🔄 Next Steps

1. **Immediate Actions**
   - [ ] Install dependencies
   - [ ] Setup project structure
   - [ ] Configure API endpoints
   - [ ] Create base components

2. **Week 1 Goals**
   - [ ] Complete Transaction Status Tracker
   - [ ] Implement Network Pulse
   - [ ] Setup WebSocket connections

3. **Week 2 Goals**
   - [ ] Complete Smart Fee Recommender
   - [ ] Add caching layer
   - [ ] Begin testing

4. **Week 3-4 Goals**
   - [ ] Complete remaining features
   - [ ] Full testing suite
   - [ ] Performance optimization
   - [ ] Deploy to staging

---

## 🤝 Contributing Guidelines

1. **Code Style**
   - Use TypeScript strict mode
   - Follow ESLint configuration
   - Write comprehensive tests
   - Document all functions

2. **Git Workflow**
   - Feature branches from `develop`
   - Conventional commits
   - PR reviews required
   - CI/CD must pass

3. **Testing Requirements**
   - Unit tests for all services
   - Integration tests for APIs
   - Component testing
   - E2E for critical paths

---

## 📚 Resources & Documentation

- [Mempool.space API Docs](https://mempool.space/docs/api)
- [OpenTimestamps Documentation](https://opentimestamps.org)
- [Bitcoin RPC Reference](https://developer.bitcoin.org/reference/rpc/)
- [Lightning Network BOLT Specs](https://github.com/lightning/bolts)
- [Bitcoin Script Reference](https://en.bitcoin.it/wiki/Script)

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All features implemented
- [ ] Testing complete (>80% coverage)
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Documentation complete

### Launch Day
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Check WebSocket stability
- [ ] Verify API endpoints
- [ ] Social media announcement

### Post-Launch
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Feature usage analytics
- [ ] Bug fixes and patches
- [ ] Plan v2.1 features

---

**Let's make Bitcoin simple for everyone! 🚀**