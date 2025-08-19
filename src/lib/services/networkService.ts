import type { NetworkHealth, MempoolInfo, MempoolFeeEstimates } from '@/types/bitcoin-tools';

class NetworkService {
  private readonly API_BASE = 'https://mempool.space/api/v1';
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getMempoolInfo(): Promise<MempoolInfo | null> {
    const cacheKey = 'mempool-info';
    const cached = this.getCachedData<MempoolInfo>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.API_BASE}/mempool`, {
        next: { revalidate: 30 }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching mempool info:', error);
      return null;
    }
  }

  async getFeeEstimates(): Promise<MempoolFeeEstimates | null> {
    const cacheKey = 'fee-estimates';
    const cached = this.getCachedData<MempoolFeeEstimates>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.API_BASE}/fees/recommended`, {
        next: { revalidate: 30 }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching fee estimates:', error);
      return null;
    }
  }

  private categorizeCongestionLevel(mempoolSize: number, averageFee: number): NetworkHealth['congestionLevel'] {
    // Categorize based on mempool size (number of transactions) and average fee
    if (mempoolSize < 5000 && averageFee < 10) {
      return 'low';
    } else if (mempoolSize < 15000 && averageFee < 25) {
      return 'normal';
    } else if (mempoolSize < 50000 && averageFee < 75) {
      return 'high';
    } else {
      return 'extreme';
    }
  }

  private estimateNextBlockTime(congestionLevel: NetworkHealth['congestionLevel']): string {
    // Estimate based on average block time and congestion
    const baseTime = 10; // 10 minutes average
    
    switch (congestionLevel) {
      case 'low':
        return `~${baseTime} minutes`;
      case 'normal':
        return `~${baseTime + 2} minutes`;
      case 'high':
        return `~${baseTime + 5} minutes`;
      case 'extreme':
        return `~${baseTime + 10} minutes`;
      default:
        return `~${baseTime} minutes`;
    }
  }

  private generateHumanReadableInfo(
    congestionLevel: NetworkHealth['congestionLevel'],
    mempoolSize: number,
    averageFee: number
  ): NetworkHealth['humanReadable'] {
    const formatNumber = (num: number): string => {
      return new Intl.NumberFormat().format(Math.round(num));
    };

    switch (congestionLevel) {
      case 'low':
        return {
          congestionDescription: `Network is quiet with ${formatNumber(mempoolSize)} pending transactions`,
          userAdvice: 'Great time to send Bitcoin! Transactions will confirm quickly with low fees.',
          colorScheme: 'green',
        };
      case 'normal':
        return {
          congestionDescription: `Normal activity with ${formatNumber(mempoolSize)} pending transactions`,
          userAdvice: 'Good time to send Bitcoin. Standard fees will get you confirmed in the next few blocks.',
          colorScheme: 'yellow',
        };
      case 'high':
        return {
          congestionDescription: `High activity with ${formatNumber(mempoolSize)} pending transactions`,
          userAdvice: 'Network is busy. Consider waiting for less congestion or use higher fees for faster confirmation.',
          colorScheme: 'orange',
        };
      case 'extreme':
        return {
          congestionDescription: `Very high activity with ${formatNumber(mempoolSize)} pending transactions`,
          userAdvice: 'Network is very congested. Wait for better conditions or expect high fees and longer confirmation times.',
          colorScheme: 'red',
        };
      default:
        return {
          congestionDescription: 'Unable to determine network status',
          userAdvice: 'Please check back in a moment',
          colorScheme: 'yellow',
        };
    }
  }

  private generateRecommendation(
    congestionLevel: NetworkHealth['congestionLevel'],
    averageFee: number
  ): string {
    switch (congestionLevel) {
      case 'low':
        return `Perfect time to send! Use ${Math.round(averageFee * 0.8)} sat/vB for quick confirmation.`;
      case 'normal':
        return `Good time to send. Use ${Math.round(averageFee)} sat/vB for standard confirmation.`;
      case 'high':
        return `Consider waiting or use ${Math.round(averageFee * 1.2)} sat/vB for priority confirmation.`;
      case 'extreme':
        return `Wait for better conditions unless urgent. High priority: ${Math.round(averageFee * 1.5)} sat/vB.`;
      default:
        return 'Unable to provide recommendation at this time.';
    }
  }

  async getNetworkHealth(): Promise<NetworkHealth | null> {
    try {
      const [mempoolInfo, feeEstimates] = await Promise.all([
        this.getMempoolInfo(),
        this.getFeeEstimates()
      ]);

      if (!mempoolInfo || !feeEstimates) {
        return null;
      }

      const mempoolSize = mempoolInfo.count;
      const mempoolBytes = mempoolInfo.vsize;
      const averageFee = feeEstimates.halfHourFee; // Use half hour fee as representative

      const congestionLevel = this.categorizeCongestionLevel(mempoolSize, averageFee);
      const nextBlockETA = this.estimateNextBlockTime(congestionLevel);
      const humanReadable = this.generateHumanReadableInfo(congestionLevel, mempoolSize, averageFee);
      const recommendation = this.generateRecommendation(congestionLevel, averageFee);

      return {
        congestionLevel,
        mempoolSize,
        mempoolBytes,
        averageFee,
        nextBlockETA,
        recommendation,
        humanReadable,
      };
    } catch (error) {
      console.error('Error getting network health:', error);
      return null;
    }
  }
}

export const networkService = new NetworkService();