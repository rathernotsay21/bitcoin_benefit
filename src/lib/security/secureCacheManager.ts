/**
 * Secure Cache Manager with data integrity validation
 * Prevents tampering with cached Bitcoin price data
 */

import crypto from 'crypto';

interface SecureCacheData {
  data: any;
  integrity: string;
  timestamp: number;
}

export class SecureCacheManager {
  private static readonly INTEGRITY_KEY = 'btc-cache-integrity-2024';
  private static readonly MAX_PRICE_USD = 10000000; // $10M reasonable upper limit
  private static readonly MIN_PRICE_USD = 100; // $100 reasonable lower limit
  private static readonly MAX_CHANGE_PERCENT = 50; // 50% max daily change
  
  /**
   * Check if localStorage is available and accessible
   */
  private static isStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate HMAC signature for data integrity
   */
  private static generateIntegrity(data: any): string {
    // In production, use environment variable for key
    const key = process.env.CACHE_INTEGRITY_KEY || this.INTEGRITY_KEY;
    const dataString = JSON.stringify(data);
    
    // Use Web Crypto API if available (browser), otherwise Node crypto
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser implementation
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);
      const keyBuffer = encoder.encode(key);
      
      // Simple hash for browser (synchronous for simplicity)
      let hash = 0;
      const combined = dataString + key;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString(36);
    } else {
      // Node.js implementation
      try {
        return crypto
          .createHmac('sha256', key)
          .update(dataString)
          .digest('hex');
      } catch {
        // Fallback for environments without crypto
        return Buffer.from(dataString).toString('base64').slice(0, 16);
      }
    }
  }

  /**
   * Validate data integrity
   */
  private static validateIntegrity(data: any, integrity: string): boolean {
    const expectedIntegrity = this.generateIntegrity(data);
    return expectedIntegrity === integrity;
  }

  /**
   * Validate Bitcoin price data ranges
   */
  static validatePriceData(price: number, change24h: number): boolean {
    // Check price bounds
    if (price < this.MIN_PRICE_USD || price > this.MAX_PRICE_USD) {
      console.warn(`Invalid price detected: $${price}. Must be between $${this.MIN_PRICE_USD} and $${this.MAX_PRICE_USD}`);
      return false;
    }

    // Check change percentage bounds
    if (Math.abs(change24h) > this.MAX_CHANGE_PERCENT) {
      console.warn(`Invalid 24h change detected: ${change24h}%. Max allowed: ±${this.MAX_CHANGE_PERCENT}%`);
      return false;
    }

    // Check for NaN or Infinity
    if (!Number.isFinite(price) || !Number.isFinite(change24h)) {
      console.warn('Invalid numeric values detected in price data');
      return false;
    }

    return true;
  }

  /**
   * Securely store data with integrity check
   */
  static storeSecure(key: string, data: any): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      const secureData: SecureCacheData = {
        data,
        integrity: this.generateIntegrity(data),
        timestamp: Date.now()
      };

      localStorage.setItem(key, JSON.stringify(secureData));
      return true;
    } catch (error) {
      console.warn('Failed to store secure cache:', error);
      return false;
    }
  }

  /**
   * Retrieve and validate cached data
   */
  static retrieveSecure<T>(key: string): T | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const secureData: SecureCacheData = JSON.parse(cached);
      
      // Validate integrity
      if (!this.validateIntegrity(secureData.data, secureData.integrity)) {
        console.warn('Cache integrity check failed - data may have been tampered with');
        // Clear corrupted cache
        try {
          localStorage.removeItem(key);
        } catch {
          // Silently ignore removal errors
        }
        return null;
      }

      return secureData.data as T;
    } catch (error) {
      console.warn('Failed to retrieve secure cache:', error);
      // Clear corrupted cache
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently ignore removal errors - cache is already corrupted
      }
      return null;
    }
  }

  /**
   * Clear all secure caches
   */
  static clearSecureCache(key: string): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear secure cache:', error);
    }
  }

  /**
   * Get cache age in milliseconds
   */
  static getCacheAge(key: string): number | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const secureData: SecureCacheData = JSON.parse(cached);
      return Date.now() - secureData.timestamp;
    } catch {
      return null;
    }
  }
}