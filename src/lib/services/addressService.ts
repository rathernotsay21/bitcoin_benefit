import { 
  AddressInfo, 
  SimplifiedTransaction, 
  createToolError,
  toBitcoinAddress,
  toBitcoinTxId,
  toBTCAmount,
  toUSDAmount,
  toSatoshiAmount,
  toBlockHeight,
  toUnixTimestamp
} from '@/types/bitcoin-tools';
import { validateBitcoinAddress } from '@/lib/on-chain/validation';
import { unifiedBitcoinAPI } from '@/lib/api/unifiedBitcoinAPI';

interface MempoolAddressInfo {
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

interface MempoolTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey_address?: string;
      value: number;
    };
    is_coinbase: boolean;
  }>;
  vout: Array<{
    scriptpubkey_address?: string;
    value: number;
  }>;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_time?: number;
  };
  fee: number;
}

interface BitcoinPriceResponse {
  bitcoin: {
    usd: number;
  };
}

export class AddressService {
  private static btcPrice: number | null = null;
  private static priceLastUpdated = 0;
  private static readonly cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 60000; // 1 minute

  /**
   * Get cached data if available and not expired
   */
  private static getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private static setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Detect address type from format
   */
  private static detectAddressType(address: string): AddressInfo['addressType'] {
    if (address.startsWith('1')) return 'legacy';
    if (address.startsWith('3')) return 'segwit';
    if (address.startsWith('bc1q')) return 'native_segwit';
    if (address.startsWith('bc1p')) return 'taproot';
    return 'legacy'; // fallback
  }

  /**
   * Fetch current Bitcoin price in USD
   */
  private static async getBitcoinPrice(): Promise<number> {
    const now = Date.now();
    
    // Use cached price if less than 10 minutes old
    if (this.btcPrice && (now - this.priceLastUpdated) < 600000) {
      return this.btcPrice;
    }

    const response = await unifiedBitcoinAPI.request<BitcoinPriceResponse>('/api/coingecko', {
      cacheKey: 'btc-price',
      fallbackData: { bitcoin: { usd: this.btcPrice || 30000 } },
      rateLimitKey: 'coingecko'
    });

    if (response.success && response.data) {
      this.btcPrice = response.data.bitcoin.usd;
      this.priceLastUpdated = now;
      return this.btcPrice;
    }
    
    // Return cached price or fallback
    return this.btcPrice || 30000; // Fallback to ~$30k
  }

  /**
   * Validate Bitcoin address format
   */
  static validateAddress(address: string): boolean {
    return validateBitcoinAddress(address);
  }

  /**
   * Fetch address information from mempool API
   */
  private static async fetchAddressInfo(address: string): Promise<MempoolAddressInfo> {
    const response = await unifiedBitcoinAPI.request<MempoolAddressInfo>(
      `https://mempool.space/api/address/${address}`,
      {
        cacheKey: `address-info-${address}`,
        rateLimitKey: 'mempool-address'
      }
    );

    if (!response.success) {
      if (response.error?.includes('404')) {
        throw createToolError('not_found', 'ADDRESS_NOT_FOUND');
      }
      throw createToolError('api', 'API_ERROR');
    }

    if (!response.data) {
      throw createToolError('api', 'API_ERROR');
    }

    return response.data;
  }

  /**
   * Fetch address transactions from mempool API
   */
  private static async fetchAddressTransactions(
    address: string, 
    lastSeenTxid?: string
  ): Promise<MempoolTransaction[]> {
    let url = `https://mempool.space/api/address/${address}/txs`;
    if (lastSeenTxid) {
      url += `?after_txid=${lastSeenTxid}`;
    }

    const response = await unifiedBitcoinAPI.request<MempoolTransaction[]>(url, {
      cacheKey: `address-txs-${address}-${lastSeenTxid || 'first'}`,
      rateLimitKey: 'mempool-transactions',
      fallbackData: [] // Return empty array as fallback
    });

    if (!response.success) {
      throw createToolError('api', 'API_ERROR');
    }

    return response.data || [];
  }

  /**
   * Calculate transaction impact on address balance
   */
  private static calculateTransactionImpact(
    tx: MempoolTransaction, 
    address: string
  ): { type: 'received' | 'sent'; amount: number } {
    let receivedAmount = 0;
    let sentAmount = 0;

    // Calculate received amount (outputs to this address)
    tx.vout.forEach(output => {
      if (output.scriptpubkey_address === address) {
        receivedAmount += output.value;
      }
    });

    // Calculate sent amount (inputs from this address)
    tx.vin.forEach(input => {
      if (input.prevout && input.prevout.scriptpubkey_address === address && !input.is_coinbase) {
        sentAmount += input.prevout.value;
      }
    });

    // Determine net effect
    const netAmount = receivedAmount - sentAmount;
    
    return {
      type: netAmount > 0 ? 'received' : 'sent',
      amount: Math.abs(netAmount)
    };
  }

  /**
   * Format transaction for simplified display
   */
  private static formatTransaction(
    tx: MempoolTransaction, 
    address: string, 
    btcPrice: number
  ): SimplifiedTransaction {
    const impact = this.calculateTransactionImpact(tx, address);
    const amountInBTC = impact.amount / 100000000;
    const amountInUSD = amountInBTC * btcPrice;

    return {
      txid: toBitcoinTxId(tx.txid),
      date: tx.status.block_time 
        ? new Date(tx.status.block_time * 1000).toLocaleDateString()
        : 'Pending',
      type: impact.type,
      amount: {
        btc: toBTCAmount(amountInBTC),
        usd: toUSDAmount(amountInUSD),
        sats: toSatoshiAmount(impact.amount)
      },
      status: tx.status.confirmed ? 'confirmed' : 'pending',
      blockHeight: tx.status.block_height ? toBlockHeight(tx.status.block_height) : undefined,
      confirmations: tx.status.confirmed ? (Math.max(0, 800000 - (tx.status.block_height || 0))) : 0
    };
  }

  /**
   * Generate human-readable descriptions
   */
  private static generateHumanReadableInfo(
    balanceInSats: number, 
    balanceInUSD: number, 
    txCount: number
  ): AddressInfo['humanReadable'] {
    const balanceInBTC = balanceInSats / 100000000;
    
    let balanceDescription: string;
    if (balanceInSats === 0) {
      balanceDescription = 'This address currently has no Bitcoin balance';
    } else if (balanceInSats < 100000) { // Less than 0.001 BTC
      balanceDescription = `Small balance of ${balanceInSats.toLocaleString()} satoshis`;
    } else if (balanceInBTC < 0.1) {
      balanceDescription = `Balance of ${balanceInBTC.toFixed(6)} BTC (~$${balanceInUSD.toFixed(2)})`;
    } else {
      balanceDescription = `Balance of ${balanceInBTC.toFixed(4)} BTC (~$${balanceInUSD.toLocaleString()})`;
    }

    let activitySummary: string;
    if (txCount === 0) {
      activitySummary = 'No transaction history found';
    } else if (txCount === 1) {
      activitySummary = '1 transaction on record';
    } else if (txCount < 10) {
      activitySummary = `${txCount} transactions on record`;
    } else if (txCount < 100) {
      activitySummary = `${txCount} transactions - moderately active address`;
    } else {
      activitySummary = `${txCount} transactions - highly active address`;
    }

    return {
      balanceDescription,
      activitySummary,
      lastActivityDescription: txCount > 0 ? 'Recent activity detected' : 'No recent activity'
    };
  }

