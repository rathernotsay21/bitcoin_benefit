'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info } from 'lucide-react';
import { EducationalContent } from '@/types/bitcoin-tools';

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

interface BitcoinTooltipProps {
  term: keyof typeof BITCOIN_TERMS;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function BitcoinTooltip({ 
  term, 
  children, 
  side = 'top',
  className = ''
}: BitcoinTooltipProps) {
  const content = BITCOIN_TERMS[term];
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 border-b border-dotted border-bitcoin cursor-help hover:border-solid transition-all duration-200 ${className}`}>
            {children}
            <Info className="w-3 h-3 opacity-60 hover:opacity-100 transition-opacity" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-sm p-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{content.term}</h4>
              <Badge variant="outline" className="text-xs bg-bitcoin text-white border-bitcoin">
                Bitcoin
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{content.definition}</p>
            {content.example && (
              <div className="border-l-2 border-bitcoin/50 pl-2">
                <p className="text-xs italic opacity-90">
                  <strong>Example:</strong> {content.example}
                </p>
              </div>
            )}
            {content.learnMoreUrl && (
              <a 
                href={content.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-bitcoin hover:text-bitcoin/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Learn more →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper component for terms with visual indicators
export function TooltipTerm({ 
  term, 
  className = '',
  side = 'top'
}: { 
  term: keyof typeof BITCOIN_TERMS; 
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <BitcoinTooltip term={term} side={side} className={className}>
      <span className="font-medium">
        {BITCOIN_TERMS[term].term}
      </span>
    </BitcoinTooltip>
  );
}

// Quick reference tooltip for displaying just the definition
export function QuickTooltip({ 
  content, 
  children,
  side = 'top',
  className = ''
}: {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs text-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}