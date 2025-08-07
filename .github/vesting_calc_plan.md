### **Revised Action Plan: The On-Chain Vesting Tracker**

The primary goal is to allow a user (like a business owner or employee) to input a Bitcoin address and vesting schedule parameters, and then see a clear, contextualized history of their annual grants.

#### **Step 1: The Foundation (No Changes Here)**

Your foundation remains solid. We'll proceed as originally planned in this area.

  * **API Choice:** **Mempool.space API**
  * **Initial File Structure:** The file structure is still good.
      * Page: `src/app/on-chain/page.tsx`
      * Store: `src/stores/onChainStore.ts`
      * Components: `src/components/on-chain/`

#### **Step 2: The Main Event: The `VestingTracker` Component**

Instead of a generic `AddressLookup`, we will build a much smarter component. This is the heart of the new page.

  * **Component Name:** `src/components/on-chain/VestingTracker.tsx`
  * **User Inputs:** This component will need more than just an address.
    1.  **Bitcoin Address/xpub:** The destination for the grants.
    2.  **Vesting Start Date:** The date when the 10-year period began.
    3.  **Annual Grant Amount (BTC):** The amount of Bitcoin granted each year.
  * **The Core Logic ("The Magic"):** This is what will make your tool special. When the user clicks "Track":
    1.  Fetch *all* transactions for the given address from the Mempool.space API.
    2.  Iterate through the vesting schedule, year by year (from Year 1 to Year 10). For each year, calculate the expected grant date (Start Date + N years).
    3.  For each transaction fetched from the blockchain, compare its amount and timestamp (`status.block_time`) to the expected grants.
    4.  **Annotate the Transactions:** Tag transactions that match a grant. A transaction is likely the "Year N Grant" if it meets two criteria:
          * Its value is very close to the `Annual Grant Amount`.
          * Its confirmation date is within a reasonable window of the expected grant date (e.g., +/- a few weeks).
    5.  Any transaction that doesn't match a grant can be labeled as "Other" or "Ad-hoc Payment".
  * **Visualization:** Do not just list raw transactions. Display the annotated data in a clean, business-friendly table with columns like:
      * `Grant Year` (e.g., "Year 1", "Year 2", "Unmatched")
      * `Date Confirmed`
      * `Type` ("Annual Grant" or "Other")
      * `Amount (BTC)`
      * `Value at Time of Grant (USD)` (This would be a killer feature, requiring historical price data which you already have access to\!)
      * `Transaction ID` (linked to Mempool.space)

#### **Step 3: State Management for a Smarter Tracker**

Our `onChainStore` needs to be more sophisticated to handle the annotation logic.

  * **File:** `src/stores/onChainStore.ts`
  * **State Shape:**
      * It will store the inputs: `address`, `vestingStartDate`, `annualGrantBtc`.
      * Instead of just `transactions`, it will store `annotatedTransactions`.
      * We'll define a new type, `AnnotatedTransaction`, which includes our custom tags (`grantYear`, `type`, `valueAtTimeOfTx`, etc.).
  * **Actions:**
      * The main action will be something like `fetchAndAnnotateTransactions`. This action will contain the core logic described in Step 2. It will perform the API call, loop through the results, and apply your business logic to produce the final, user-friendly data.

#### **Step 4: Refined Page Layout and Secondary Tools**

As you requested, we'll design the page to have a clear hierarchy. The `VestingTracker` is the star; everything else is a supporting utility.

1.  **Top of Page (`src/app/on-chain/page.tsx`):**

      * A clean title like "Bitcoin Vesting Grant Tracker".
      * The `VestingTracker.tsx` component, placed prominently.
      * The results table, displayed directly below the tracker inputs.

2.  **Bottom of Page (Footer Section):**

      * A subtle divider and a new section titled "Utilities & Network Status".
      * Place the `SatoshiCalculator.tsx` here. It's a useful tool but not part of the primary workflow.
      * Create a new, minimal `NetworkStats.tsx` component that fetches and displays the block height, fees, etc. in a simple, unobtrusive layout (e.g., a simple grid or list). This keeps the "nerdy" data available but out of the way.