  /**
   * Analyze address and return comprehensive information
   */
  static async analyzeAddress(
    address: string, 
    page: number = 1, 
    pageSize: number = 25,
    lastSeenTxid?: string
  ): Promise<AddressInfo> {
    // Validate address format
    if (!this.validateAddress(address)) {
      throw createToolError('validation', 'INVALID_ADDRESS');
    }

    try {
      // Fetch address info and Bitcoin price in parallel
      const [addressInfo, btcPrice] = await Promise.all([
        this.fetchAddressInfo(address),
        this.getBitcoinPrice()
      ]);

      // Calculate current balance (including confirmed and unconfirmed)
      const confirmedBalance = addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum;
      const unconfirmedBalance = addressInfo.mempool_stats.funded_txo_sum - addressInfo.mempool_stats.spent_txo_sum;
      const totalBalance = confirmedBalance + unconfirmedBalance;
      const totalTxCount = addressInfo.chain_stats.tx_count + addressInfo.mempool_stats.tx_count;

      // Convert balance to different units
      const balanceInBTC = totalBalance / 100000000;
      const balanceInUSD = balanceInBTC * btcPrice;

      // Fetch recent transactions
      const transactions = await this.fetchAddressTransactions(address, lastSeenTxid);
      
      // Format transactions for display
      const formattedTransactions = transactions
        .slice(0, pageSize)
        .map(tx => this.formatTransaction(tx, address, btcPrice));

      // Generate human-readable information
      const humanReadable = this.generateHumanReadableInfo(
        totalBalance, 
        balanceInUSD, 
        totalTxCount
      );

      return {
        address: toBitcoinAddress(address),
        balance: {
          btc: toBTCAmount(balanceInBTC),
          usd: toUSDAmount(balanceInUSD),
          sats: toSatoshiAmount(totalBalance)
        },
        transactionCount: totalTxCount,
        transactions: formattedTransactions,
        humanReadable,
        firstSeen: transactions.length > 0 && transactions[transactions.length - 1].status.block_time 
          ? toUnixTimestamp(transactions[transactions.length - 1].status.block_time!) 
          : undefined,
        lastSeen: transactions.length > 0 && transactions[0].status.block_time 
          ? toUnixTimestamp(transactions[0].status.block_time!) 
          : undefined,
        addressType: this.detectAddressType(address)
      };

    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw createToolError('timeout', 'API_TIMEOUT', error);
        }
        if (error.message.includes('fetch')) {
          throw createToolError('network', 'NETWORK_ERROR', error);
        }
      }

      // Re-throw tool errors
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }

      // Unknown error
      throw createToolError('unknown', 'UNKNOWN_ERROR', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get blockchain explorer URLs for an address
   */
  static getExplorerUrls(address: string) {
    return {
      mempool: `https://mempool.space/address/${address}`,
      blockstream: `https://blockstream.info/address/${address}`,
      blockchain: `https://www.blockchain.com/btc/address/${address}`,
      btc: `https://btc.com/${address}`
    };
  }

  /**
   * Format address for display (showing first/last chars)
   */
  static formatAddressForDisplay(address: string, chars = 6): string {
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  /**
   * Copy text to clipboard with fallback
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Check if address appears to be a business/exchange address
   */
  static analyzeAddressType(txCount: number, balanceInBTC: number): {
    type: 'personal' | 'business' | 'exchange' | 'unknown';
    confidence: 'low' | 'medium' | 'high';
    description: string;
  } {
    // Heuristic analysis based on transaction patterns
    if (txCount > 1000 && balanceInBTC > 10) {
      return {
        type: 'exchange',
        confidence: 'high',
        description: 'Likely exchange or service address (high volume, high balance)'
      };
    } else if (txCount > 500) {
      return {
        type: 'business',
        confidence: 'medium',
        description: 'Possibly business or merchant address (high transaction volume)'
      };
    } else if (txCount > 100 && balanceInBTC > 1) {
      return {
        type: 'business',
        confidence: 'low',
        description: 'Could be business address (moderate activity)'
      };
    } else if (txCount < 20) {
      return {
        type: 'personal',
        confidence: 'medium',
        description: 'Likely personal wallet address (low activity)'
      };
    } else {
      return {
        type: 'unknown',
        confidence: 'low',
        description: 'Cannot determine address type from transaction patterns'
      };
    }
  }
}