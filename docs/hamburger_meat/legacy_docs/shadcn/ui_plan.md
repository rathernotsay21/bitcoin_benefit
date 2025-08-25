# shadcn/ui Component Integration Plan

## Implementation Checklist (Ordered by Value)

### 1. ✅ **Mobile Navigation Sheet** (HIGHEST VALUE - INCLUDING TOOLS PAGE)
**Impact:** Improves UX for ~50% of users on mobile devices
**Location:** `src/components/Navigation.tsx`

#### Implementation Steps:
- [x] Install Sheet component: `npx shadcn-ui@latest add sheet`
- [x] Create new component `src/components/MobileNavSheet.tsx`
- [x] Import Sheet, SheetContent, SheetTrigger, SheetHeader from shadcn
- [x] Replace mobile navigation grid with hamburger menu trigger
- [x] Move nav items into Sheet with vertical stack layout
- [x] Add theme toggle inside Sheet header
- [x] Preserve active route highlighting logic
- [x] Auto-close Sheet on route change using `usePathname` hook
- [ ] Test on various mobile viewport sizes (320px-768px)

**Key Considerations:**
- Maintain Bitcoin orange theme colors in Sheet
- Keep icon components (HomeIcon, CalculatorIcon, etc.) 
- Ensure Sheet backdrop works with dark mode

---

### 2. ✅ **Tabs for Scheme Selection** (HIGH VALUE)
**Impact:** Reduces vertical scroll, cleaner calculator interface
**Location:** `src/app/calculator/[scheme]/page.tsx` and `src/app/historical/page.tsx`

#### Implementation Steps:
- [x] Install Tabs component: `npx shadcn-ui@latest add tabs`
- [x] Create `src/components/SchemeTabSelector.tsx`
- [x] Replace radio card pattern with Tabs component
- [x] Map schemes to TabsList > TabsTrigger components
- [x] Use TabsContent for scheme descriptions
- [x] Implement URL sync: Update searchParams when tab changes
- [x] Add keyboard navigation support (arrow keys)
- [x] Style active tab with Bitcoin orange accent
- [ ] Mobile: Consider horizontal scroll or dropdown fallback

**Key Considerations:**
- Preserve URL-based scheme selection (`?scheme=accelerator`)
- Keep scheme data structure unchanged
- Maintain two-way binding with store

---

### 3. ✅ **Dialog for Custom Vesting Schedule** (HIGH VALUE)
**Impact:** Better UX for complex form, proper focus management
**Location:** `src/components/CustomVestingSchedule.tsx`

#### Implementation Steps:
- [x] Install Dialog component: `npx shadcn-ui@latest add dialog`
- [x] Install Form components: `npx shadcn-ui@latest add form`
- [ ] Refactor component to use Dialog wrapper
- [ ] Move "Customize" button to DialogTrigger
- [ ] Place vesting form inside DialogContent
- [ ] Add DialogHeader with title and description
- [ ] Implement form validation with react-hook-form
- [ ] Add "Save" and "Cancel" actions in DialogFooter
- [ ] Show preview of vesting schedule in Dialog
- [ ] Add confirmation before clearing custom events

**Key Considerations:**
- Preserve all existing vesting logic
- Maintain state management with parent component
- Ensure Dialog is responsive on mobile
- Add escape key and backdrop click to close

---

### 4. ✅ **Enhanced Data Tables** (HIGH VALUE)
**Impact:** Better data visualization, sorting, responsive behavior
**Location:** `src/app/historical/page.tsx` (Annual Breakdown table)

#### Implementation Steps:
- [x] Install Table component: `npx shadcn-ui@latest add table`
- [ ] Create `src/components/HistoricalDataTable.tsx`
- [ ] Convert HTML table to shadcn Table components
- [ ] Add column sorting functionality for Year, BTC, USD values
- [ ] Implement responsive behavior:
  - Mobile: Show only Year, BTC, Current USD
  - Tablet: Add Grant Cost, BTC Price
  - Desktop: Show all columns
- [ ] Add row highlighting for milestone years (5, 10)
- [ ] Implement sticky header for scrolling
- [ ] Add CSV export button using existing data
- [ ] Format numbers with proper alignment

**Key Considerations:**
- Preserve all calculated values and formulas
- Maintain color coding for vesting milestones
- Keep performance optimized for 10+ years of data

---

