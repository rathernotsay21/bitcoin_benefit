# Custom Vesting Schedule Feature

## Overview
The Bitcoin Vesting Calculator now supports fully customizable vesting schedules, allowing users to define their own vesting periods and percentages for each scheme (Pioneer, Stacker, and Builder).

## Features

### 1. Flexible Vesting Events
- **Add Multiple Vesting Points**: Create as many vesting events as needed
- **Time Period Options**: Choose from predefined periods:
  - 90 days (0.25 years)
  - 6 months
  - 1-10 years (annual increments)
- **Cumulative Percentages**: Set cumulative vesting percentages at each point (up to 100%)

### 2. Pre-configured Templates
Quick-start examples for common vesting schedules:
- **90-Day Cliff + Annual**: 10% at 90 days, then 30%/50%/75%/100% yearly
- **Equal Annual**: 25% each year for 4 years
- **Traditional**: 50% at 5 years, 100% at 10 years (default)

### 3. Dynamic Calculations
- **Real-time Updates**: Charts and tables update instantly as you modify vesting events
- **Accurate Projections**: All financial projections reflect custom vesting schedules
- **Visual Indicators**: Clear status showing cumulative vested percentages

## How to Use

### Adding Custom Vesting Events

1. **Enable Custom Schedule**
   - Navigate to "Customize Your Scheme" section
   - Click "Customize" button in the Custom Vesting Schedule area

2. **Add Vesting Events**
   - Select time period from dropdown
   - Enter cumulative percentage vested
   - Click the "+" button to add the event

3. **Manage Events**
   - Edit existing events by changing values directly
   - Remove events using the trash icon
   - Events automatically sort by time period

### Important Rules

1. **Cumulative Percentages**: Each percentage represents the total vested at that point, not additional vesting
   - Example: 25% at Year 1, 50% at Year 2 means 25% vests in Year 1, and another 25% in Year 2

2. **Maximum 100%**: Total vesting cannot exceed 100%

3. **Progressive Vesting**: Each event must have a higher percentage than previous events

## Use Cases

### 90-Day Recruitment Incentive
```
10% at 90 days
30% at 1 year
50% at 2 years
75% at 3 years
100% at 4 years
```
- Provides early vesting to attract talent
- Maintains long-term retention incentives

### Annual Equal Vesting
```
25% at 1 year
50% at 2 years
75% at 3 years
100% at 4 years
```
- Simple, predictable vesting
- Common in traditional equity plans

### Combined Schedule
```
10% at 90 days
35% at 1 year
60% at 2 years
85% at 3 years
100% at 4 years
```
- Balances early incentive with retention
- Flexible approach for different roles

## Technical Implementation

### Data Structure
Custom vesting events are stored as:
```typescript
interface CustomVestingEvent {
  id: string;
  timePeriod: number; // in months (0.25 for 90 days)
  percentageVested: number; // cumulative percentage
  label: string; // display label
}
```

### State Management
- Events stored per scheme in Zustand store
- Automatic recalculation on changes
- Debounced updates for performance

### UI Components
- `CustomVestingSchedule.tsx`: Main UI component
- Real-time validation
- Template presets for quick setup

## Impact on Calculations

### Timeline Chart
- Shows vesting milestones based on custom events
- Updates 10-year projections accordingly

### Annual Breakdown Table
- STATUS column reflects custom vesting percentages
- Accurate year-by-year vested amounts

### Financial Metrics
- Total Value calculations respect custom vesting
- ROI and growth multiples update dynamically

## Migration from Default

Existing schemes continue using default vesting (50% at 5 years, 100% at 10 years) unless explicitly customized. No breaking changes to existing functionality.

## Future Enhancements

Potential future improvements:
- Export/import vesting schedules
- More granular time periods (monthly)
- Vesting acceleration triggers
- Performance-based vesting conditions
