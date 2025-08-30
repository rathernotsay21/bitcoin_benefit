# Testing Decimal Input and Y-Axis Fixes

## Test Cases

### 1. Decimal Input Tests
Navigate to http://localhost:3002/calculator/accelerator

#### Bitcoin Award Amount Field:
- [ ] Type "0.001" - should allow typing without clearing
- [ ] Type "0.01" - should allow typing without clearing
- [ ] Type "0.1" - should allow typing without clearing
- [ ] Type "1.0" - should allow typing the ".0" without it disappearing
- [ ] Type "2.00" - should allow typing ".00" without clearing
- [ ] Type ".001" - should allow typing without issues
- [ ] Type ".01" - should allow typing without issues
- [ ] Type ".1" - should allow typing without issues

### 2. Y-Axis Display Tests

#### With 0.001 BTC:
- [ ] Y-axis should NOT show $0 in the middle
- [ ] Y-axis minimum should be around 90% of the starting value
- [ ] Chart line should show growth trajectory (not flat)

#### With 0.01 BTC:
- [ ] Y-axis should start around $400 (90% of ~$450)
- [ ] No $0 in middle of axis
- [ ] Proper tick spacing

#### With 0.1 BTC:
- [ ] Y-axis should start around $4000 (90% of ~$4500)
- [ ] Growth trajectory visible
- [ ] Clean tick labels

#### With 1.0 BTC:
- [ ] Y-axis should start around $40,000 (90% of ~$45,000)
- [ ] Standard display working correctly

### 3. Edge Cases
- [ ] Type "0.0000001" - very small value should work
- [ ] Use arrow keys to adjust values - should work
- [ ] Copy/paste "0.005" - should work

## Results
Document any issues found during testing below: