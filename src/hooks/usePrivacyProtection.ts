'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PrivacyManager } from '@/lib/services/privacyManager';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';

// Import the ToolStates type from the store
type ToolStates = {
  transactionLookup: any;
  feeCalculator: any;
  networkStatus: any;
  addressExplorer: any;
  documentTimestamp: any;
};

// Map tool names to store keys
const TOOL_NAME_MAP: Record<string, keyof ToolStates> = {
  'transaction-lookup': 'transactionLookup',
  'address-explorer': 'addressExplorer',
  'fee-calculator': 'feeCalculator',
  'document-timestamp': 'documentTimestamp',
  'network-status': 'networkStatus'
};

interface PrivacyProtectionOptions {
  toolName: string;
  clearOnUnmount?: boolean;
  clearOnNavigation?: boolean;
  clearOnVisibilityChange?: boolean;
  sessionTimeout?: number; // in milliseconds
}

export function usePrivacyProtection(options: PrivacyProtectionOptions) {
  const router = useRouter();
  const sessionId = useRef<string>(crypto.randomUUID());
  const lastActivityTime = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { clearToolData, clearAllData } = useBitcoinToolsStore();

  // Update activity tracking
  const updateActivity = useCallback(() => {
    lastActivityTime.current = Date.now();
  }, []);

  // Register session on mount
  useEffect(() => {
    PrivacyManager.registerSession(sessionId.current);
    PrivacyManager.logDataUsage(
      options.toolName, 
      'session_start', 
      'privacy_protection_enabled'
    );

    return () => {
      const currentSessionId = sessionId.current;
      PrivacyManager.unregisterSession(currentSessionId);
      if (options.clearOnUnmount) {
        const storeKey = TOOL_NAME_MAP[options.toolName];
        if (storeKey) {
          clearToolData(storeKey);
        }
      }
    };
  }, [options.toolName, options.clearOnUnmount, clearToolData]);

  // Handle page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Clear sensitive data
      PrivacyManager.clearAllSensitiveData();
      clearAllData();
      
      PrivacyManager.logDataUsage(
        options.toolName,
        'page_unload',
        'data_cleared'
      );

      // Note: Modern browsers may ignore custom messages
      const message = 'Your data will be cleared for privacy when you leave this page.';
      event.returnValue = message;
      return message;
    };

    if (options.clearOnUnmount !== false) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [options.toolName, options.clearOnUnmount, clearAllData]);

  // Handle navigation within the app
  useEffect(() => {
    const handleRouteChange = () => {
      if (options.clearOnNavigation) {
        PrivacyManager.clearAllSensitiveData();
        clearAllData();
        
        PrivacyManager.logDataUsage(
          options.toolName,
          'navigation',
          'data_cleared'
        );
      }
    };

    if (options.clearOnNavigation) {
      // For client-side navigation
      const originalPush = router.push;
      router.push = (...args: Parameters<typeof router.push>) => {
        handleRouteChange();
        return originalPush.apply(router, args);
      };
    }

    return () => {
      // Restore original router.push if modified
      if (options.clearOnNavigation) {
        // Note: This is a simplified cleanup, more robust implementation would store original method
      }
    };
  }, [router, options.toolName, options.clearOnNavigation, clearAllData]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && options.clearOnVisibilityChange) {
        PrivacyManager.clearAllSensitiveData();
        
        PrivacyManager.logDataUsage(
          options.toolName,
          'visibility_hidden',
          'data_cleared'
        );
      } else if (document.visibilityState === 'visible') {
        updateActivity();
      }
    };

    if (options.clearOnVisibilityChange) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [options.toolName, options.clearOnVisibilityChange, updateActivity]);

  // Handle session timeout
  useEffect(() => {
    if (options.sessionTimeout) {
      const checkSession = () => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityTime.current;
        
        if (timeSinceLastActivity > options.sessionTimeout!) {
          PrivacyManager.clearAllSensitiveData();
          clearAllData();
          
          PrivacyManager.logDataUsage(
            options.toolName,
            'session_timeout',
            'data_cleared'
          );
        } else {
          // Schedule next check
          timeoutRef.current = setTimeout(checkSession, 30000); // Check every 30 seconds
        }
      };

      timeoutRef.current = setTimeout(checkSession, options.sessionTimeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [options.sessionTimeout, options.toolName, clearAllData]);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  // Clear specific tool data
  const clearToolDataSecurely = useCallback((toolName?: string) => {
    const targetTool = toolName || options.toolName;
    
    // Clear from store
    const storeKey = TOOL_NAME_MAP[targetTool];
    if (storeKey) {
      clearToolData(storeKey);
    }
    
    // Clear from privacy manager
    PrivacyManager.clearAllSensitiveData();
    
    PrivacyManager.logDataUsage(
      targetTool,
      'manual_clear',
      'tool_data_cleared'
    );
  }, [options.toolName, clearToolData]);

  // Get privacy warning for specific action
  const getPrivacyWarning = useCallback((action: string, data?: any) => {
    return PrivacyManager.getPrivacyWarning(options.toolName, action, data);
  }, [options.toolName]);

  // Log data usage
  const logDataUsage = useCallback((action: string, dataType: string, externalAPI?: string) => {
    updateActivity(); // Update activity when data is used
    PrivacyManager.logDataUsage(options.toolName, action, dataType, externalAPI);
  }, [options.toolName, updateActivity]);

  // Validate API request before making it
  const validateAPIRequest = useCallback((apiName: string, dataToSend: any) => {
    const validation = PrivacyManager.validateAPIRequest(apiName, dataToSend);
    
    if (validation.allowed) {
      logDataUsage('api_request', typeof dataToSend, apiName);
    }
    
    return validation;
  }, [logDataUsage]);

  // Get session info
  const getSessionInfo = useCallback(() => {
    return {
      sessionId: sessionId.current,
      lastActivity: lastActivityTime.current,
      isActive: (Date.now() - lastActivityTime.current) < 300000, // Active within 5 minutes
      timeUntilTimeout: options.sessionTimeout 
        ? Math.max(0, options.sessionTimeout - (Date.now() - lastActivityTime.current))
        : null
    };
  }, [options.sessionTimeout]);

  return {
    // Methods
    clearToolDataSecurely,
    getPrivacyWarning,
    logDataUsage,
    validateAPIRequest,
    updateActivity,
    
    // Session info
    getSessionInfo,
    
    // Privacy manager instance (for advanced usage)
    privacyManager: PrivacyManager
  };
}

// Hook for privacy-aware API calls
export function usePrivateAPICall(toolName: string) {
  const { logDataUsage, validateAPIRequest } = usePrivacyProtection({ toolName });

  const makePrivateAPICall = useCallback(async <T>(
    apiName: string,
    requestFn: (sanitizedData: any) => Promise<T>,
    data?: any
  ): Promise<{ success: boolean; data?: T; errors?: string[] }> => {
    try {
      // Validate the request
      const validation = validateAPIRequest(apiName, data);
      
      if (!validation.allowed) {
        return {
          success: false,
          errors: validation.warnings.map(w => w.description)
        };
      }

      // Make the request with sanitized data
      const result = await requestFn(validation.sanitizedData);
      
      // Log successful API call
      logDataUsage('api_success', typeof data, apiName);
      
      return { success: true, data: result };

    } catch (error) {
      // Log API error
      logDataUsage('api_error', typeof data, apiName);
      
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }, [validateAPIRequest, logDataUsage]);

  return { makePrivateAPICall };
}

export default usePrivacyProtection;