### 5. ✅ **Tooltip for Help Text** (HIGH VALUE)
**Impact:** Reduces UI clutter while providing necessary explanations
**Locations:** Throughout calculator forms and metric displays

#### Implementation Steps:
- [x] Install Tooltip component: `npx shadcn-ui@latest add tooltip`
- [x] Create `src/components/HelpTooltip.tsx` wrapper component
- [x] Add TooltipProvider to layout wrapper
- [x] Identify all technical terms needing explanation:
  - CAGR, ROI, Vesting, Cost Basis Method
  - Initial Grant, Annual Grant, Growth Multiple
- [x] Add info icon (QuestionMarkCircleIcon) next to terms
- [x] Write concise explanations (< 100 words)
- [x] Style with consistent dark/light mode support
- [x] Add keyboard accessibility (focus + Enter to show)

**Key Considerations:**
- Don't overuse - only for truly unclear terms
- Keep explanations concise and jargon-free
- Test touch targets on mobile (min 44x44px)

---

### 6. 🔄 **Skeleton Loading States** (MEDIUM VALUE)
**Impact:** Better perceived performance during data fetching
**Locations:** Calculator results, Historical timeline, Metric cards

#### Implementation Steps:
- [x] Install Skeleton component: `npx shadcn-ui@latest add skeleton`
- [x] Create loading skeletons for:
  - MetricCards (3-card layout skeleton)
  - Chart areas (rectangular skeleton with shimmer)
  - Table rows (5-row skeleton structure)
- [x] Replace existing spinner-only loading states
- [x] Match skeleton dimensions to actual content
- [x] Add subtle pulse animation
- [x] Implement progressive loading (cards → chart → table)

**Key Considerations:**
- Keep existing loading logic in stores
- Ensure skeletons match dark/light themes
- Don't over-animate (subtle is better)

---

### 7. 🔄 **Alert for Error States** (MEDIUM VALUE)
**Impact:** Cleaner, more consistent error messaging
**Locations:** API errors, calculation errors, validation errors

#### Implementation Steps:
- [x] Install Alert component: `npx shadcn-ui@latest add alert`
- [x] Create `src/components/ErrorAlert.tsx` wrapper
- [x] Replace custom error cards with Alert component
- [x] Add variants: destructive (errors), warning (validation), info
- [x] Include retry button in error alerts
- [x] Add dismiss capability for non-critical warnings
- [x] Implement toast notifications for transient errors

**Key Considerations:**
- Preserve existing error messages
- Keep retry functionality
- Don't block UI unnecessarily

---

### 8. 🔄 **Form Components Enhancement** (MEDIUM VALUE)
**Impact:** More consistent form styling and validation
**Locations:** All input fields in calculators

#### Implementation Steps:
- [x] Install form components: `npx shadcn-ui@latest add input select label`
- [x] Create form component wrappers maintaining Bitcoin theme
- [x] Replace native inputs while preserving:
  - Existing validation logic
  - Store bindings
  - Disabled states during loading
- [x] Add proper label associations for accessibility
- [x] Implement consistent error state styling
- [x] Add input masks for BTC amounts (0.000 format)

**Key Considerations:**
- Don't break existing form logic
- Maintain number input precision for BTC
- Keep responsive sizing

---

### 9. 🔄 **Progress Indicator for Vesting** (MEDIUM VALUE)
**Impact:** Visual improvement for vesting timeline comprehension
**Location:** Vesting timeline displays

#### Implementation Steps:
- [ ] Install Progress component: `npx shadcn-ui@latest add progress`
- [ ] Create `src/components/VestingProgress.tsx`
- [ ] Add progress bars showing:
  - Overall vesting completion
  - Time until next vesting event
  - Individual grant vesting status
- [ ] Color code by vesting percentage (red→yellow→green)
- [ ] Add milestone markers at key percentages
- [ ] Animate on value changes

**Key Considerations:**
- Calculate progress from existing vesting data
- Ensure accessibility with ARIA labels
- Keep it simple - don't over-complicate

---

## Implementation Order Rationale

1. **Mobile Sheet** - Immediate impact on mobile users, relatively isolated change
2. **Tabs** - Major visual improvement, affects main calculator flow
3. **Dialog** - Complex component that needs careful testing
4. **Table** - Data-heavy component requiring responsive design
5. **Tooltips** - Throughout app, needs content writing
6-9. **Medium priority** - Nice-to-haves that can be done incrementally

