# Language Update Changes - December 26, 2024

## Summary
Updated all user-facing instances of "Bonus" to "Award" and "Grant" to "Award" throughout the Bitcoin Benefit application to maintain consistent terminology.

## Files Modified and Changes Made

### 1. src/app/calculator/[plan]/CalculatorPlanClient.tsx
- **Line 311:** "Bitcoin Bonus Amount" → "Bitcoin Award Amount"
- **Line 327:** "Yearly Bitcoin Bonus" → "Yearly Bitcoin Award"

### 2. src/app/historical/page.tsx
- **Line 258:** "Starting Bitcoin Bonus" → "Starting Bitcoin Award"
- **Line 279:** "Yearly Bitcoin Bonus" → "Yearly Bitcoin Award"

### 3. src/components/HistoricalDataTable.tsx
- **Line 99:** "Bonus Cost" → "Award Cost"
- **Line 254:** Headers array: "Bonus Cost" → "Award Cost"

### 4. src/lib/help-content.ts
- **Line 20:** "fund all Bitcoin grants" → "fund all Bitcoin awards"
- **Line 50:** "purchase price of Bitcoin grants" → "purchase price of Bitcoin awards"
- **Line 62:** "store and manage Bitcoin grants" → "store and manage Bitcoin awards"
- **Line 64:** "value at grant time" → "value at award time"

### 5. src/components/charts/vesting/VestingChartTooltip.tsx
- **Line 79:** "Grant Value:" → "Award Value:"

### 6. src/components/VestingTimelineChartRecharts.tsx
- **Line 141:** "New Grant" → "New Award"
- **Line 675:** "Initial Grant:" → "Initial Award:"
- **Line 680:** "Annual Grant:" → "Annual Award:"

### 7. src/components/on-chain/VestingTrackerResults.tsx
- **Line 106:** "Grant Year" → "Award Year"
- **Line 659:** "Vesting Grants Matched" → "Vesting Awards Matched"

### 8. src/components/on-chain/OnChainTimelineVisualizer.tsx
- **Line 169:** "Grant Status Breakdown" → "Award Status Breakdown"
- **Line 337:** "10-Year Vesting Grant Timeline" → "10-Year Vesting Award Timeline"

### 9. src/components/on-chain/VestingTrackerResultsOptimized.tsx
- **Line 151:** "Vesting Grants Matched" → "Vesting Awards Matched"

### 10. src/components/Footer.tsx
- **Line 121:** "Track Bonuses" → "Track Awards"

### 11. src/components/VestingTimelineChartRecharts.tsx
- **Line 703:** "Standard vesting:" → "Standard unlocking:"
- **Line 730:** "Standard vesting:" → "Standard unlocking:"

### 12. src/components/HistoricalTimelineVisualizationOptimized.tsx
- **Line 466:** "grant information, vesting status" → "award information, unlocking status"

### 13. src/app/track/page.tsx
- **Line 186:** "matching to vesting schedule" → "matching to unlocking schedule"
- **Line 306:** "vesting awards" → "unlocking awards"
- **Line 311:** "grant years" → "award years"
- **Line 321:** "See grants and vesting" → "See awards and unlocking"
- **Line 435:** "vesting awards matched" → "unlocking awards matched"
- **Line 615:** "Unlocking Grants Matched" → "Unlocking Awards Matched"

## Impact
These changes ensure consistent use of the term "Award" instead of "Bonus" or "Grant" in all user-facing text, improving clarity and maintaining brand consistency throughout the application.

## Notes
- Component names and variable names were not changed to avoid breaking the codebase
- The term "Vesting" was retained as it is industry-standard terminology
- All changes are purely cosmetic and do not affect functionality