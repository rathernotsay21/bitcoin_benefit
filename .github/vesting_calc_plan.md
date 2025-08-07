### **Action Plan: On-Chain Vesting Tracker**

This document outlines a comprehensive plan to build the "On-Chain Vesting Tracker," a new feature for the Bitcoin Benefit application. The goal is to provide users with a powerful tool to verify and analyze their Bitcoin vesting grants against on-chain data.

This revised plan expands on the initial concept by incorporating a phased development approach, a detailed testing strategy, and solutions for potential technical challenges.

---

### **Phase 1: Minimum Viable Product (MVP)**

The focus of this phase is to deliver the core functionality: fetching transactions for a single address and automatically annotating them against a user-defined vesting schedule.

#### **Step 1.1: Foundation & Scaffolding**

This remains largely unchanged, establishing the project's structure.

*   **API Choice:** **Mempool.space API**. It's free, public, and requires no API key, making it ideal for the MVP.
    *   *Note:* The standard endpoint works for single addresses. Support for xpubs will be deferred to a future phase due to its complexity (requiring address derivation and multiple API calls).
*   **File Structure:**
    *   Page: `src/app/on-chain/page.tsx`
    *   Store: `src/stores/onChainStore.ts`
    *   Components: `src/components/on-chain/`
    *   Types: `src/types/on-chain.ts` (Create this file first)

#### **Step 1.2: Component Implementation**

We will break the UI into logical, manageable components.

1.  **`VestingTrackerForm.tsx`:**
    *   **Responsibility:** Capture all user inputs.
    *   **Inputs:**
        *   Bitcoin Address (string)
        *   Vesting Start Date (date)
        *   Annual Grant Amount (number, in BTC)
    *   **Validation:** Implement client-side validation using **Zod** (already in the project). Provide clear error messages for invalid Bitcoin addresses, dates, or grant amounts.
    *   **Action:** A "Track Vesting" button that triggers the `fetchAndAnnotateTransactions` action in the store. The button should be disabled while data is loading.

2.  **`VestingTrackerResults.tsx`:**
    *   **Responsibility:** Display the annotated transaction data in a clean, business-friendly table.
    *   **Columns:**
        *   `Grant Year`: (e.g., "Year 1", "Year 2", "Unmatched")
        *   `Date Confirmed`: Human-readable date.
        *   `Type`: "Annual Grant" or "Other Transaction".
        *   `Amount (BTC)`
        *   `Value at Time of Grant (USD)`: The "killer feature".
        *   `Transaction ID`: Linked to a block explorer like Mempool.space.
    *   **States:** This component must handle and clearly display:
        *   **Loading State:** A skeleton loader or spinner while fetching and annotating.
        *   **Empty State:** A message for when the user hasn't performed a search yet.
        *   **No Results State:** A message for when the address has no transactions.
        *   **Error State:** A clear error message if the API call fails.

#### **Step 1.3: State Management (`onChainStore.ts`)**

The store will manage the application's state and contain the core business logic.

*   **State Shape:**
    *   Inputs: `address`, `vestingStartDate`, `annualGrantBtc`.
    *   Form Validation: `formErrors` object to hold validation messages.
    *   Core Data: `annotatedTransactions: AnnotatedTransaction[]`.
    *   Status: `isLoading: boolean`, `error: string | null`.
*   **Actions:**
    *   `setAddress`, `setVestingStartDate`, `setAnnualGrantBtc`: Simple setters for form inputs.
    *   `validateForm`: A new action to run Zod validation before fetching.
    *   `fetchAndAnnotateTransactions`: The primary action. This will be a wrapper that calls smaller, pure functions for testability.

#### **Step 1.4: Core Logic: Annotation & Price Fetching**

This is the "magic" of the tool. The logic should be implemented in pure, testable functions separate from the Zustand store actions.

1.  **Transaction Fetching:**
    *   In the store, call the Mempool.space API: `https://mempool.space/api/address/${address}/txs`.
    *   Handle potential API errors gracefully.
    *   *Note:* The API may return a large number of transactions. For the MVP, we will fetch all, but we must note that pagination is a required improvement for addresses with extensive history.

2.  **Historical Price Fetching:**
    *   For each transaction, use its `block_time` to query the existing `historical-bitcoin-api.ts`.
    *   To optimize, create a batching function: collect all unique dates from the transactions and make a single call to a new (to be created) batch endpoint in the historical API wrapper if possible, or perform calls concurrently using `Promise.all`.

3.  **Annotation Algorithm (`annotateTransactions.ts`):**
    *   **Input:** `rawTxs: RawTransaction[]`, `vestingStartDate: string`, `annualGrantBtc: number`.
    *   **Output:** `annotatedTxs: AnnotatedTransaction[]`.
    *   **Steps:**
        1.  Generate a list of 10 "expected grants," each with an `expectedDate` and `expectedAmount` in Satoshis.
        2.  Filter the `rawTxs` to include only incoming transactions (where the address is in a `vout`).
        3.  For each transaction, calculate a "match score" against each *unmatched* expected grant. The score should weigh both date and amount proximity.
            *   `dateCloseness = 1 / (abs(tx_timestamp - expected_grant_timestamp) + 1)`
            *   `amountCloseness = 1 - (abs(tx_sats - expected_grant_sats) / expected_grant_sats)`
            *   `matchScore = (dateCloseness * 0.4) + (amountCloseness * 0.6)` (weights can be tuned)
        4.  If a transaction's best score is above a defined threshold (e.g., 0.75), tag it as the corresponding "Annual Grant" and mark that grant as "matched".
        5.  Transactions with no good match are tagged as "Other Transaction".
        6.  Return the fully annotated list.

---

### **Phase 2: User Experience & Robustness**

With the core functionality in place, this phase focuses on making the tool more intuitive, powerful, and reliable.

#### **Step 2.1: Advanced UI/UX - Visual Timeline**

*   **Component:** `VestingTimelineVisualizer.tsx`
*   **Functionality:** Create a new Recharts-based component that displays a 10-year timeline.
    *   Plot the 10 expected grant dates as markers on the timeline.
    *   When transactions are annotated, display the matched grants as filled-in markers on the timeline, possibly color-coded (e.g., green for on-time, yellow for slightly off).
    *   This provides an immediate, high-level overview of the vesting progress.

#### **Step 2.2: Manual Annotation Override**

*   **Problem:** The automatic annotation may not always be perfect (e.g., a grant was paid in two parts).
*   **Solution:**
    *   **UI:** Add a dropdown or button to each row in the `VestingTrackerResults` table.
    *   **Functionality:** Allow the user to manually change a transaction's type (e.g., re-assign an "Other" transaction to be the "Year 3 Grant").
    *   **State:** Add `manualAnnotations: Map<txid, grantYear>` to the `onChainStore` to track user overrides. The annotation logic will apply these overrides at the end of its process.

#### **Step 2.3: Privacy & Security Disclaimer**

*   **Action:** Add a clear, non-intrusive disclaimer on the page.
*   **Text:** "Your Bitcoin address and transaction history are sent to the public Mempool.space API for analysis. This data is not stored on our servers. Use a view-only wallet or a fresh address for enhanced privacy."

---

### **Phase 3: Advanced Features (Future Scope)**

These features add significant power but also complexity, and should be tackled after the core product is stable.

*   **xpub Support:**
    *   **Challenge:** Requires deriving addresses from the xpub, which is a complex, client-side operation, likely needing a library like `bitcoinjs-lib`.
    *   **Implementation:**
        1.  Add an input for derivation path.
        2.  Derive a range of addresses (e.g., the first 20 receive and 20 change addresses).
        3.  Fetch transactions for all derived addresses concurrently.
        4.  The annotation logic would need to aggregate transactions across all addresses.
*   **Handling Complex Transactions:**
    *   Implement logic to detect and automatically group split payments (multiple transactions close in time that add up to a grant amount).
    *   Allow users to manually group multiple transactions into a single grant.
*   **Data Persistence:**
    *   Allow users to save their tracking sessions (address, start date, manual annotations) to `localStorage` so they don't have to re-enter the data each time.

---

### **Testing Strategy**

A robust feature requires a robust testing strategy.

1.  **Unit Tests (Jest):**
    *   **`annotateTransactions.ts`:** This is the highest priority. Create extensive tests for the annotation logic with various scenarios:
        *   Perfect matches.
        *   Transactions that are slightly early/late or have slightly different amounts.
        *   Transactions that are clearly not grants.
        *   Addresses with no incoming transactions.
    *   **Store Selectors:** Test any complex selectors that derive data from the state.

2.  **Component Tests (React Testing Library):**
    *   Test `VestingTrackerForm.tsx` for input handling and validation feedback.
    *   Test `VestingTrackerResults.tsx` for correct rendering of all states (loading, error, empty, and results).

3.  **Integration Tests:**
    *   Test the full user flow:
        1.  User fills out the form.
        2.  Clicks "Track".
        3.  Verify the store action is called.
        4.  Mock the Mempool and historical price APIs.
        5.  Verify the results table is populated with correctly annotated data based on the mock API responses.

---

### **Updated Code Examples**

#### **`src/types/on-chain.ts`**
```ts
// Raw transaction from Mempool.space API
export interface RawTransaction {
  txid: string;
  status: {
    confirmed: boolean;
    block_height: number;
    block_time: number; // Unix timestamp
  };
  vin: {
    prevout: {
      scriptpubkey_address: string;
    };
  }[];
  vout: {
    scriptpubkey_address: string;
    value: number; // in satoshis
  }[];
}

// Our enriched, user-friendly transaction data
export interface AnnotatedTransaction {
  txid: string;
  grantYear: number | null; // e.g., 1, 2, 3... or null
  type: 'Annual Grant' | 'Other Transaction';
  isIncoming: boolean;
  amountBTC: number;
  date: string; // ISO string
  valueAtTimeOfTx?: number; // USD value
  status: 'Confirmed' | 'Unconfirmed';
}
```

#### **`src/stores/onChainStore.ts` (Conceptual)**
```ts
import { create } from 'zustand';
import { ZodError } from 'zod';
import { annotateTransactions } from '@/lib/on-chain/annotateTransactions';
import { fetchAllTransactions } from '@/lib/on-chain/mempool-api';
import { trackerFormSchema } from '@/lib/on-chain/validation';
// ... other imports

export const useOnChainStore = create<OnChainState>((set, get) => ({
  // ... initial state ...

  validateAndFetch: async () => {
    const { address, vestingStartDate, annualGrantBtc } = get();
    try {
      // 1. Validate Inputs
      trackerFormSchema.parse({ address, vestingStartDate, annualGrantBtc });
      set({ isLoading: true, error: null, formErrors: {} });

      // 2. Fetch Data (from our own API wrappers)
      const rawTxs = await fetchAllTransactions(address);
      // ... logic to fetch historical prices ...

      // 3. Annotate Data (using pure, testable function)
      const annotatedTxs = annotateTransactions(rawTxs, vestingStartDate, annualGrantBtc, historicalPrices);

      set({ annotatedTransactions: annotatedTxs, isLoading: false });

    } catch (err) {
      if (err instanceof ZodError) {
        // Handle validation errors
        const errors = ... // format Zod errors
        set({ formErrors: errors });
      } else {
        // Handle API/other errors
        set({ error: (err as Error).message, isLoading: false });
      }
    }
  },
}));
```
