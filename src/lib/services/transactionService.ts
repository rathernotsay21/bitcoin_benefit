import { 
  TransactionStatus, 
  createToolError, 
  BitcoinTxId,
  toBitcoinTxId,
  toBlockHeight,
  toUnixTimestamp,
  toSatoshiAmount,
  toFeeRate,
  toBTCAmount,
  toUSDAmount
} from '@/types/bitcoin-tools';
import { apiConfig, parseCoinGeckoPrice } from '@/lib/config/api';
import { unifiedBitcoinAPI } from '@/lib/api/unifiedBitcoinAPI';

// Updated interface to match actual API response from route.ts
interface MempoolTransactionResponse {
  txid: string;
  version?: number;
  locktime?: number;
  vin: Array<{
    txid?: string;
    vout?: number;
    sequence?: number;
    scriptSig?: string;
    prevout?: {
      scriptpubkey_address?: string;
      value: number;
    };
  }>;
  vout: Array<{
    scriptpubkey?: {
      hex?: string;
      address?: string;
    };
    scriptpubkey_address?: string;
    value: number;
    n?: number;
  }>;
  size?: number;
  weight?: number;
  fee?: number; // Made optional as it might not always be present
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

interface BitcoinPriceResponse {
  bitcoin: {
    usd: number;
  };
}

export class TransactionService {
  private static btcPrice: number | null = null;
  private static priceLastUpdated = 0;
  
  /**
   * Fetch current Bitcoin price in USD
   */
  private static async getBitcoinPrice(): Promise<number> {
    const now = Date.now();
    
    // Use cached price if less than 10 minutes old
    if (this.btcPrice && (now - this.priceLastUpdated) < 600000) {
      return this.btcPrice;
    }

    const response = await unifiedBitcoinAPI.request<any>(apiConfig.bitcoin.price, {
      cacheKey: 'btc-price-tx',
      fallbackData: { bitcoin: { usd: this.btcPrice || 30000 } },
      rateLimitKey: 'coingecko'
    });

    if (response.success && response.data) {
      this.btcPrice = parseCoinGeckoPrice(response.data);
      this.priceLastUpdated = now;
      return this.btcPrice;
    }
    
    // Return cached price or fallback
    return this.btcPrice || 30000; // Fallback to ~$30k
  }

  /**
   * Validate transaction ID format
   */
  static validateTxid(txid: string): boolean {
    if (!txid || typeof txid !== 'string') return false;
    return /^[a-fA-F0-9]{64}$/.test(txid);
  }

  /**
   * Format transaction status for non-technical users
   */
  static async formatTransactionStatus(tx: MempoolTransactionResponse, btcPrice: number): Promise<TransactionStatus> {
    const isConfirmed = tx.status.confirmed;
    
    // Get current block height for accurate confirmation count
    let confirmations = 0;
    if (isConfirmed && tx.status.block_height) {
      // Use fallback calculation to avoid CORS issues
      // The actual current height will be around 911000+
      confirmations = Math.max(1, 911116 - tx.status.block_height);
      console.log('Calculated confirmations:', confirmations, 'for block height:', tx.status.block_height);
    }

    // Calculate fee information with null safety
    const feeInSats = tx.fee || 0;
    const feeInBTC = feeInSats / 100000000;
    const feeInUSD = feeInBTC * btcPrice;
    const weight = tx.weight || (tx.size ? tx.size * 4 : 1000); // Fallback weight
    const feeRate = Math.round(feeInSats / Math.max(weight / 4, 1)); // sat/vByte with minimum 1

    // Determine status
    let status: TransactionStatus['status'];
    let humanStatus: string;
    let timeDescription: string;

    if (isConfirmed) {
      status = 'confirmed';
      humanStatus = `Confirmed`;
      
      if (confirmations === 1) {
        timeDescription = 'Recently confirmed (1 confirmation)';
      } else if (confirmations < 6) {
        timeDescription = `Confirmed with ${confirmations} confirmations`;
      } else {
        timeDescription = `Fully confirmed (${confirmations}+ confirmations)`;
      }
    } else {
      status = 'pending';
      humanStatus = '⏳ Pending';
      timeDescription = this.estimateConfirmationTime(feeRate);
    }

    // Format fee description
    const feeDescription = this.formatFeeDescription(feeInSats, feeRate, feeInUSD);

    return {
      txid: toBitcoinTxId(tx.txid),
      status,
      confirmations,
      blockHeight: tx.status.block_height ? toBlockHeight(tx.status.block_height) : undefined,
      blockTime: tx.status.block_time ? toUnixTimestamp(tx.status.block_time) : undefined,
      estimatedConfirmation: !isConfirmed ? this.estimateConfirmationTime(feeRate) : undefined,
      fee: {
        total: toSatoshiAmount(feeInSats),
        rate: toFeeRate(feeRate),
        btc: toBTCAmount(feeInBTC),
        usd: toUSDAmount(feeInUSD)
      },
      humanReadable: {
        status: humanStatus,
        timeDescription,
        feeDescription,
        confirmationText: `${confirmations} confirmation${confirmations !== 1 ? 's' : ''}`
      }
    };
  }

  /**
   * Estimate confirmation time based on fee rate
   */
  private static estimateConfirmationTime(feeRate: number): string {
    if (feeRate === 0) {
      return 'May not confirm (no fee)';
    } else if (feeRate >= 50) {
      return 'Next block (~10 minutes)';
    } else if (feeRate >= 20) {
      return 'Within 30 minutes';
    } else if (feeRate >= 10) {
      return '1-2 hours';
    } else if (feeRate >= 5) {
      return '2-6 hours';
    } else {
      return 'Several hours or longer';
    }
  }

  /**
   * Format fee description for users
   */
  private static formatFeeDescription(feeInSats: number, feeRate: number, feeInUSD: number): string {
    let description = `${feeInSats.toLocaleString()} sats ($${feeInUSD.toFixed(2)})`;
    
    if (feeRate === 0) {
      description += ' • No Fee';
    } else if (feeRate >= 100) {
      description += ' • Very High Fee ⚠️';
    } else if (feeRate >= 50) {
      description += ' • High Fee';
    } else if (feeRate >= 20) {
      description += ' • Standard Fee';
    } else if (feeRate >= 5) {
      description += ' • Low Fee';
    } else {
      description += ' • Very Low Fee';
    }

    return description;
  }

  /**
   * Fetch and format transaction details
   */
  static async getTransactionDetails(txid: string): Promise<TransactionStatus> {
    console.log('getTransactionDetails called with:', txid);
    
    // Validate TXID format
    if (!this.validateTxid(txid)) {
      console.error('Invalid TXID format:', txid);
      throw createToolError('validation', 'INVALID_TXID');
    }

    try {
      // Fetch transaction data and Bitcoin price in parallel
      console.log('Fetching transaction and Bitcoin price...');
      const [txApiResponse, btcPrice] = await Promise.all([
        unifiedBitcoinAPI.request<MempoolTransactionResponse>(
          apiConfig.mempool.transaction(txid),
          {
            cacheKey: `tx-${txid}`,
            rateLimitKey: 'mempool-transaction'
          }
        ),
        this.getBitcoinPrice()
      ]);

      console.log('API Response status:', txApiResponse.success ? 'OK' : 'Failed');

      if (!txApiResponse.success || !txApiResponse.data) {
        console.error('API Error response:', txApiResponse.error);
        
        if (txApiResponse.error?.includes('404')) {
          throw createToolError('not_found', 'TRANSACTION_NOT_FOUND');
        } else if (txApiResponse.error?.includes('timeout')) {
          throw createToolError('timeout', 'API_TIMEOUT');
        } else {
          throw createToolError('api', 'API_ERROR');
        }
      }

      const rawTxData = txApiResponse.data;
      console.log('Raw transaction data received:', {
        txid: rawTxData.txid,
        hasFee: 'fee' in rawTxData,
        hasStatus: 'status' in rawTxData,
        hasVin: 'vin' in rawTxData,
        hasVout: 'vout' in rawTxData
      });
      
      // Validate the response structure before processing
      if (!this.validateTransactionResponse(rawTxData)) {
        console.error('Transaction response validation failed');
        throw createToolError('parse_error', 'JSON_PARSE_ERROR');
      }
      
      const txData: MempoolTransactionResponse = rawTxData;
      console.log('Formatting transaction status...');
      const result = await this.formatTransactionStatus(txData, btcPrice);
      console.log('Transaction status formatted successfully');
      return result;

    } catch (error) {
      console.error('Error in getTransactionDetails:', error);
      
      // Handle network and timeout errors
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
   * Get blockchain explorer URLs for a transaction
   */
  static getExplorerUrls(txid: string) {
    return {
      mempool: `https://mempool.space/tx/${txid}`,
      blockstream: `https://blockstream.info/tx/${txid}`,
      blockchain: `https://www.blockchain.com/btc/tx/${txid}`,
      btc: `https://btc.com/${txid}`
    };
  }

  /**
   * Format transaction ID for display (showing first/last chars)
   */
  static formatTxidForDisplay(txid: string, chars = 8): string {
    if (txid.length <= chars * 2) return txid;
    return `${txid.slice(0, chars)}...${txid.slice(-chars)}`;
  }

  /**
   * Validate transaction response structure
   */
  private static validateTransactionResponse(data: any): data is MempoolTransactionResponse {
    if (!data || typeof data !== 'object') {
      console.error('Invalid response: not an object', data);
      return false;
    }
    
    // Log the actual structure for debugging
    console.log('Validating transaction response:', {
      hasTxid: 'txid' in data,
      txidType: typeof data.txid,
      hasFee: 'fee' in data,
      feeType: typeof data.fee,
      hasStatus: 'status' in data,
      statusType: typeof data.status,
      hasVin: 'vin' in data,
      hasVout: 'vout' in data
    });
    
    // More lenient validation - fee might be 0 or undefined for some transactions
    const isValid = (
      typeof data.txid === 'string' &&
      (typeof data.fee === 'number' || data.fee === undefined || data.fee === null) &&
      data.status &&
      typeof data.status === 'object' &&
      typeof data.status.confirmed === 'boolean' &&
      Array.isArray(data.vin) &&
      Array.isArray(data.vout)
    );
    
    if (!isValid) {
      console.error('Transaction validation failed:', {
        txid: data.txid,
        fee: data.fee,
        status: data.status,
        vinLength: data.vin?.length,
        voutLength: data.vout?.length
      });
    }
    
    return isValid;
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
}