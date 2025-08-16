// Test script to verify the Builder scheme changes
import { VESTING_SCHEMES } from './src/lib/vesting-schemes.js';
import { VestingScheduleCalculator } from './src/lib/calculators/VestingScheduleCalculator.js';

// Find the Builder (slow-burn) scheme
const builderScheme = VESTING_SCHEMES.find(scheme => scheme.id === 'slow-burn');

if (!builderScheme) {
  console.error('Builder scheme not found!');
  process.exit(1);
}

console.log('=== Builder Scheme Configuration ===');
console.log(`Initial Grant: ${builderScheme.initialGrant}`);
console.log(`Annual Grant: ${builderScheme.annualGrant}`);
console.log(`Max Annual Grants: ${builderScheme.maxAnnualGrants}`);
console.log('');

// Calculate total grants
const totalGrants = builderScheme.initialGrant + (builderScheme.annualGrant * builderScheme.maxAnnualGrants);
console.log(`Total Bitcoin Granted: ${totalGrants}`);
console.log('');

// Generate timeline to verify grant schedule
const calculator = new VestingScheduleCalculator({
  milestones: builderScheme.vestingSchedule
});

const timeline = calculator.generateTimeline(
  builderScheme.initialGrant,
  builderScheme.annualGrant,
  120, // 10 years
  'slow-burn'
);

// Extract grant schedule from timeline
const grantSchedule = [];
let previousTotal = 0;

for (let year = 0; year <= 10; year++) {
  const monthIndex = year * 12;
  const point = timeline.find(p => p.month === monthIndex);
  
  if (point) {
    const grantAmount = point.totalGrants - previousTotal;
    grantSchedule.push({
      year,
      month: monthIndex,
      grantAmount: grantAmount.toFixed(4),
      totalGrants: point.totalGrants.toFixed(4)
    });
    previousTotal = point.totalGrants;
  }
}

console.log('=== Grant Schedule (Year by Year) ===');
console.log('Year | Month | Grant Amount | Total Grants');
console.log('-----|-------|--------------|-------------');
grantSchedule.forEach(({ year, month, grantAmount, totalGrants }) => {
  console.log(`  ${year.toString().padEnd(2)} |  ${month.toString().padEnd(3)}  |    ${grantAmount}    |    ${totalGrants}`);
});

console.log('');
console.log('=== Verification ===');

// Expected pattern after our changes:
// Year 0: 0.002 (initial grant)
// Years 1-9: 0.002 each (annual grants)
// Year 10: 0 (no grant)
// Total: 10 grants of 0.002 = 0.02

const expectedPattern = [0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002, 0];

let allCorrect = true;
for (let i = 0; i < grantSchedule.length; i++) {
  const actual = parseFloat(grantSchedule[i].grantAmount);
  const expected = expectedPattern[i];
  const isCorrect = Math.abs(actual - expected) < 0.0001; // Allow for small floating point differences
  
  if (!isCorrect) {
    console.log(`❌ Year ${i}: Expected ${expected}, got ${actual}`);
    allCorrect = false;
  }
}

if (allCorrect) {
  console.log('✅ Grant schedule is correct!');
  console.log('✅ Initial grant at year 0: 0.002');
  console.log('✅ Annual grants for years 1-9: 0.002 each');
  console.log('✅ No grant at year 10');
  console.log('✅ Total grants: 0.02 BTC');
} else {
  console.log('❌ Grant schedule is incorrect!');
  process.exit(1);
}
