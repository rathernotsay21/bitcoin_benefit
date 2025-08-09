# Bitcoin Data Management

This document explains the intelligent Bitcoin price data management system.

## Overview

The project uses a sophisticated caching strategy that optimizes for both accuracy and performance:

- **Completed Years (2015-2024)**: Static data (never changes)
- **Current Year (2025)**: Live API data with intelligent caching
- **Current Price**: Live API data with 5-minute cache
- **Build Performance**: Fast builds with minimal API calls

## Intelligent Caching System

### Data Sources by Type:

1. **Static Historical Data** (2015-2024)
   - Stored directly in code
   - Never changes (years are complete)
   - Zero API calls during build
   - Instant loading

2. **Current Year Data** (2025)
   - Fetched live from CoinGecko API
   - Cached for 1 hour
   - Updates automatically as year progresses
   - Falls back to projection if API fails

3. **Current Bitcoin Price**
   - Fetched live from CoinGecko API
   - Cached for 5 minutes
   - Used for real-time calculations
   - Falls back to reasonable estimate

### Cache Management:

- **Cache Location**: `cache/` directory
- **Cache Files**:
  - `bitcoin-price-cache.json` (5-minute TTL)
  - `current-year-cache.json` (1-hour TTL)
- **Auto-expiration**: Caches expire automatically
- **Retry Logic**: 3 attempts with exponential backoff

## Build Process

### What happens during `npm run build`:

1. **Current Bitcoin Price**:
   - ✅ Cache hit (< 5 min): Uses cached price
   - 🌐 Cache miss: Fetches live price with retry logic
   - ⚠️ API failure: Uses fallback ($95,000)

2. **Historical Data**:
   - ✅ Static years (2015-2024): Instant load from code
   - 🌐 Current year (2025): Fetches live data (cached 1hr)
   - ⚠️ Current year API failure: Uses projection

3. **Pre-calculations**: Generates vesting calculations for all schemes

### Build Output Examples:

**Fast build (cached data):**
```
📋 Using cached currentPrice (127s old)
📋 Using cached currentYearData (1847s old)
✅ Static data for 2024: $65,000 avg
✅ Live 2025 data: $105,234 avg (365 data points)
```

**Fresh data build:**
```
🌐 API request (attempt 1/3): https://api.coingecko.com/api/v3/simple/price
✅ Current Bitcoin price: $116,567 (+2.34%)
🌐 API request (attempt 1/3): https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range
✅ Live 2025 data: $108,234 avg (45 data points)
```

## Data Update Commands

### Update Static Historical Data:
```bash
# Update all completed years (2015-2024)
npm run update-bitcoin-data

# Update specific year
npm run update-bitcoin-year=2024

# Clear all caches (force fresh API calls)
npm run clear-bitcoin-cache
```

### Update Process:
- Fetches fresh data from CoinGecko API
- Updates static data in `generate-static-data.js`
- Validates data integrity
- Respects API rate limits (1 second between requests)
- Handles failures gracefully

## Data Files

### Generated Files (auto-created during build):
- `public/data/bitcoin-price.json` - Current Bitcoin price
- `public/data/historical-bitcoin.json` - Historical price data
- `public/data/static-calculations.json` - Pre-calculated vesting results
- `public/data/schemes-meta.json` - Vesting scheme metadata

### Source Files:
- `scripts/generate-static-data.js` - Main build script with cached data
- `scripts/update-bitcoin-data.js` - Data update utility

## API Information

**CoinGecko API Endpoints:**
- Current price: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
- Historical data: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range`

**Rate Limits:**
- Free tier: ~10-50 requests per minute
- Our approach: 1 request per second during updates

## Troubleshooting

### Build Issues
- **Problem**: Build fails with network errors
- **Solution**: The build uses fallback data, so it should never fail due to API issues

### Stale Data
- **Problem**: Historical data is outdated
- **Solution**: Run `npm run update-bitcoin-data`

### API Rate Limits
- **Problem**: Update script hits rate limits
- **Solution**: Script includes 1-second delays between requests

## Best Practices

1. **Regular Updates**: Update historical data monthly
2. **Monitor Builds**: Check if current price fetching is working
3. **Fallback Awareness**: Understand when fallback data is being used
4. **API Respect**: Don't modify rate limiting delays

## Migration Notes

**Previous Behavior:**
- Made 10+ API calls during every build
- Always failed due to rate limits
- Showed confusing "fallback" messages

**Current Behavior:**
- Makes 1 API call for current price (with fallback)
- Uses cached historical data
- Clean, fast builds
- Clear logging
## Data
 Files

### Generated Files (auto-created during build):
- `public/data/bitcoin-price.json` - Current Bitcoin price with metadata
- `public/data/historical-bitcoin.json` - Complete historical dataset
- `public/data/static-calculations.json` - Pre-calculated vesting results
- `public/data/schemes-meta.json` - Vesting scheme metadata

### Cache Files (auto-managed):
- `cache/bitcoin-price-cache.json` - Current price cache (5min TTL)
- `cache/current-year-cache.json` - Current year data cache (1hr TTL)

### Source Files:
- `scripts/generate-static-data.js` - Main build script with static data
- `scripts/update-bitcoin-data.js` - Data update and cache management utility

## API Information

**CoinGecko API Endpoints:**
- Current price: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
- Historical data: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range`

**Rate Limits & Handling:**
- Free tier: ~10-50 requests per minute
- Our approach: 3 retries with exponential backoff
- Update script: 1 second delay between requests
- Build script: Intelligent caching minimizes API calls

## Troubleshooting

### Build Issues
- **Problem**: Build is slow
- **Solution**: Caches should make builds fast. Check cache directory exists.

- **Problem**: "Failed to fetch current Bitcoin price"
- **Solution**: Normal during network issues. Fallback price is used automatically.

### Data Issues
- **Problem**: Current year data seems stale
- **Solution**: Run `npm run clear-bitcoin-cache` to force fresh fetch

- **Problem**: Historical data is outdated
- **Solution**: Run `npm run update-bitcoin-data` to refresh static data

### Cache Issues
- **Problem**: Builds always hit API (no caching)
- **Solution**: Check that `cache/` directory is writable

- **Problem**: Want to force fresh data
- **Solution**: Run `npm run clear-bitcoin-cache` before build

## Best Practices

1. **Regular Maintenance**:
   - Update static historical data monthly
   - Monitor build logs for API failures
   - Clear caches if data seems stale

2. **Development**:
   - Use `npm run clear-bitcoin-cache` when testing data changes
   - Check cache files to understand what's being cached
   - Monitor API rate limits during development

3. **Production**:
   - Ensure cache directory is writable
   - Monitor build performance
   - Set up alerts for consistent API failures

4. **Data Integrity**:
   - Validate data after updates
   - Check for reasonable price ranges
   - Verify current year data is updating

## Architecture Benefits

### Performance:
- **Fast Builds**: Minimal API calls due to intelligent caching
- **Reliable**: Static data for completed years never fails
- **Efficient**: Only fetches data that can actually change

### Accuracy:
- **Live Current Data**: 2025 data updates throughout the year
- **Fresh Prices**: Current price updates every 5 minutes
- **Historical Accuracy**: Static data for completed years is definitive

### Maintainability:
- **Clear Separation**: Static vs. dynamic data clearly separated
- **Easy Updates**: Simple commands to refresh any data type
- **Good Logging**: Clear visibility into what data is being used

### Resilience:
- **Graceful Degradation**: Fallbacks for all API failures
- **Retry Logic**: Automatic retries with exponential backoff
- **Cache Validation**: Automatic cache expiration and refresh