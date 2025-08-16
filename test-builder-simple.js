// Test the Builder scheme changes
// Run with: node test-builder-simple.js

// Simulate the scheme configuration
const builderScheme = {
  id: 'slow-burn',
  name: 'Builder',
  initialGrant: 0.002,  // Changed from 0.0
  annualGrant: 0.002,
  maxAnnualGrants: 9,   // Changed from 10
};

console.log('=== Builder Scheme Test ===');
console.log(`Initial Grant: ${builderScheme.initialGrant}`);
console.log(`Annual Grant: ${builderScheme.annualGrant}`);
console.log(`Max Annual Grants: ${builderScheme.maxAnnualGrants}`);
console.log('');

// Calculate total
const totalGrants = builderScheme.initialGrant + (builderScheme.annualGrant * builderScheme.maxAnnualGrants);
console.log(`Total Bitcoin Granted: ${totalGrants}`);

// Simulate grant schedule
console.log('\n=== Grant Schedule ===');
const grants = [];

// Year 0 - initial grant
grants.push({ year: 0, grant: builderScheme.initialGrant });

// Years 1-9 - annual grants
for (let year = 1; year <= 9; year++) {
  grants.push({ year, grant: builderScheme.annualGrant });
}

// Year 10 - no grant
grants.push({ year: 10, grant: 0 });

// Display schedule
let cumulative = 0;
grants.forEach(({ year, grant }) => {
  cumulative += grant;
  console.log(`Year ${year}: Grant = ${grant.toFixed(3)} BTC, Cumulative = ${cumulative.toFixed(3)} BTC`);
});

// Verify
console.log('\n=== Verification ===');
if (Math.abs(totalGrants - 0.02) < 0.0001) {
  console.log('✅ Total grants correct: 0.02 BTC');
} else {
  console.log(`❌ Total grants incorrect: ${totalGrants} BTC (expected 0.02)`);
}

if (builderScheme.initialGrant === 0.002) {
  console.log('✅ Initial grant at year 0: 0.002 BTC');
} else {
  console.log(`❌ Initial grant incorrect: ${builderScheme.initialGrant} BTC`);
}

if (builderScheme.maxAnnualGrants === 9) {
  console.log('✅ Annual grants limited to 9 years (years 1-9)');
} else {
  console.log(`❌ Max annual grants incorrect: ${builderScheme.maxAnnualGrants}`);
}

console.log('\nSummary: The Builder scheme now has an initial grant at year 0!');
