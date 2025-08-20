'use client';

import React, { useState, useEffect } from 'react';
import { PrivacyManager, PrivacyWarning as PrivacyWarningType } from '@/lib/services/privacyManager';

interface PrivacyWarningProps {
  tool: string;
  action: string;
  data?: any;
  onAccept?: () => void;
  onDecline?: () => void;
  autoShow?: boolean;
  className?: string;
}

export function PrivacyWarning({ 
  tool, 
  action, 
  data, 
  onAccept, 
  onDecline, 
  autoShow = true,
  className = '' 
}: PrivacyWarningProps) {
  const [warning, setWarning] = useState<PrivacyWarningType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userChoice, setUserChoice] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    if (autoShow) {
      const privacyWarning = PrivacyManager.getPrivacyWarning(tool, action, data);
      if (privacyWarning) {
        setWarning(privacyWarning);
        setIsVisible(true);
      }
    }
  }, [tool, action, data, autoShow]);

  const handleAccept = () => {
    setUserChoice('accepted');
    setIsVisible(false);
    
    // Log user acceptance
    PrivacyManager.logDataUsage(
      'privacy-warning', 
      'user_accepted', 
      `${tool}_${action}`
    );
    
    onAccept?.();
  };

  const handleDecline = () => {
    setUserChoice('declined');
    setIsVisible(false);
    
    // Log user decline
    PrivacyManager.logDataUsage(
      'privacy-warning', 
      'user_declined', 
      `${tool}_${action}`
    );
    
    onDecline?.();
  };

  const getSeverityStyles = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'info':
        return {
          container: 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20',
          icon: '📘',
          iconColor: 'text-blue-500',
          title: 'text-blue-900 dark:text-blue-100',
          text: 'text-blue-800 dark:text-blue-200'
        };
      case 'warning':
        return {
          container: 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20',
          icon: '⚠️',
          iconColor: 'text-yellow-500',
          title: 'text-yellow-900 dark:text-yellow-100',
          text: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'critical':
        return {
          container: 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20',
          icon: '🔒',
          iconColor: 'text-red-500',
          title: 'text-red-900 dark:text-red-100',
          text: 'text-red-800 dark:text-red-200'
        };
    }
  };

  if (!isVisible || !warning || userChoice) {
    return null;
  }

  const styles = getSeverityStyles(warning.severity);

  return (
    <div 
      className={`rounded-lg border-2 p-4 mb-4 ${styles.container} ${className}`}
      role="alert"
      aria-live="polite"
      aria-labelledby="privacy-warning-title"
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <span 
          className={`text-xl flex-shrink-0 ${styles.iconColor}`}
          aria-hidden="true"
        >
          {styles.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 
            id="privacy-warning-title"
            className={`font-semibold text-sm ${styles.title}`}
          >
            {warning.title}
          </h3>
          <p className={`text-sm mt-1 ${styles.text}`}>
            {warning.description}
          </p>
        </div>
      </div>

      {/* API Usage Details */}
      {warning.apiUsage && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">External Service:</span>
              <div className="text-gray-900 dark:text-gray-100 font-mono">
                {warning.apiUsage.apiName}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Data Sent:</span>
              <div className="text-gray-900 dark:text-gray-100">
                {warning.apiUsage.dataSent.join(', ')}
              </div>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Purpose:</span>
              <div className="text-gray-900 dark:text-gray-100">
                {warning.apiUsage.purpose}
              </div>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Retention Policy:</span>
              <div className="text-gray-900 dark:text-gray-100">
                {warning.apiUsage.retentionPolicy}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Suggestions */}
      {warning.suggestions && warning.suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className={`text-xs font-medium ${styles.title} mb-2`}>
            Privacy Tips:
          </h4>
          <ul className="space-y-1 text-xs">
            {warning.suggestions.map((suggestion, index) => (
              <li key={index} className={`flex items-start ${styles.text}`}>
                <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                <span className="flex-1">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 px-4 py-2 bg-bitcoin hover:bg-bitcoin-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 text-sm"
        >
          I Understand, Proceed
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
        >
          Cancel
        </button>
      </div>

      {/* Data Usage Link */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => {
            // Could open data usage modal here
            console.log('Data usage report:', PrivacyManager.getDataUsageReport());
          }}
          className={`text-xs ${styles.text} hover:underline focus:outline-none focus:underline`}
        >
          View data usage transparency report →
        </button>
      </div>
    </div>
  );
}

interface DataUsageTransparencyProps {
  className?: string;
}

export function DataUsageTransparency({ className = '' }: DataUsageTransparencyProps) {
  const [report, setReport] = useState<ReturnType<typeof PrivacyManager.getDataUsageReport> | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadReport = () => {
    const usageReport = PrivacyManager.getDataUsageReport();
    setReport(usageReport);
    setIsExpanded(true);
  };

  const externalAPIs = PrivacyManager.getExternalAPIInfo();

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          🔒 Data Usage Transparency
        </h3>
        <button
          onClick={loadReport}
          className="text-xs text-bitcoin hover:text-bitcoin-600 underline focus:outline-none"
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      <div className="text-xs text-gray-700 dark:text-gray-300 mb-3">
        This tool uses external APIs to fetch Bitcoin blockchain data. Here's what data is shared:
      </div>

      {/* External APIs Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        {Object.entries(externalAPIs).map(([key, api]) => (
          <div key={key} className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
            <div className="font-medium text-xs text-gray-900 dark:text-gray-100 mb-1">
              {api.apiName}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Sends: {api.dataSent.join(', ')}
            </div>
            <div className={`text-xs mt-1 ${{
              'low': 'text-green-600 dark:text-green-400',
              'medium': 'text-yellow-600 dark:text-yellow-400',
              'high': 'text-red-600 dark:text-red-400'
            }[api.privacyLevel]}`}>
              Privacy Level: {api.privacyLevel}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Report */}
      {isExpanded && report && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Requests:</span>
              <div className="text-gray-900 dark:text-gray-100">{report.totalRequests}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Auto-Clearing:</span>
              <div className={`${report.clearingStatus.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {report.clearingStatus.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          {Object.keys(report.apiBreakdown).length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">API Usage:</span>
              <div className="mt-1 space-y-1">
                {Object.entries(report.apiBreakdown).map(([api, count]) => (
                  <div key={api} className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{api}</span>
                    <span className="text-gray-900 dark:text-gray-100">{count} requests</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                PrivacyManager.clearAllSensitiveData();
                setReport(PrivacyManager.getDataUsageReport());
              }}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline focus:outline-none"
            >
              Clear All Data Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivacyWarning;