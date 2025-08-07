// Raw transaction from Mempool.space API
export interface RawTransaction {
  txid: string;
  status: {
    confirmed: boolean;
    block_height: number;
    block_time: number;
  };
  vin: Array<{
    prevout: {
      scriptpubkey_address: string;
      value: number;
    };
  }>;
  vout: Array<{
    scriptpubkey_address: string;
    value: number;
  }>;
  fee: number;
}

// Enriched transaction with annotation
export interface AnnotatedTransaction {
  txid: string;
  grantYear: number | null;
  type: 'Annual Grant' | 'Other Transaction';
  isIncoming: boolean;
  amountBTC: number;
  amountSats: number;
  date: string;
  blockHeight: number;
  valueAtTimeOfTx: number | null;
  status: 'Confirmed' | 'Unconfirmed';
  matchScore?: number;
  isManuallyAnnotated: boolean;
}

// Expected grant for matching
export interface ExpectedGrant {
  year: number;
  expectedDate: string;
  expectedAmountBTC: number;
  expectedAmountSats: number;
  isMatched: boolean;
  matchedTxid?: string;
  tolerance: {
    dateRangeDays: number;
    amountPercentage: number;
  };
}

// Form data structure
export interface TrackerFormData {
  address: string;
  vestingStartDate: string;
  annualGrantBtc: number;
}

// Validation errors
export interface FormErrors {
  address?: string;
  vestingStartDate?: string;
  annualGrantBtc?: string;
  general?: string;
}

// Annotation algorithm configuration
export interface AnnotationConfig {
  dateWeight: number; // 0.4
  amountWeight: number; // 0.6
  matchThreshold: number; // 0.75
  maxDateToleranceDays: number; // 90
  maxAmountTolerancePercent: number; // 20
}