-----

### **Implementation Example: `VestingTracker.tsx` & Store**

Here’s how the code for the central pieces might look.

**1. Define New Types (`src/types/on-chain.ts`)**

```ts
// src/types/on-chain.ts

// Raw transaction from Mempool.space API
export interface RawTransaction {
  txid: string;
  status: {
    confirmed: boolean;
    block_height: number;
    block_time: number; // This is a Unix timestamp
  };
  vout: {
    scriptpubkey_address: string;
    value: number; // in satoshis
  }[];
}

// Our enriched, user-friendly transaction data
export interface AnnotatedTransaction extends RawTransaction {
  grantYear: number | null; // e.g., 1, 2, 3... or null if not a grant
  type: 'Annual Grant' | 'Other';
  amountReceived: number; // Satoshis received by the tracked address
  valueAtTimeOfTx?: number; // USD value if you can get historical prices
}
```

**2. The Revamped Store (`src/stores/onChainStore.ts`)**

```ts
// src/stores/onChainStore.ts
import { create } from 'zustand';
import { RawTransaction, AnnotatedTransaction } from '@/types/on-chain';

const SATOSHIS_PER_BTC = 100_000_000;

interface VestingTrackerState {
  // Inputs
  address: string;
  vestingStartDate: string; // YYYY-MM-DD format
  annualGrantBtc: number;

  // Outputs
  annotatedTransactions: AnnotatedTransaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setAddress: (address: string) => void;
  setVestingStartDate: (date: string) => void;
  setAnnualGrantBtc: (amount: number) => void;
  fetchAndAnnotateTransactions: () => Promise<void>;
}

export const useOnChainStore = create<VestingTrackerState>((set, get) => ({
  // Initial State
  address: 'bc1q...', // Example
  vestingStartDate: '2023-01-01',
  annualGrantBtc: 0.1,
  annotatedTransactions: [],
  isLoading: false,
  error: null,

  // Setters for inputs
  setAddress: (address) => set({ address }),
  setVestingStartDate: (date) => set({ vestingStartDate }),
  setAnnualGrantBtc: (amount) => set({ annualGrantBtc }),

  // The core logic
  fetchAndAnnotateTransactions: async () => {
    const { address, vestingStartDate, annualGrantBtc } = get();
    if (!address || !vestingStartDate || !annualGrantBtc) return;

    set({ isLoading: true, error: null, annotatedTransactions: [] });

    try {
      const res = await fetch(`https://mempool.space/api/address/${address}/txs`);
      if (!res.ok) throw new Error('Failed to fetch transaction data.');
      const rawTxs: RawTransaction[] = await res.json();
      
      const annotatedTxs: AnnotatedTransaction[] = [];

      // ** ANNOTATION LOGIC GOES HERE **
      // This is a simplified example of the logic you'd build.
      // 1. Filter for only incoming transactions
      // 2. For each tx, check if its date and amount match a grant year.
      for (const tx of rawTxs) {
        // Find the amount sent to our address
        const receivedVout = tx.vout.find(o => o.scriptpubkey_address === address);
        if (!receivedVout) continue; // Skip transactions where we didn't receive funds
        
        const amountReceivedSats = receivedVout.value;
        const grantAmountSats = annualGrantBtc * SATOSHIS_PER_BTC;
        
        // Pseudo-code for matching logic
        // let grantYear = findMatchingGrantYear(tx.status.block_time, vestingStartDate);
        // let isGrantPayment = Math.abs(amountReceivedSats - grantAmountSats) < (grantAmountSats * 0.01); // 1% tolerance

        annotatedTxs.push({
          ...tx,
          grantYear: null, // Replace with real logic
          type: 'Other', // Replace with real logic
          amountReceived: amountReceivedSats,
        });
      }

      set({ annotatedTransactions: annotatedTxs, isLoading: false });

    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },
}));
```