## Testing Checklist

- [ ] Test all components in both light and dark modes
- [ ] Verify mobile responsiveness (320px - 768px)
- [ ] Check keyboard navigation and accessibility
- [ ] Ensure no regression in calculation logic
- [ ] Test with slow network (loading states)
- [ ] Verify URL parameter handling still works
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

## Dependencies to Add

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-sheet": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-tooltip": "latest",
    "@radix-ui/react-alert": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-separator": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest"
  }
}
```

## Notes

- All shadcn components should be installed using the CLI to ensure proper theming
- Maintain existing Bitcoin orange (#F7931A) color scheme throughout
- Preserve all existing business logic - these are UI improvements only
- Consider creating a feature branch for testing before merging to main

---

## Continued: Additional Implementation Details

### 4. ✅ **Enhanced Data Tables (continued)**

```tsx
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-bitcoin">
            ₿{data.reduce((sum, row) => sum + row.btcAmount, 0).toFixed(3)}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">Total BTC</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            ${data[data.length - 1]?.currentValue.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">Current Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {((data[data.length - 1]?.currentValue / data.reduce((sum, row) => sum + row.grantCost, 0) - 1) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">ROI</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-slate-400">Years</div>
        </div>
      </div>
    </div>
  );
}
```

##### Step 3: Integration in Historical Page
```tsx
// In src/app/historical/page.tsx, replace the existing table with:
import HistoricalDataTable from '@/components/HistoricalDataTable';

// Prepare data for the table
const tableData = useMemo(() => {
  if (!historicalResults) return [];
  
  const currentYear = new Date().getFullYear();
  const yearlyData = [];
  
  for (let year = startingYear; year <= currentYear; year++) {
    const yearPoints = historicalResults.timeline.filter(p => p.year === year);
    if (yearPoints.length > 0) {
      const lastPoint = yearPoints[yearPoints.length - 1];
      const yearsFromStart = year - startingYear;
      
      // Calculate grant cost for this year
      const yearGrants = historicalResults.grantBreakdown.filter(grant => grant.year === year);
      const grantCost = yearGrants.reduce((sum, grant) => {
        const grantYearPrices = historicalPrices[grant.year];
        if (grantYearPrices) {
          let grantPrice = 0;
          switch (costBasisMethod) {
            case 'high': grantPrice = grantYearPrices.high; break;
            case 'low': grantPrice = grantYearPrices.low; break;
            case 'average': grantPrice = grantYearPrices.average; break;
          }
          return sum + (grant.amount * grantPrice);
        }
        return sum;
      }, 0);
      
      yearlyData.push({
        year,
        grantCost,
        btcAmount: lastPoint.cumulativeBitcoin,
        historicalPrice: historicalPrices[year]?.[costBasisMethod] || 0,
        currentValue: lastPoint.currentValue,
        vestingPercent: yearsFromStart >= 10 ? 100 : yearsFromStart >= 5 ? 50 : 0
      });
    }
  }
  
  return yearlyData;
}, [historicalResults, startingYear, historicalPrices, costBasisMethod]);

// Use the component
<HistoricalDataTable 
  data={tableData}
  currentBitcoinPrice={currentBitcoinPrice}
  startingYear={startingYear}
