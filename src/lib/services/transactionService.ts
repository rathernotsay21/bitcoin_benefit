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

interface MempoolTransactionResponse {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address?: string;
      value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    witness?: string[];
    is_coinbase: boolean;
    sequence: number;
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address?: string;
    value: number;
  }>;
  size: number;
  weight: number;
  fee: number;
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

    try {
      const response = await fetch('/api/coingecko', {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data: BitcoinPriceResponse = await response.json();
        this.btcPrice = data.bitcoin.usd;
        this.priceLastUpdated = now;
        return this.btcPrice;
      }
    } catch (error) {
      console.warn('Failed to fetch Bitcoin price:', error);
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
      try {
        // Fetch current block height from mempool API
        const response = await fetch('https://mempool.space/api/blocks/tip/height', {
          signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
          const currentHeight = await response.json();
          confirmations = Math.max(0, currentHeight - tx.status.block_height + 1);
        } else {
          // Fallback calculation
          confirmations = Math.max(0, 870000 - tx.status.block_height); // Conservative estimate
        }
      } catch (error) {
        // Fallback calculation if API fails
        confirmations = Math.max(0, 870000 - tx.status.block_height); // Conservative estimate
      }
    }

    // Calculate fee information
    const feeInSats = tx.fee;
    const feeInBTC = feeInSats / 100000000;
    const feeInUSD = feeInBTC * btcPrice;
    const feeRate = Math.round(feeInSats / (tx.weight / 4)); // sat/vByte

    // Determine status
    let status: TransactionStatus['status'];
    let humanStatus: string;
    let timeDescription: string;

    if (isConfirmed) {
      status = 'confirmed';
      humanStatus = `✅ Confirmed`;
      
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
    if (feeRate >= 50) {
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
    
    if (feeRate >= 100) {
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
    // Validate TXID format
    if (!this.validateTxid(txid)) {
      throw createToolError('validation', 'INVALID_TXID');
    }

    try {
      // Fetch transaction data and Bitcoin price in parallel
      const [txResponse, btcPrice] = await Promise.all([
        fetch(`/api/mempool/tx/${txid}`, {
          signal: AbortSignal.timeout(30000)
        }),
        this.getBitcoinPrice()
      ]);

      if (!txResponse.ok) {
        if (txResponse.status === 404) {
          throw createToolError('not_found', 'TRANSACTION_NOT_FOUND');
        } else if (txResponse.status === 408) {
          throw createToolError('timeout', 'API_TIMEOUT');
        } else {
          throw createToolError('api', 'API_ERROR');
        }
      }

      const txData: MempoolTransactionResponse = await txResponse.json();
      return await this.formatTransactionStatus(txData, btcPrice);

    } catch (error) {
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