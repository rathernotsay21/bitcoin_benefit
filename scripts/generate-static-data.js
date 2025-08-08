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

// Static historical Bitcoin data for completed years (never changes)
const STATIC_HISTORICAL_DATA = {
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
};

// Cache configuration
const CACHE_CONFIG = {
  currentPrice: {
    maxAge: 5 * 60 * 1000, // 5 minutes for current price
    file: 'cache/bitcoin-price-cache.json'
  },
  currentYearData: {
    maxAge: 60 * 60 * 1000, // 1 hour for current year historical data
    file: 'cache/current-year-cache.json'
  }
};

// Utility functions
function ensureCacheDir() {
  const cacheDir = path.join(process.cwd(), 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log('📁 Created cache directory');
  }
  return cacheDir;
}

function loadCache(cacheKey) {
  try {
    const cachePath = path.join(process.cwd(), CACHE_CONFIG[cacheKey].file);
    if (!fs.existsSync(cachePath)) return null;

    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const now = Date.now();
    const maxAge = CACHE_CONFIG[cacheKey].maxAge;

    if (now - cache.timestamp < maxAge) {
      console.log(`📋 Using cached ${cacheKey} (${Math.round((now - cache.timestamp) / 1000)}s old)`);
      return cache.data;
    }

    console.log(`⏰ Cache expired for ${cacheKey} (${Math.round((now - cache.timestamp) / 1000)}s old)`);
    return null;
  } catch (error) {
    console.log(`⚠️  Cache read error for ${cacheKey}:`, error.message);
    return null;
  }
}

function saveCache(cacheKey, data) {
  try {
    ensureCacheDir();
    const cachePath = path.join(process.cwd(), CACHE_CONFIG[cacheKey].file);
    const cache = {
      data,
      timestamp: Date.now(),
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    console.log(`💾 Cached ${cacheKey} -> ${CACHE_CONFIG[cacheKey].file}`);
  } catch (error) {
    console.warn(`⚠️  Failed to save cache for ${cacheKey}:`, error.message);
  }
}

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 API request (attempt ${attempt}/${maxRetries}): ${url.split('?')[0]}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefit-Calculator/1.0',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API request successful`);
      return data;

    } catch (error) {
      console.warn(`❌ API request failed (attempt ${attempt}/${maxRetries}):`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function getCurrentBitcoinPrice() {
  // Check cache first
  const cached = loadCache('currentPrice');
  if (cached) return cached;

  try {
    const data = await fetchWithRetry(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
    );

    const result = {
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change,
      timestamp: Date.now(),
      source: 'live'
    };

    console.log(`💰 Current Bitcoin price: $${result.price.toLocaleString()} (${result.change24h > 0 ? '+' : ''}${result.change24h.toFixed(2)}%)`);

    // Cache the result
    saveCache('currentPrice', result);
    return result;

  } catch (error) {
    console.warn('⚠️  Failed to fetch current Bitcoin price, using fallback');
    return {
      price: 95000,
      change24h: 2.5,
      timestamp: Date.now(),
      source: 'fallback'
    };
  }
}

async function getCurrentYearBitcoinData() {
  const currentYear = new Date().getFullYear();

  // Check cache first
  const cached = loadCache('currentYearData');
  if (cached && cached.year === currentYear) return cached;

  try {
    console.log(`📊 Fetching live ${currentYear} Bitcoin data...`);

    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(); // Current date
    const fromTimestamp = Math.floor(startDate.getTime() / 1000);
    const toTimestamp = Math.floor(endDate.getTime() / 1000);

    const data = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`
    );

    if (data.prices && data.prices.length > 0) {
      const prices = data.prices.map(([, price]) => price);

      const result = {
        year: currentYear,
        high: Math.round(Math.max(...prices) * 100) / 100,
        low: Math.round(Math.min(...prices) * 100) / 100,
        average: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100,
        open: Math.round(data.prices[0][1] * 100) / 100,
        close: Math.round(data.prices[data.prices.length - 1][1] * 100) / 100,
        dataPoints: prices.length,
        source: 'live',
        lastUpdated: new Date().toISOString()
      };

      console.log(`✅ Live ${currentYear} data: $${result.average.toLocaleString()} avg (${result.dataPoints} data points)`);

      // Cache the result
      saveCache('currentYearData', result);
      return result;
    }

    throw new Error('No price data in response');

  } catch (error) {
    console.warn(`⚠️  Failed to fetch ${currentYear} data, using projection:`, error.message);

    // Create a reasonable projection based on 2024 data
    const projection = {
      year: currentYear,
      high: 120000,
      low: 95000,
      average: 105000,
      open: 95000,
      close: 110000, // This will be updated as year progresses
      source: 'projection'
    };

    return projection;
  }
}

async function getHistoricalBitcoinData() {
  console.log('📊 Loading Bitcoin historical data...');

  const currentYear = new Date().getFullYear();
  const historicalData = {};

  // Load static data for completed years (2015-2024)
  const completedYears = Object.keys(STATIC_HISTORICAL_DATA)
    .map(year => parseInt(year))
    .filter(year => year < currentYear);

  completedYears.forEach(year => {
    historicalData[year] = {
      ...STATIC_HISTORICAL_DATA[year],
      source: 'static'
    };
    console.log(`✅ Static data for ${year}: $${historicalData[year].average.toLocaleString()} avg`);
  });

  // Fetch live data for current year (2025 and beyond)
  if (currentYear >= 2025) {
    try {
      const currentYearData = await getCurrentYearBitcoinData();
      historicalData[currentYear] = currentYearData;
    } catch (error) {
      console.warn(`⚠️  Failed to get current year data, using projection`);
      historicalData[currentYear] = {
        year: currentYear,
        high: 120000,
        low: 95000,
        average: 105000,
        open: 95000,
        close: 110000,
        source: 'projection'
      };
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
  console.log(`📅 Current year: ${new Date().getFullYear()}`);

  // Ensure cache directory exists
  ensureCacheDir();

  // Create data directory
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory');
  }

  // Fetch current Bitcoin price (with intelligent caching)
  const bitcoinData = await getCurrentBitcoinPrice();

  // Get historical data (static + live current year)
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
      bitcoinPriceSource: bitcoinData.source,
      schemasCount: VESTING_SCHEMES.length,
      dataSourceSummary: {
        staticYears: Object.keys(historicalData).filter(year => historicalData[year].source === 'static').length,
        liveYears: Object.keys(historicalData).filter(year => historicalData[year].source === 'live').length,
        projectedYears: Object.keys(historicalData).filter(year => historicalData[year].source === 'projection').length,
      }
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

  // Summary
  const summary = {
    bitcoinPrice: bitcoinData.price,
    priceSource: bitcoinData.source,
    historicalYears: Object.keys(historicalData).length,
    schemes: Object.keys(staticCalculations).length,
    cacheStatus: {
      currentPrice: bitcoinData.source === 'live' ? 'fresh' : 'fallback',
      currentYear: historicalData[new Date().getFullYear()]?.source || 'none'
    }
  };

  console.log('✅ Static data generation complete!');
  console.log(`   Current BTC Price: $${summary.bitcoinPrice.toLocaleString()} (${summary.priceSource})`);
  console.log(`   Historical Years: ${summary.historicalYears}`);
  console.log(`   Pre-calculated Schemes: ${summary.schemes}`);
  console.log(`   Cache Status: Price=${summary.cacheStatus.currentPrice}, CurrentYear=${summary.cacheStatus.currentYear}`);
}

// Run if called directly
if (require.main === module) {
  generateStaticData().catch(error => {
    console.error('❌ Static data generation failed:', error);
    process.exit(1);
  });
}

module.exports = { generateStaticData };