/>
```

---

### 5. ✅ **Tooltip for Help Text** (HIGH VALUE)

##### Step 1: Install Dependencies
```bash
npx shadcn-ui@latest add tooltip
```

##### Step 2: Create HelpTooltip Component
Create `src/components/HelpTooltip.tsx`:

```tsx
'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export default function HelpTooltip({ 
  content, 
  side = 'top',
  className = ''
}: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors ${className}`}
            aria-label="Help"
          >
            <QuestionMarkCircleIcon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs text-sm bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

##### Step 3: Create Tooltip Content Dictionary
Create `src/lib/help-content.ts`:

```typescript
export const HELP_CONTENT = {
  // Calculator Terms
  initialGrant: "The initial Bitcoin amount granted to the employee when they join. This is the base benefit that vests over time.",
  
  annualGrant: "Additional Bitcoin granted each year as a retention bonus. These grants have their own vesting schedules.",
  
  vestingSchedule: "The timeline determining when employees can claim ownership of their Bitcoin grants. Prevents immediate departure after receiving benefits.",
  
  costBasisMethod: "How the initial purchase price is calculated: Average (typical market price), High (worst case for employer), or Low (best case for employer).",
  
  // Metrics Terms
  cagr: "Compound Annual Growth Rate - The average yearly growth rate of an investment over a period of time, accounting for compounding.",
  
  roi: "Return on Investment - The percentage gain or loss on an investment relative to its initial cost. Calculated as (Current Value - Initial Cost) / Initial Cost × 100.",
  
  growthMultiple: "How many times the initial investment has grown. A 3x multiple means the investment is worth 3 times its original value.",
  
  // Vesting Terms
  cliffVesting: "A vesting schedule where no benefits vest until a specific date, then a large percentage vests all at once.",
  
  gradualVesting: "Benefits vest incrementally over time, typically monthly or quarterly, providing a smooth vesting curve.",
  
  acceleratedVesting: "Vesting speeds up under certain conditions, such as company acquisition or IPO.",
  
  // Bitcoin Terms
  btcPrice: "The current market price of Bitcoin in USD. This fluctuates based on market conditions.",
  
  satoshi: "The smallest unit of Bitcoin (0.00000001 BTC). Named after Bitcoin's creator, Satoshi Nakamoto.",
  
  coldStorage: "Offline storage of Bitcoin private keys, typically using hardware wallets. The most secure storage method.",
  
  // Strategy Terms
  pioneerStrategy: "High-risk, high-reward approach with larger upfront grants. Best for early-stage startups wanting to attract top talent.",
  
  stackerStrategy: "Balanced approach with moderate initial grants plus annual bonuses. Suitable for growing companies.",
  
  builderStrategy: "Conservative approach with smaller, steady grants over time. Ideal for established companies testing Bitcoin benefits.",
} as const;
```

##### Step 4: Implement Throughout UI
```tsx
// Example usage in calculator form:
import HelpTooltip from '@/components/HelpTooltip';
import { HELP_CONTENT } from '@/lib/help-content';

// In your form fields:
<div className="space-y-2">
  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-slate-300">
    Initial Grant (BTC)
    <HelpTooltip content={HELP_CONTENT.initialGrant} />
  </label>
  <input
    type="number"
    step="0.001"
    className="input-field"
    // ... rest of input props
  />
</div>

// In metric displays:
<div className="metric-card">
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">
      CAGR
      <HelpTooltip content={HELP_CONTENT.cagr} side="right" />
    </span>
    <span className="text-lg font-bold">{cagr.toFixed(1)}%</span>
  </div>
