# shadcn/ui Component Integration Plan

## Implementation Checklist (Ordered by Value)

### 1. ✅ **Mobile Navigation Sheet** (HIGHEST VALUE)
**Impact:** Improves UX for ~50% of users on mobile devices
**Location:** `src/components/Navigation.tsx`

#### Implementation Steps:
- [ ] Install Sheet component: `npx shadcn-ui@latest add sheet`
- [ ] Create new component `src/components/MobileNavSheet.tsx`
- [ ] Import Sheet, SheetContent, SheetTrigger, SheetHeader from shadcn
- [ ] Replace mobile navigation grid with hamburger menu trigger
- [ ] Move nav items into Sheet with vertical stack layout
- [ ] Add theme toggle inside Sheet header
- [ ] Preserve active route highlighting logic
- [ ] Auto-close Sheet on route change using `usePathname` hook
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
- [ ] Install Tabs component: `npx shadcn-ui@latest add tabs`
- [ ] Create `src/components/SchemeTabSelector.tsx`
- [ ] Replace radio card pattern with Tabs component
- [ ] Map schemes to TabsList > TabsTrigger components
- [ ] Use TabsContent for scheme descriptions
- [ ] Implement URL sync: Update searchParams when tab changes
- [ ] Add keyboard navigation support (arrow keys)
- [ ] Style active tab with Bitcoin orange accent
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
- [ ] Install Dialog component: `npx shadcn-ui@latest add dialog`
- [ ] Install Form components: `npx shadcn-ui@latest add form`
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
- [ ] Install Table component: `npx shadcn-ui@latest add table`
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
- [ ] Install Tooltip component: `npx shadcn-ui@latest add tooltip`
- [ ] Create `src/components/HelpTooltip.tsx` wrapper component
- [ ] Add TooltipProvider to layout wrapper
- [ ] Identify all technical terms needing explanation:
  - CAGR, ROI, Vesting, Cost Basis Method
  - Initial Grant, Annual Grant, Growth Multiple
- [ ] Add info icon (QuestionMarkCircleIcon) next to terms
- [ ] Write concise explanations (< 100 words)
- [ ] Style with consistent dark/light mode support
- [ ] Add keyboard accessibility (focus + Enter to show)

**Key Considerations:**
- Don't overuse - only for truly unclear terms
- Keep explanations concise and jargon-free
- Test touch targets on mobile (min 44x44px)

---

### 6. 🔄 **Skeleton Loading States** (MEDIUM VALUE)
**Impact:** Better perceived performance during data fetching
**Locations:** Calculator results, Historical timeline, Metric cards

#### Implementation Steps:
- [ ] Install Skeleton component: `npx shadcn-ui@latest add skeleton`
- [ ] Create loading skeletons for:
  - MetricCards (3-card layout skeleton)
  - Chart areas (rectangular skeleton with shimmer)
  - Table rows (5-row skeleton structure)
- [ ] Replace existing spinner-only loading states
- [ ] Match skeleton dimensions to actual content
- [ ] Add subtle pulse animation
- [ ] Implement progressive loading (cards → chart → table)

**Key Considerations:**
- Keep existing loading logic in stores
- Ensure skeletons match dark/light themes
- Don't over-animate (subtle is better)

---

### 7. 🔄 **Alert for Error States** (MEDIUM VALUE)
**Impact:** Cleaner, more consistent error messaging
**Locations:** API errors, calculation errors, validation errors

#### Implementation Steps:
- [ ] Install Alert component: `npx shadcn-ui@latest add alert`
- [ ] Create `src/components/ErrorAlert.tsx` wrapper
- [ ] Replace custom error cards with Alert component
- [ ] Add variants: destructive (errors), warning (validation), info
- [ ] Include retry button in error alerts
- [ ] Add dismiss capability for non-critical warnings
- [ ] Implement toast notifications for transient errors

**Key Considerations:**
- Preserve existing error messages
- Keep retry functionality
- Don't block UI unnecessarily

---

### 8. 🔄 **Form Components Enhancement** (MEDIUM VALUE)
**Impact:** More consistent form styling and validation
**Locations:** All input fields in calculators

#### Implementation Steps:
- [ ] Install form components: `npx shadcn-ui@latest add input select label`
- [ ] Create form component wrappers maintaining Bitcoin theme
- [ ] Replace native inputs while preserving:
  - Existing validation logic
  - Store bindings
  - Disabled states during loading
- [ ] Add proper label associations for accessibility
- [ ] Implement consistent error state styling
- [ ] Add input masks for BTC amounts (0.000 format)

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
