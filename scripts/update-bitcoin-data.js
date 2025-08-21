const fs = require('fs');
const path = require('path');

/**
 * Advanced Bitcoin data update utility
 * - Updates static historical data for completed years
 * - Clears caches to force fresh data fetching
 * - Validates data integrity
 * Usage: node scripts/update-bitcoin-data.js [--year=YYYY] [--clear-cache]
 */

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 API request (attempt ${attempt}/${maxRetries}): ${url.split('?')[0]}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefit-Calculator-Updater/1.0',
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

async function fetchYearData(year) {
  console.log(`📊 Fetching data for ${year}...`);
  
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const fromTimestamp = Math.floor(startDate.getTime() / 1000);
  const toTimestamp = Math.floor(endDate.getTime() / 1000);

  const data = await fetchWithRetry(
    `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`
  );

  if (!data.prices || data.prices.length === 0) {
    throw new Error('No price data in response');
  }

  const prices = data.prices.map(([, price]) => price);
  
  const result = {
    high: Math.round(Math.max(...prices) * 100) / 100,
    low: Math.round(Math.min(...prices) * 100) / 100,
    average: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100,
    open: Math.round(data.prices[0][1] * 100) / 100,
    close: Math.round(data.prices[data.prices.length - 1][1] * 100) / 100,
    dataPoints: prices.length,
    lastUpdated: new Date().toISOString()
  };
  
  console.log(`✅ ${year}: $${result.average.toLocaleString()} avg (${result.dataPoints} data points)`);
  return result;
}

async function updateHistoricalData(options = {}) {
  const currentYear = new Date().getFullYear();
  const { specificYear, clearCache = false } = options;
  
  try {
    console.log('🔄 Bitcoin Historical Data Update Utility');
    console.log('==========================================');
    
    if (clearCache) {
      console.log('🧹 Clearing caches...');
      const cacheDir = path.join(process.cwd(), 'cache');
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log('✅ Cache cleared');
      }
    }
    
    let yearsToUpdate = [];
    
    if (specificYear) {
      const year = parseInt(specificYear);
      if (year >= currentYear) {
        console.error(`❌ Cannot update ${year} - use current year data fetching instead`);
        return;
      }
      yearsToUpdate = [year];
      console.log(`🎯 Updating specific year: ${year}`);
    } else {
      // Update all completed years (but not current year)
      yearsToUpdate = Array.from({ length: 10 }, (_, i) => currentYear - 10 + i)
        .filter(year => year < currentYear && year >= 2015);
      console.log(`📅 Updating completed years: ${yearsToUpdate.join(', ')}`);
    }
    
    const freshData = {};
    const errors = [];
    
    for (const year of yearsToUpdate) {
      try {
        freshData[year] = await fetchYearData(year);
        
        // Rate limiting - wait 1 second between requests
        if (yearsToUpdate.indexOf(year) < yearsToUpdate.length - 1) {
          console.log('⏳ Rate limiting delay...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to fetch ${year}:`, error.message);
        errors.push({ year, error: error.message });
      }
    }
    
    if (Object.keys(freshData).length === 0) {
      console.error('❌ No data was successfully fetched. Aborting update.');
      return;
    }
    
    // Read current script content
    const scriptPath = path.join(process.cwd(), 'scripts/generate-static-data.js');
    let scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Extract current static data
    const staticDataRegex = /const STATIC_HISTORICAL_DATA = \{([\s\S]*?)\};/;
    const match = scriptContent.match(staticDataRegex);
    
    if (!match) {
      throw new Error('Could not find STATIC_HISTORICAL_DATA in script');
    }
    
    // Parse existing data (safely without eval)
    let existingData = {};
    try {
      // Extract the object content and convert to JSON
      const objectContent = match[1];
      
      // Convert JavaScript object literal to valid JSON
      // Replace unquoted keys with quoted keys and handle trailing commas
      const jsonString = `{${objectContent}}`
        .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote keys
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Safely parse the JSON string
      existingData = JSON.parse(jsonString);
    } catch (error) {
      console.warn('⚠️  Could not parse existing data, starting fresh');
      console.warn('Parse error:', error.message);
    }
    
    // Merge fresh data with existing data
    const mergedData = { ...existingData, ...freshData };
    
    // Sort by year for clean output
    const sortedData = {};
    Object.keys(mergedData)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(year => {
        sortedData[year] = mergedData[year];
      });
    
    // Create the new data object string with proper formatting
    const newDataString = `const STATIC_HISTORICAL_DATA = ${JSON.stringify(sortedData, null, 2).replace(/\"([^\"]+)\":/g, '$1:')};`;
    
    // Replace in script
    scriptContent = scriptContent.replace(staticDataRegex, newDataString);
    
    // Write back to file
    fs.writeFileSync(scriptPath, scriptContent);
    
    // Summary
    console.log('\\n✅ Historical data update complete!');
    console.log(`   Updated years: ${Object.keys(freshData).join(', ')}`);
    console.log(`   Total years in dataset: ${Object.keys(sortedData).length}`);
    
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`);
      errors.forEach(({ year, error }) => {
        console.log(`     ${year}: ${error}`);
      });
    }
    
    console.log('\\n📋 Next steps:');
    console.log('   1. Review the updated data in scripts/generate-static-data.js');
    console.log('   2. Run "npm run build" to regenerate static files');
    console.log('   3. Test the application to ensure data integrity');
    
    // Validate data integrity
    console.log('\\n🔍 Data validation:');
    Object.keys(freshData).forEach(year => {
      const data = freshData[year];
      const issues = [];
      
      if (data.high < data.low) issues.push('high < low');
      if (data.average < data.low || data.average > data.high) issues.push('average out of range');
      if (data.open < 0 || data.close < 0) issues.push('negative prices');
      
      if (issues.length > 0) {
        console.log(`   ⚠️  ${year}: ${issues.join(', ')}`);
      } else {
        console.log(`   ✅ ${year}: Data looks good`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to update historical data:', error);
    process.exit(1);
  }
}

function clearAllCaches() {
  console.log('🧹 Clearing all Bitcoin data caches...');
  
  const cacheDir = path.join(process.cwd(), 'cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ All caches cleared');
  } else {
    console.log('ℹ️  No cache directory found');
  }
  
  console.log('📋 Next build will fetch fresh data from APIs');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--year=')) {
      options.specificYear = arg.split('=')[1];
    } else if (arg === '--clear-cache') {
      options.clearCache = true;
    } else if (arg === '--clear-cache-only') {
      options.clearCacheOnly = true;
    }
  });
  
  return options;
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();
  
  if (options.clearCacheOnly) {
    clearAllCaches();
  } else {
    updateHistoricalData(options);
  }
}

module.exports = { updateHistoricalData, clearAllCaches };