</div>
```

---

### 6. 🔄 **Skeleton Loading States** (MEDIUM VALUE)

##### Step 1: Install Dependencies
```bash
npx shadcn-ui@latest add skeleton
```

##### Step 2: Create Loading Skeletons
Create `src/components/loading/EnhancedSkeletons.tsx`:

```tsx
'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-xl border-2 border-gray-200 dark:border-slate-700 p-4">
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="relative h-[400px]">
        <Skeleton className="absolute inset-0" />
        {/* Fake chart lines */}
        <div className="absolute inset-0 flex items-end p-4 space-x-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 opacity-50"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 pb-2 border-b">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {/* Rows */}
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-4 py-2">
            {[...Array(6)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <MetricCardsSkeleton />
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
}
```

##### Step 3: Implement Progressive Loading
```tsx
// In calculator or historical pages:
import { 
  MetricCardsSkeleton, 
  ChartSkeleton, 
  TableSkeleton 
} from '@/components/loading/EnhancedSkeletons';

// Use conditional rendering with specific skeletons:
{isLoadingMetrics ? (
  <MetricCardsSkeleton />
) : (
  <MetricCards {...metricsProps} />
)}

{isLoadingChart ? (
  <ChartSkeleton />
) : (
  <VestingTimelineChart {...chartProps} />
)}

{isLoadingTable ? (
  <TableSkeleton />
) : (
  <HistoricalDataTable {...tableProps} />
)}
```

---

### 7. 🔄 **Alert for Error States** (MEDIUM VALUE)

##### Step 1: Install Dependencies
```bash
npx shadcn-ui@latest add alert
```

##### Step 2: Create Error Alert Component
Create `src/components/ErrorAlert.tsx`:

```tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

type AlertVariant = 'error' | 'warning' | 'info' | 'success';

interface ErrorAlertProps {
  variant?: AlertVariant;
  title: string;
  description: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig = {
  error: {
    icon: XCircleIcon,
    className: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    icon: CheckCircleIcon,
    className: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
};

export default function ErrorAlert({
  variant = 'error',
  title,
  description,
  onRetry,
  onDismiss,
  className = '',
}: ErrorAlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Alert className={`${config.className} ${className}`}>
      <Icon className={`h-5 w-5 ${config.iconClassName}`} />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}
        {(onRetry || onDismiss) && (
          <div className="flex gap-2 mt-4">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

##### Step 3: Implement Error Handling
```tsx
// In your pages/components:
import ErrorAlert from '@/components/ErrorAlert';

// API Error Example:
{apiError && (
  <ErrorAlert
    variant="error"
    title="Failed to Load Bitcoin Price"
    description={apiError.message || "Unable to fetch current Bitcoin price. Please check your connection and try again."}
    onRetry={fetchBitcoinPrice}
    onDismiss={() => setApiError(null)}
  />
)}

// Validation Warning Example:
{validationWarning && (
  <ErrorAlert
    variant="warning"
    title="Invalid Configuration"
    description="Annual grant cannot exceed initial grant amount."
    onDismiss={() => setValidationWarning(null)}
  />
)}

// Success Message Example:
{saveSuccess && (
  <ErrorAlert
    variant="success"
    title="Settings Saved"
    description="Your vesting schedule has been updated successfully."
    onDismiss={() => setSaveSuccess(false)}
  />
)}
```

---

## Additional Developer Notes

### State Management Considerations
When implementing these UI improvements, ensure proper state management:

```typescript
// Example store updates for UI state
interface UIState {
  isSheetOpen: boolean;
  activeTab: string;
  dialogStates: Record<string, boolean>;
  loadingStates: {
    metrics: boolean;
    chart: boolean;
    table: boolean;
  };
  errors: {
    api?: Error;
    validation?: string;
    calculation?: string;
  };
}

// Add UI slice to existing stores
const useUIStore = create<UIState>((set) => ({
  isSheetOpen: false,
  activeTab: 'accelerator',
  dialogStates: {},
  loadingStates: {
    metrics: false,
    chart: false,
    table: false,
  },
  errors: {},
  
  setSheetOpen: (open: boolean) => set({ isSheetOpen: open }),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setDialogState: (key: string, open: boolean) => 
    set((state) => ({
      dialogStates: { ...state.dialogStates, [key]: open }
    })),
  // ... more actions
}));
```

### Performance Optimization Tips

1. **Lazy Load Heavy Components**
```tsx
const HeavyChart = dynamic(
  () => import('@/components/charts/HeavyChart'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);
```

2. **Memoize Expensive Calculations**
```tsx
const expensiveData = useMemo(() => {
  return calculateComplexMetrics(rawData);
}, [rawData]);
```

3. **Debounce User Inputs**
```tsx
const debouncedUpdate = useMemo(
  () => debounce((value: number) => {
    updateSchemeCustomization(schemeId, { initialGrant: value });
  }, 500),
  [schemeId]
);
```

### Accessibility Checklist
- [ ] All interactive elements have proper ARIA labels
- [ ] Focus management in dialogs and sheets
- [ ] Keyboard navigation works (Tab, Escape, Enter)
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announcements for dynamic content
- [ ] Proper heading hierarchy maintained

### Browser Testing Matrix
| Component | Chrome | Firefox | Safari | Edge | Mobile Safari | Chrome Mobile |
|-----------|--------|---------|--------|------|---------------|---------------|
| Sheet | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tabs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dialog | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Table | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tooltip | ✓ | ✓ | ✓ | ✓ | Touch | Touch |

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/shadcn-ui-improvements

# Implement each component in separate commits
git add src/components/MobileNavSheet.tsx
git commit -m "feat: Add mobile navigation sheet component"

git add src/components/SchemeTabSelector.tsx
git commit -m "feat: Replace scheme cards with tabs"

# Run tests before pushing
npm run test
npm run build

# Push and create PR
git push origin feature/shadcn-ui-improvements
```

### Rollback Plan
If issues arise after deployment:
1. Keep original components in `src/components/legacy/` during transition
2. Use feature flags to toggle between old and new UI
3. Monitor error rates and user feedback
4. Have quick rollback script ready:
```bash
git revert --no-commit HEAD~5..HEAD
git commit -m "revert: Roll back shadcn UI changes"
git push origin main
```
