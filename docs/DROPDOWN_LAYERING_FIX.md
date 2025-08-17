# Dropdown Layering Fix

## Issue
The dropdown menu for matching grant years in the vesting tracker was not displaying properly due to layering issues. The dropdown was being clipped by parent containers with overflow settings.

## Root Cause
1. The table container had `overflow-x-auto` which was clipping the dropdown
2. The main page container had `overflow-hidden` which prevented the dropdown from showing
3. The dropdown was using relative positioning within a constrained table cell

## Solution
1. **Fixed Positioning**: Changed the dropdown from relative to fixed positioning to escape the table's overflow context
2. **Dynamic Coordinates**: Calculate dropdown position based on the trigger button's viewport coordinates
3. **Overflow Adjustments**: Updated parent containers to use `overflow-y: visible` to allow dropdowns to show
4. **Smart Positioning**: Added logic to position dropdown on left or right based on available viewport space
5. **Event Handling**: Added window resize and scroll handlers to maintain proper positioning

## Changes Made

### ManualAnnotationOverride.tsx
- Changed dropdown positioning from `absolute` to `fixed`
- Added dynamic coordinate calculation based on trigger button position
- Added window event listeners for resize and scroll
- Improved edge case handling for off-screen positioning
- Added smooth animation for dropdown appearance

### VestingTrackerResultsOptimized.tsx
- Updated table container overflow from `overflow-y-visible` to inline style
- Added `overflow: visible` to card container

### track/page.tsx
- Updated main container overflow settings to allow vertical overflow

## Technical Details
- Uses `getBoundingClientRect()` to get precise trigger button position
- Calculates viewport space to determine optimal dropdown placement
- Uses `z-index: 9999` to ensure dropdown appears above all other elements
- Handles window scroll by closing dropdown to prevent positioning issues
- Handles window resize by recalculating position

## Testing
The fix ensures that:
1. Dropdown appears correctly when hovering over the button
2. Dropdown is positioned properly regardless of table scroll position
3. Dropdown doesn't get clipped by parent containers
4. Dropdown closes appropriately on scroll/resize events
5. Dropdown positioning adapts to available viewport space