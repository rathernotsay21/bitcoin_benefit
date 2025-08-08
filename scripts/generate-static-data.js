const fs = require('fs');
const path = require('path');

// Mock the imports since this is a build script
const VESTING_SCHEMES = [
  {
    id: 'accelerator',
    name: 'Accelerator',
    description: 'Front-loaded Bitcoin allocation for immediate impact',
    initialGrant: 0.02,
    annualGrant: 0,
    vestingSchedule: [
      { months: 0, grantPercent: 0 },
      { months: 60, grantPercent: 50 },
      { months: 120, grantPercent: 100 }
    ]
  },
  {
    id: 'steady-builder',
    name: 'Steady Builder',
    description: 'Balanced approach with initial grant plus annual additions',
    initialGrant: 0.015,
    annualGrant: 0.001,
    vestingSchedule: [
      { months: 0, grantPercent: 0 },
      { months: 60, grantPercent: 50 },
      { months: 120, grantPercent: 100 }
    ]
  },
  {
    id: 'slow-burn',
    name: 'Slow Burn',
    description: 'Long-term retention focus with yearly grants only',
    initialGrant: 0,
    annualGrant: 0.002,
    vestingSchedule: [
      { months: 0, grantPercent: 0 },
      { months: 60, grantPercent: 50 },
      { months: 120, grantPercent: 100 }
    ]
  }
];

async function getBuildTimeBitcoinPrice() {
  try {
    console.log('Fetching Bitcoin price data...');
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched Bitcoin price: $${data.bitcoin.usd.toLocaleString()}`);
    
    return {
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.warn('⚠️  Failed to fetch Bitcoin price, using fallback:', error.message);
    return { 
      price: 45000, 
      change24h: 0, 
      timestamp: Date.now() 
    };
  }
}

async function getHistoricalBitcoinData() {
  const currentYear = new Date().getFullYear();
  const historicalData = {};
  
  // Get data for last 10 years
  for (let year = currentYear - 9; year <= currentYear; year++) {
    try {
      console.log(`Fetching historical data for ${year}...`);
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      const fromTimestamp = Math.floor(startDate.getTime() / 1000);
      const toTimestamp = Math.floor(endDate.getTime() / 1000);

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`
      );

      if (response.ok) {
        const data = await response.json();
        const prices = data.prices.map(([, price]) => price);
        
        if (prices.length > 0) {
          historicalData[year] = {
            year,
            high: Math.round(Math.max(...prices) * 100) / 100,
            low: Math.round(Math.min(...prices) * 100) / 100,
            average: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100,
            open: Math.round(data.prices[0][1] * 100) / 100,
            close: Math.round(data.prices[data.prices.length - 1][1] * 100) / 100,
          };
          console.log(`✅ Historical data for ${year}: $${historicalData[year].average.toLocaleString()} avg`);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.warn(`⚠️  Failed to fetch data for ${year}, using fallback`);
      // Fallback data
      const fallbackPrices = {
        2015: { high: 504, low: 152, average: 264, open: 314, close: 430 },
        2016: { high: 975, low: 365, average: 574, open: 430, close: 963 },
        2017: { high: 19783, low: 775, average: 4951, open: 963, close: 13880 },
        2018: { high: 17527, low: 3191, average: 7532, open: 13880, close: 3742 },
        2019: { high: 13016, low: 3391, average: 7179, open: 3742, close: 7179 },
        2020: { high: 28994, low: 4106, average: 11111, open: 7179, close: 28994 },
        2021: { high: 68789, low: 28994, average: 47686, open: 28994, close: 46306 },
        2022: { high: 48086, low: 15460, average: 31717, open: 46306, close: 16547 },
        2023: { high: 44700, low: 15460, average: 29234, open: 16547, close: 42258 },
        2024: { high: 108000, low: 38000, average: 65000, open: 42258, close: 95000 },
        2025: { high: 120000, low: 95000, average: 105000, open: 95000, close: 110000 },
      };
      
      if (fallbackPrices[year]) {
        historicalData[year] = { year, ...fallbackPrices[year] };
      }
    }
  }
  
  return historicalData;
}

// Simple calculation function for static generation
function calculateVestingResults(scheme, bitcoinPrice, projectedGrowth = 15) {
  const timeline = [];
  const maxMonths = 240; // 20 years
  
  for (let month = 0; month <= maxMonths; month++) {
    const year = month / 12;
    
    // Calculate total Bitcoin at this point
    let totalBitcoin = scheme.initialGrant || 0;
    if (scheme.annualGrant && year > 0) {
      const yearsOfGrants = Math.min(year, scheme.id === 'slow-burn' ? 10 : 5);
      totalBitcoin += (scheme.annualGrant * yearsOfGrants);
    }
    
    // Calculate vesting percentage
    let vestedPercent = 0;
    if (month >= 120) vestedPercent = 100; // 10 years = 100%
    else if (month >= 60) vestedPercent = 50; // 5 years = 50%
    
    // Projected Bitcoin price
    const projectedPrice = bitcoinPrice * Math.pow(1 + (projectedGrowth / 100), year);
    
    timeline.push({
      month,
      year: Math.floor(year),
      employerBalance: totalBitcoin,
      vestedBalance: totalBitcoin * (vestedPercent / 100),
      bitcoinPrice: projectedPrice,
      currentValue: totalBitcoin * projectedPrice,
      vestedValue: totalBitcoin * (vestedPercent / 100) * projectedPrice,
    });
  }
  
  return {
    totalBitcoinNeeded: timeline[timeline.length - 1].employerBalance,
    totalCost: timeline[timeline.length - 1].employerBalance * bitcoinPrice,
    timeline,
  };
}

async function generateStaticData() {
  console.log('🚀 Generating static data for build...');
  
  // Create data directory
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory');
  }
  
  // Fetch current Bitcoin price
  const bitcoinData = await getBuildTimeBitcoinPrice();
  
  // Fetch historical data
  console.log('📊 Fetching historical Bitcoin data...');
  const historicalData = await getHistoricalBitcoinData();
  
  // Generate pre-calculated results for all schemes
  console.log('🧮 Pre-calculating vesting results...');
  const staticCalculations = {};
  
  VESTING_SCHEMES.forEach(scheme => {
    console.log(`  Calculating ${scheme.name}...`);
    staticCalculations[scheme.id] = calculateVestingResults(
      scheme,
      bitcoinData.price,
      15 // Default 15% growth
    );
  });
  
  // Create public data directory for static serving
  const publicDataDir = path.join(process.cwd(), 'public/data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  
  // Save Bitcoin price data (both src and public)
  const bitcoinDataPath = path.join(dataDir, 'bitcoin-price.json');
  const publicBitcoinDataPath = path.join(publicDataDir, 'bitcoin-price.json');
  const bitcoinJson = JSON.stringify(bitcoinData, null, 2);
  fs.writeFileSync(bitcoinDataPath, bitcoinJson);
  fs.writeFileSync(publicBitcoinDataPath, bitcoinJson);
  console.log('💾 Saved current Bitcoin price data');
  
  // Save historical data (both src and public)
  const historicalDataPath = path.join(dataDir, 'historical-bitcoin.json');
  const publicHistoricalDataPath = path.join(publicDataDir, 'historical-bitcoin.json');
  const historicalJson = JSON.stringify(historicalData, null, 2);
  fs.writeFileSync(historicalDataPath, historicalJson);
  fs.writeFileSync(publicHistoricalDataPath, historicalJson);
  console.log('💾 Saved historical Bitcoin data');
  
  // Save pre-calculated results (both src and public)
  const calculationsPath = path.join(dataDir, 'static-calculations.json');
  const publicCalculationsPath = path.join(publicDataDir, 'static-calculations.json');
  const calculationsJson = JSON.stringify({
    calculations: staticCalculations,
    metadata: {
      generatedAt: new Date().toISOString(),
      bitcoinPrice: bitcoinData.price,
      schemasCount: VESTING_SCHEMES.length,
    }
  }, null, 2);
  fs.writeFileSync(calculationsPath, calculationsJson);
  fs.writeFileSync(publicCalculationsPath, calculationsJson);
  console.log('💾 Saved pre-calculated results');
  
  // Generate scheme metadata for static generation (both src and public)
  const schemesMetaPath = path.join(dataDir, 'schemes-meta.json');
  const publicSchemesMetaPath = path.join(publicDataDir, 'schemes-meta.json');
  const schemesJson = JSON.stringify({
    schemes: VESTING_SCHEMES.map(scheme => ({
      id: scheme.id,
      name: scheme.name,
      description: scheme.description,
    })),
    generatedAt: new Date().toISOString(),
  }, null, 2);
  fs.writeFileSync(schemesMetaPath, schemesJson);
  fs.writeFileSync(publicSchemesMetaPath, schemesJson);
  console.log('💾 Saved schemes metadata');
  
  console.log('✅ Static data generation complete!');
  console.log(`   Current BTC Price: $${bitcoinData.price.toLocaleString()}`);
  console.log(`   Historical Years: ${Object.keys(historicalData).length}`);
  console.log(`   Pre-calculated Schemes: ${Object.keys(staticCalculations).length}`);
}

// Run if called directly
if (require.main === module) {
  generateStaticData().catch(error => {
    console.error('❌ Static data generation failed:', error);
    process.exit(1);
  });
}

module.exports = { generateStaticData };
