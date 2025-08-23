/**
 * High-Performance Object Pool for VestingTimelinePoint Objects
 * Reduces memory allocation overhead in Bitcoin vesting calculations
 * Optimized for Bitcoin Benefit platform
 */

import { VestingTimelinePoint } from '@/types/vesting';

export class TimelinePointPool {
  private pool: VestingTimelinePoint[] = [];
  private readonly maxPoolSize: number = 500;
  private createdCount: number = 0;
  private recycledCount: number = 0;

  /**
   * Get a VestingTimelinePoint from pool or create new one
   */
  getPoint(): VestingTimelinePoint {
    let point: VestingTimelinePoint;
    
    if (this.pool.length > 0) {
      point = this.pool.pop()!;
      this.recycledCount++;
    } else {
      // Create new object when pool is empty
      point = {
        month: 0,
        vestedAmount: 0,
        employerBalance: 0,
        employeeBalance: 0,
        totalBalance: 0,
        bitcoinPrice: 0,
        usdValue: 0
      };
      this.createdCount++;
    }
    
    // Reset all properties to default values
    this.resetPoint(point);
    return point;
  }

  /**
   * Return a VestingTimelinePoint to the pool for reuse
   */
  returnPoint(point: VestingTimelinePoint): void {
    if (this.pool.length < this.maxPoolSize) {
      this.resetPoint(point);
      this.pool.push(point);
    }
    // If pool is full, let the object be garbage collected
  }

  /**
   * Return multiple points to the pool efficiently
   */
  returnPoints(points: VestingTimelinePoint[]): void {
    for (const point of points) {
      this.returnPoint(point);
    }
  }

  /**
   * Reset point to default values for reuse
   */
  private resetPoint(point: VestingTimelinePoint): void {
    point.month = 0;
    point.vestedAmount = 0;
    point.employerBalance = 0;
    point.employeeBalance = 0;
    point.totalBalance = 0;
    point.bitcoinPrice = 0;
    point.usdValue = 0;
  }

  /**
   * Clear the entire pool and reset counters
   */
  clear(): void {
    this.pool.length = 0;
    this.createdCount = 0;
    this.recycledCount = 0;
  }

  /**
   * Get pool performance statistics
   */
  getStats(): {
    poolSize: number;
    maxPoolSize: number;
    createdCount: number;
    recycledCount: number;
    recycleRate: number;
  } {
    const totalObjects = this.createdCount + this.recycledCount;
    return {
      poolSize: this.pool.length,
      maxPoolSize: this.maxPoolSize,
      createdCount: this.createdCount,
      recycledCount: this.recycledCount,
      recycleRate: totalObjects > 0 ? (this.recycledCount / totalObjects) * 100 : 0
    };
  }

  /**
   * Pre-warm the pool with initial objects
   */
  preWarm(count: number = 50): void {
    const warmCount = Math.min(count, this.maxPoolSize);
    for (let i = 0; i < warmCount; i++) {
      this.pool.push({
        month: 0,
        vestedAmount: 0,
        employerBalance: 0,
        employeeBalance: 0,
        totalBalance: 0,
        bitcoinPrice: 0,
        usdValue: 0
      });
    }
  }
}

// Export singleton instance for use across the application
export const timelinePointPool = new TimelinePointPool();

// Pre-warm the pool for immediate availability
timelinePointPool.preWarm(100);

// Helper function for easy integration
export function createTimelinePoint(): VestingTimelinePoint {
  return timelinePointPool.getPoint();
}

export function releaseTimelinePoint(point: VestingTimelinePoint): void {
  timelinePointPool.returnPoint(point);
}

export function releaseTimelinePoints(points: VestingTimelinePoint[]): void {
  timelinePointPool.returnPoints(points);
}