# Requirements Document

## Introduction

The On-Chain Vesting Tracker is a comprehensive feature that allows users to verify and analyze their Bitcoin vesting grants against actual on-chain transaction data. This tool will automatically match transactions from a Bitcoin address to expected vesting schedule payments, providing users with detailed insights including historical USD values at the time of each grant. The feature addresses the critical need for employees and contractors to track and verify their Bitcoin-based compensation against their vesting agreements.

## Requirements

### Requirement 1: Address Input and Validation

**User Story:** As a user with Bitcoin vesting grants, I want to input my Bitcoin address so that the system can fetch and analyze my transaction history.

#### Acceptance Criteria

1. WHEN a user enters a Bitcoin address THEN the system SHALL validate the address format using proper Bitcoin address validation
2. IF the address format is invalid THEN the system SHALL display a clear error message indicating the address is not valid
3. WHEN a valid address is entered THEN the system SHALL enable the tracking functionality
4. THE system SHALL support standard Bitcoin address formats (P2PKH, P2SH, Bech32)

### Requirement 2: Vesting Schedule Configuration

**User Story:** As a user with a vesting agreement, I want to configure my vesting schedule parameters so that the system can match transactions to expected grant dates.

#### Acceptance Criteria

1. WHEN configuring vesting parameters THEN the system SHALL require a vesting start date input
2. WHEN configuring vesting parameters THEN the system SHALL require an annual grant amount in BTC
3. IF the vesting start date is in the future THEN the system SHALL display a warning message
4. IF the annual grant amount is zero or negative THEN the system SHALL display an error message
5. WHEN valid parameters are entered THEN the system SHALL calculate 10 years of expected grant dates
6. THE system SHALL assume annual vesting with grants occurring on the anniversary of the start date

### Requirement 3: Transaction Fetching and Processing

**User Story:** As a user tracking my vesting, I want the system to automatically fetch my transaction history so that I can see all relevant transactions.

#### Acceptance Criteria

1. WHEN the user initiates tracking THEN the system SHALL fetch transaction data from the Mempool.space API
2. WHEN fetching transactions THEN the system SHALL display a loading state to indicate progress
3. IF the API request fails THEN the system SHALL display a clear error message with retry option
4. WHEN transactions are successfully fetched THEN the system SHALL filter for incoming transactions only
5. THE system SHALL handle addresses with no transaction history gracefully
6. THE system SHALL process all available transactions without pagination limits for MVP

### Requirement 4: Automatic Transaction Annotation

**User Story:** As a user with vesting grants, I want the system to automatically identify which transactions correspond to my vesting payments so that I can easily track my compensation.

#### Acceptance Criteria

1. WHEN processing transactions THEN the system SHALL calculate match scores based on date and amount proximity
2. WHEN calculating match scores THEN the system SHALL weight amount accuracy at 60% and date proximity at 40%
3. IF a transaction's match score exceeds 0.75 threshold THEN the system SHALL annotate it as an "Annual Grant"
4. IF a transaction's match score is below the threshold THEN the system SHALL annotate it as "Other Transaction"
5. WHEN a transaction is matched to a grant year THEN that grant year SHALL be marked as fulfilled
6. THE system SHALL ensure each expected grant can only be matched to one transaction
7. THE system SHALL handle cases where multiple transactions could match the same grant period

### Requirement 5: Historical Price Integration

**User Story:** As a user tracking vesting value, I want to see the USD value of each transaction at the time it occurred so that I can understand the historical value of my grants.

#### Acceptance Criteria

1. WHEN processing annotated transactions THEN the system SHALL fetch historical Bitcoin prices for each transaction date
2. WHEN historical prices are available THEN the system SHALL calculate and display USD value at time of transaction
3. IF historical price data is unavailable THEN the system SHALL indicate this clearly in the results
4. THE system SHALL use the existing historical Bitcoin API for price data
5. THE system SHALL optimize API calls by batching requests for unique dates
6. WHEN price fetching fails THEN the system SHALL still display transaction data without USD values

### Requirement 6: Results Display and Visualization

**User Story:** As a user reviewing my vesting history, I want to see a clear, organized view of all my transactions with their annotations so that I can easily understand my vesting progress.

#### Acceptance Criteria

1. WHEN displaying results THEN the system SHALL show transactions in a table format with the following columns:
   - Grant Year (e.g., "Year 1", "Year 2", "Unmatched")
   - Date Confirmed (human-readable format)
   - Type ("Annual Grant" or "Other Transaction")
   - Amount in BTC
   - Value at Time of Grant in USD
   - Transaction ID (linked to block explorer)
2. WHEN no transactions are found THEN the system SHALL display an appropriate empty state message
3. WHEN transactions are loading THEN the system SHALL display skeleton loaders or loading indicators
4. WHEN an error occurs THEN the system SHALL display a clear error state with actionable guidance
5. THE system SHALL sort transactions by date in descending order (newest first)
6. THE system SHALL make transaction IDs clickable links to Mempool.space block explorer

### Requirement 7: Form Validation and Error Handling

**User Story:** As a user entering vesting information, I want clear feedback on any input errors so that I can correct them and successfully track my vesting.

#### Acceptance Criteria

1. WHEN form validation fails THEN the system SHALL display specific error messages for each invalid field
2. WHEN the tracking button is clicked THEN the system SHALL validate all inputs before proceeding
3. IF validation fails THEN the system SHALL prevent form submission and highlight invalid fields
4. WHEN inputs are being corrected THEN the system SHALL clear error messages as fields become valid
5. THE system SHALL use Zod validation library for consistent validation logic
6. THE system SHALL disable the tracking button while requests are in progress

### Requirement 8: Privacy and Security Considerations

**User Story:** As a privacy-conscious user, I want to understand how my data is being used so that I can make informed decisions about using the tracker.

#### Acceptance Criteria

1. WHEN the user accesses the tracker page THEN the system SHALL display a privacy disclaimer
2. THE disclaimer SHALL clearly state that Bitcoin addresses are sent to public APIs
3. THE disclaimer SHALL indicate that no data is stored on the application servers
4. THE disclaimer SHALL recommend using view-only wallets or fresh addresses for enhanced privacy
5. THE system SHALL not store any user input data beyond the current session
6. THE system SHALL not log or persist Bitcoin addresses or transaction data

### Requirement 9: Loading States and User Feedback

**User Story:** As a user waiting for transaction analysis, I want clear feedback on the system's progress so that I know the application is working and how long to expect to wait.

#### Acceptance Criteria

1. WHEN fetching transaction data THEN the system SHALL display a loading indicator
2. WHEN processing transactions THEN the system SHALL show progress feedback
3. WHEN fetching historical prices THEN the system SHALL indicate this step in the loading process
4. THE system SHALL disable form inputs while processing to prevent conflicting requests
5. THE system SHALL provide estimated time feedback for longer operations
6. IF processing takes longer than expected THEN the system SHALL show additional context about the delay

### Requirement 10: Error Recovery and Resilience

**User Story:** As a user experiencing errors, I want the system to handle failures gracefully and provide me with options to retry or resolve issues.

#### Acceptance Criteria

1. WHEN API requests fail THEN the system SHALL provide retry functionality
2. WHEN partial data is available THEN the system SHALL display what it can while indicating missing information
3. IF the Mempool.space API is unavailable THEN the system SHALL display an appropriate error message
4. WHEN network errors occur THEN the system SHALL distinguish between network and application errors
5. THE system SHALL log errors appropriately for debugging while maintaining user privacy
6. THE system SHALL provide fallback behavior when non-critical features fail