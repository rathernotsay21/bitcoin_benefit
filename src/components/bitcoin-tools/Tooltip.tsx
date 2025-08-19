'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EducationalContent } from '@/types/bitcoin-tools';

interface TooltipProps {
  content: string | EducationalContent;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  maxWidth?: string;
  className?: string;
}

export default function Tooltip({ 
  content, 
  children, 
  position = 'top',
  trigger = 'hover',
  maxWidth = 'max-w-xs',
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Calculate optimal position based on viewport
  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let optimalPosition = position;

    // Check if tooltip would go off screen and adjust
    switch (position) {
      case 'top':
        if (rect.top - tooltipRect.height < 10) {
          optimalPosition = 'bottom';
        }
        break;
      case 'bottom':
        if (rect.bottom + tooltipRect.height > window.innerHeight - 10) {
          optimalPosition = 'top';
        }
        break;
      case 'left':
        if (rect.left - tooltipRect.width < 10) {
          optimalPosition = 'right';
        }
        break;
      case 'right':
        if (rect.right + tooltipRect.width > window.innerWidth - 10) {
          optimalPosition = 'left';
        }
        break;
    }

    setActualPosition(optimalPosition);
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (trigger === 'click') {
      e.stopPropagation();
      setIsVisible(!isVisible);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (trigger === 'click' && 
        tooltipRef.current && 
        triggerRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (trigger === 'click') {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [trigger]);

  const getPositionClasses = (pos: typeof position) => {
    switch (pos) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = (pos: typeof position) => {
    const baseClasses = 'absolute w-0 h-0 border-solid';
    
    switch (pos) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-200 border-l-4 border-r-4 border-t-4`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-gray-800 dark:border-b-gray-200 border-l-4 border-r-4 border-b-4`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-gray-800 dark:border-l-gray-200 border-t-4 border-b-4 border-l-4`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-gray-800 dark:border-r-gray-200 border-t-4 border-b-4 border-r-4`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-200 border-l-4 border-r-4 border-t-4`;
    }
  };

  const renderTooltipContent = () => {
    if (typeof content === 'string') {
      return (
        <div className="text-sm text-gray-100 dark:text-gray-900">
          {content}
        </div>
      );
    }

    // Educational content
    return (
      <div className="space-y-2">
        <div className="font-semibold text-gray-100 dark:text-gray-900 border-b border-gray-600 dark:border-gray-400 pb-1">
          {content.term}
        </div>
        <div className="text-sm text-gray-100 dark:text-gray-900">
          {content.definition}
        </div>
        {content.example && (
          <div className="text-xs text-gray-300 dark:text-gray-700 italic border-l-2 border-bitcoin pl-2">
            Example: {content.example}
          </div>
        )}
        {content.learnMoreUrl && (
          <a 
            href={content.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-bitcoin-300 hover:text-bitcoin-200 dark:text-bitcoin-600 dark:hover:text-bitcoin-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more →
          </a>
        )}
      </div>
    );
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={trigger === 'click' ? 'cursor-pointer' : 'cursor-help'}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${maxWidth} ${getPositionClasses(actualPosition)} transition-opacity duration-200`}
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-3 py-2 shadow-lg border border-gray-700 dark:border-gray-300 relative">
            {renderTooltipContent()}
            <div className={getArrowClasses(actualPosition)}></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Educational content database
export const BITCOIN_TERMS: Record<string, EducationalContent> = {
  TRANSACTION_ID: {
    term: 'Transaction ID (TXID)',
    definition: 'A unique 64-character identifier for every Bitcoin transaction.',
    example: 'a1b2c3d4e5f6...9876543210',
    learnMoreUrl: 'https://bitcoin.org/en/developer-guide#transactions'
  },
  CONFIRMATION: {
    term: 'Confirmation',
    definition: 'When a transaction is included in a block and added to the blockchain. More confirmations mean higher security.',
    example: '1 confirmation = included in 1 block, 6+ confirmations = very secure',
  },
  MEMPOOL: {
    term: 'Mempool',
    definition: 'The waiting area for unconfirmed transactions. When busy, transactions wait longer and cost more.',
    example: 'Like a queue at a restaurant - busy times mean longer waits',
  },
  SATOSHI: {
    term: 'Satoshi (sat)',
    definition: 'The smallest unit of Bitcoin. 1 Bitcoin = 100,000,000 satoshis.',
    example: '1 BTC = 100,000,000 sats (like cents to dollars)',
  },
  FEE_RATE: {
    term: 'Fee Rate',
    definition: 'How much you pay per byte of transaction data, measured in satoshis per virtual byte (sat/vB).',
    example: 'Higher fee rate = faster confirmation',
  },
  VBYTE: {
    term: 'Virtual Byte (vB)',
    definition: 'A unit measuring transaction size for fee calculation. Typical transactions are 150-250 vBytes.',
    example: 'Simple transaction: ~150 vB, Complex transaction: ~400+ vB',
  },
  BLOCK_HEIGHT: {
    term: 'Block Height',
    definition: 'The sequential number of a block in the blockchain. Block 0 was the first Bitcoin block.',
    example: 'Block height 800,000 means 800,000 blocks have been mined',
  },
  ADDRESS: {
    term: 'Bitcoin Address',
    definition: 'A string of characters that represents a destination for Bitcoin payments.',
    example: 'Like an email address, but for receiving Bitcoin',
  },
  PRIVATE_KEY: {
    term: 'Private Key',
    definition: 'A secret number that allows spending Bitcoin from an address. Never share this!',
    example: 'Like the password to your bank account - keep it private',
  },
  HASH: {
    term: 'Hash',
    definition: 'A unique digital fingerprint of data. Even tiny changes create completely different hashes.',
    example: 'Like a digital fingerprint that proves data hasn\'t been tampered with',
  },
  TIMESTAMP: {
    term: 'Timestamp',
    definition: 'Proof that data existed at a specific time, recorded immutably on the Bitcoin blockchain.',
    example: 'Like a notary stamp that can never be forged or changed',
  },
  CONGESTION: {
    term: 'Network Congestion',
    definition: 'When many people are sending transactions at once, causing delays and higher fees.',
    example: 'Like traffic during rush hour - more cars mean slower movement',
  },
  BLOCKCHAIN: {
    term: 'Blockchain',
    definition: 'A chain of blocks containing transaction records, maintained by a network of computers worldwide.',
    example: 'Like a public ledger that everyone can see but no one can cheat',
  },
  MINING: {
    term: 'Mining',
    definition: 'The process of creating new blocks and securing the Bitcoin network by solving complex puzzles.',
    example: 'Miners compete to solve puzzles and win the right to add the next block',
  },
  NODE: {
    term: 'Node',
    definition: 'A computer that maintains a copy of the Bitcoin blockchain and helps validate transactions.',
    example: 'Like having your own copy of all bank records to verify transactions',
  },
  WALLET: {
    term: 'Wallet',
    definition: 'Software that manages your Bitcoin addresses and private keys, allowing you to send and receive Bitcoin.',
    example: 'Like a digital wallet that holds your Bitcoin keys, not the Bitcoin itself',
  }
};

// Predefined tooltip components for common terms
export const BitcoinTooltip = ({ term, children, ...props }: { 
  term: keyof typeof BITCOIN_TERMS; 
  children: React.ReactNode;
} & Omit<TooltipProps, 'content' | 'children'>) => (
  <Tooltip content={BITCOIN_TERMS[term]} {...props}>
    {children}
  </Tooltip>
);

// Helper component for terms with visual indicators
export const TooltipTerm = ({ 
  term, 
  className = '',
  showIcon = true 
}: { 
  term: keyof typeof BITCOIN_TERMS; 
  className?: string;
  showIcon?: boolean;
}) => (
  <BitcoinTooltip term={term}>
    <span className={`border-b border-dotted border-bitcoin cursor-help inline-flex items-center ${className}`}>
      {BITCOIN_TERMS[term].term}
      {showIcon && <span className="ml-1 text-xs opacity-60">ℹ️</span>}
    </span>
  </BitcoinTooltip>
);