/**
 * Privacy Manager - Handles data privacy, clearing, and transparency for Bitcoin Tools
 * 
 * This service ensures user privacy by:
 * - Tracking what data is sent to external APIs
 * - Clearing sensitive data on page unload
 * - Providing transparency about data usage
 * - Managing privacy warnings and user consent
 */

export interface ExternalAPIUsage {
  apiName: string;
  endpoint: string;
  dataSent: string[];
  purpose: string;
  privacyLevel: 'low' | 'medium' | 'high';
  retentionPolicy: string;
}

export interface PrivacyWarning {
  type: 'external_api' | 'file_upload' | 'data_storage' | 'network_request';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  apiUsage?: ExternalAPIUsage;
  suggestions: string[];
}

export interface DataUsageLog {
  timestamp: number;
  tool: string;
  action: string;
  dataType: string;
  externalAPI?: string;
  cleared: boolean;
}

class PrivacyManagerService {
  private static instance: PrivacyManagerService;
  private dataUsageLog: DataUsageLog[] = [];
  private activeSessions: Set<string> = new Set();
  private clearingEnabled = true;

  // External APIs used by Bitcoin Tools
  private readonly EXTERNAL_APIS: Record<string, ExternalAPIUsage> = {
    'mempool_space': {
      apiName: 'Mempool.space',
      endpoint: 'mempool.space/api',
      dataSent: ['Transaction IDs', 'Bitcoin Addresses', 'Fee Queries'],
      purpose: 'Fetch real-time Bitcoin blockchain data',
      privacyLevel: 'medium',
      retentionPolicy: 'Data is not stored by mempool.space for personal use queries'
    },
    'coingecko': {
      apiName: 'CoinGecko',
      endpoint: 'api.coingecko.com',
      dataSent: ['Price queries'],
      purpose: 'Get Bitcoin price for USD conversions',
      privacyLevel: 'low',
      retentionPolicy: 'Aggregate price data only, no personal information'
    },
    'opentimestamps': {
      apiName: 'OpenTimestamps',
      endpoint: 'alice.btc.calendar.opentimestamps.org',
      dataSent: ['Document hashes (SHA-256)'],
      purpose: 'Create Bitcoin blockchain timestamps',
      privacyLevel: 'low',
      retentionPolicy: 'Only cryptographic hashes are sent, no document content'
    }
  };

  static getInstance(): PrivacyManagerService {
    if (!PrivacyManagerService.instance) {
      PrivacyManagerService.instance = new PrivacyManagerService();
    }
    return PrivacyManagerService.instance;
  }

  private constructor() {
    this.initializePrivacyProtections();
  }

  /**
   * Initialize privacy protections and data clearing hooks
   */
  private initializePrivacyProtections(): void {
    if (typeof window === 'undefined') return;

    // Clear data on page unload
    window.addEventListener('beforeunload', this.clearAllSensitiveData.bind(this));
    
    // Clear data on navigation (for SPA)
    window.addEventListener('popstate', this.clearAllSensitiveData.bind(this));
    
    // Clear data when tab becomes hidden (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.clearAllSensitiveData();
      }
    });

    // Clear data periodically (every 5 minutes)
    setInterval(() => {
      this.clearOldData();
    }, 5 * 60 * 1000);
  }

  /**
   * Log data usage for transparency
   */
  logDataUsage(tool: string, action: string, dataType: string, externalAPI?: string): void {
    const logEntry: DataUsageLog = {
      timestamp: Date.now(),
      tool,
      action,
      dataType,
      externalAPI,
      cleared: false
    };

    this.dataUsageLog.push(logEntry);
    
    // Keep only last 100 entries to prevent memory bloat
    if (this.dataUsageLog.length > 100) {
      this.dataUsageLog = this.dataUsageLog.slice(-100);
    }
  }

  /**
   * Get privacy warning for specific tool actions
   */
  getPrivacyWarning(
    tool: string, 
    action: string, 
    data: any
  ): PrivacyWarning | null {
    
    switch (tool) {
      case 'transaction-lookup':
        if (action === 'lookup') {
          return {
            type: 'external_api',
            severity: 'warning',
            title: 'Transaction Lookup Privacy Notice',
            description: 'Your transaction ID will be sent to mempool.space to fetch blockchain data.',
            apiUsage: this.EXTERNAL_APIS.mempool_space,
            suggestions: [
              'Transaction IDs are public information on the blockchain',
              'No personal information is revealed by transaction IDs',
              'Consider using Tor for additional privacy',
              'Data is cleared automatically when you leave this page'
            ]
          };
        }
        break;

      case 'address-explorer':
        if (action === 'lookup') {
          return {
            type: 'external_api',
            severity: 'critical',
            title: 'Address Lookup Privacy Warning',
            description: 'Your Bitcoin address will be sent to mempool.space. This could potentially be linked to your identity.',
            apiUsage: this.EXTERNAL_APIS.mempool_space,
            suggestions: [
              'Bitcoin addresses can be linked to your identity',
              'Consider using a new address for each transaction',
              'Use Tor browser for additional privacy',
              'Data is cleared automatically when you leave this page',
              'Consider running your own Bitcoin node for maximum privacy'
            ]
          };
        }
        break;

      case 'document-timestamp':
        if (action === 'upload') {
          return {
            type: 'file_upload',
            severity: 'info',
            title: 'Document Timestamping Privacy Notice',
            description: 'Your document is processed locally. Only a cryptographic hash is sent to OpenTimestamps servers.',
            apiUsage: this.EXTERNAL_APIS.opentimestamps,
            suggestions: [
              'Document content never leaves your browser',
              'Only a SHA-256 hash is transmitted',
              'Hash cannot be used to reconstruct your document',
              'Files are cleared from memory after processing'
            ]
          };
        }
        break;

      case 'fee-calculator':
      case 'network-status':
        return {
          type: 'external_api',
          severity: 'info',
          title: 'Network Data Privacy Notice',
          description: 'General Bitcoin network data is fetched from mempool.space. No personal information is sent.',
          apiUsage: this.EXTERNAL_APIS.mempool_space,
          suggestions: [
            'Only network statistics are requested',
            'No personal data is transmitted',
            'Data is used for fee calculations and network status'
          ]
        };
    }

    return null;
  }

  /**
   * Get data usage transparency report
   */
  getDataUsageReport(): {
    totalRequests: number;
    apiBreakdown: Record<string, number>;
    dataTypes: Record<string, number>;
    recentActivity: DataUsageLog[];
    clearingStatus: {
      enabled: boolean;
      lastCleared: number | null;
    };
  } {
    const apiBreakdown: Record<string, number> = {};
    const dataTypes: Record<string, number> = {};

    this.dataUsageLog.forEach(entry => {
      if (entry.externalAPI) {
        apiBreakdown[entry.externalAPI] = (apiBreakdown[entry.externalAPI] || 0) + 1;
      }
      dataTypes[entry.dataType] = (dataTypes[entry.dataType] || 0) + 1;
    });

    return {
      totalRequests: this.dataUsageLog.length,
      apiBreakdown,
      dataTypes,
      recentActivity: this.dataUsageLog.slice(-10),
      clearingStatus: {
        enabled: this.clearingEnabled,
        lastCleared: this.getLastClearedTimestamp()
      }
    };
  }

  /**
   * Clear all sensitive data from the application
   */
  clearAllSensitiveData(): void {
    if (!this.clearingEnabled) return;

    try {
      // Clear localStorage items related to Bitcoin Tools
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('bitcoin-tools') || key?.includes('transaction') || key?.includes('address')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear form inputs
      this.clearFormInputs();

      // Clear file inputs
      this.clearFileInputs();

      // Mark data as cleared in log
      this.dataUsageLog.forEach(entry => {
        entry.cleared = true;
      });

      // Log the clearing action
      this.logDataUsage('privacy-manager', 'clear_data', 'all_sensitive_data');

      // Clear active sessions
      this.activeSessions.clear();

    } catch (error) {
      console.warn('Privacy Manager: Error clearing sensitive data:', error);
    }
  }

  /**
   * Clear old data (older than 30 minutes)
   */
  private clearOldData(): void {
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    this.dataUsageLog = this.dataUsageLog.filter(entry => entry.timestamp > thirtyMinutesAgo);
  }

  /**
   * Clear form inputs containing sensitive data
   */
  private clearFormInputs(): void {
    const sensitiveInputs = document.querySelectorAll(
      'input[type="text"][placeholder*="transaction"], ' +
      'input[type="text"][placeholder*="address"], ' +
      'input[type="text"][placeholder*="txid"], ' +
      'input[id*="txid"], ' +
      'input[id*="address"]'
    ) as NodeListOf<HTMLInputElement>;

    sensitiveInputs.forEach(input => {
      input.value = '';
    });
  }

  /**
   * Clear file inputs
   */
  private clearFileInputs(): void {
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      input.value = '';
    });
  }

  /**
   * Get last cleared timestamp
   */
  private getLastClearedTimestamp(): number | null {
    const clearEntry = this.dataUsageLog.find(entry => entry.action === 'clear_data');
    return clearEntry?.timestamp || null;
  }

  /**
   * Validate external API usage before making requests
   */
  validateAPIRequest(apiName: string, dataToSend: any): {
    allowed: boolean;
    warnings: PrivacyWarning[];
    sanitizedData: any;
  } {
    const warnings: PrivacyWarning[] = [];
    let sanitizedData = dataToSend;

    // Check if API is known and approved
    const apiInfo = this.EXTERNAL_APIS[apiName];
    if (!apiInfo) {
      warnings.push({
        type: 'external_api',
        severity: 'critical',
        title: 'Unknown External API',
        description: `Attempt to contact unknown API: ${apiName}`,
        suggestions: ['This request has been blocked for your privacy']
      });
      return { allowed: false, warnings, sanitizedData: null };
    }

    // Sanitize data based on API type
    if (apiName === 'mempool_space') {
      sanitizedData = this.sanitizeMemPoolData(dataToSend);
    }

    return {
      allowed: true,
      warnings,
      sanitizedData
    };
  }

  /**
   * Sanitize data being sent to Mempool.space API
   */
  private sanitizeMemPoolData(data: any): any {
    if (typeof data === 'string') {
      // Remove any potential PII or metadata
      return data.trim().replace(/[^a-fA-F0-9]/g, '');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Only allow specific safe fields
        if (['txid', 'address', 'blockHeight', 'vsize'].includes(key)) {
          sanitized[key] = typeof value === 'string' 
            ? value.trim().replace(/[^a-fA-F0-9]/g, '')
            : value;
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Enable or disable automatic data clearing
   */
  setDataClearingEnabled(enabled: boolean): void {
    this.clearingEnabled = enabled;
    this.logDataUsage('privacy-manager', 'toggle_clearing', `enabled_${enabled}`);
  }

  /**
   * Get external API information for transparency
   */
  getExternalAPIInfo(): Record<string, ExternalAPIUsage> {
    return { ...this.EXTERNAL_APIS };
  }

  /**
   * Register active session for tracking
   */
  registerSession(sessionId: string): void {
    this.activeSessions.add(sessionId);
  }

  /**
   * Unregister session and clear its data
   */
  unregisterSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    // Could implement session-specific data clearing here
  }
}

// Export singleton instance
export const PrivacyManager = PrivacyManagerService.getInstance();

// Export types for use in components
export type {
  PrivacyWarning as PrivacyManagerWarning,
  ExternalAPIUsage as PrivacyManagerAPIUsage,
  DataUsageLog as PrivacyManagerDataLog
};