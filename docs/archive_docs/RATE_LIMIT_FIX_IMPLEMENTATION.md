# Rate Limit Fix Implementation

## Problem
The vesting tracker was experiencing frequent 429 (Too Many Requests) errors when fetching Bitcoin price data from CoinGecko API, causing the application to fail or become very slow with exponential backoff retries.

## Root Cause Analysis
1. **Aggressive client-side rate limiting**: 2-second intervals were still too fast for CoinGecko's free tier
2. **No server-side rate limiting**: The API proxy had no rate limiting protection
3. **Batch processing issues**: Even with reduced batch sizes, concurrent requests were overwhelming the API
4. **Insufficient retry delays**: Exponential backoff was not conservative enough

## Solutions Implemented

### 1. More Conservative Client-Side Rate Limiting
**File**: `src/lib/on-chain/price-fetcher.ts`

- **Reduced batch size**: From 3 to 1 (process one request at a time)
- **Increased minimum interval**: From 2 seconds to 5 seconds between requests
- **Reduced max requests per minute**: From 10 to 5 requests
- **Longer inter-request delays**: From 500ms to 2000ms between batch items
- **Extended retry backoff**: Start at 10 seconds, max 2 minutes (was 2s to 30s)
- **Reduced retry attempts**: From 5 to 3 attempts to avoid prolonged failures

```typescript
// Before
private static readonly MAX_BATCH_SIZE = 3;
private static readonly MIN_REQUEST_INTERVAL = 2000;
private static readonly MAX_REQUESTS_PER_MINUTE = 10;

// After  
private static readonly MAX_BATCH_SIZE = 1;
private static readonly MIN_REQUEST_INTERVAL = 5000;
private static readonly MAX_REQUESTS_PER_MINUTE = 5;
```

### 2. Server-Side Rate Limiting
**File**: `src/app/api/coingecko/route.ts`

- **Added ServerRateLimit class**: Tracks requests in memory with 5 requests per minute limit
- **Pre-request validation**: Checks rate limit before making CoinGecko API calls
- **Additional delay**: 1-second delay before each CoinGecko request
- **Proper 429 responses**: Returns appropriate rate limit errors to client

```typescript
class ServerRateLimit {
  private static requests: number[] = [];
  private static readonly MAX_REQUESTS_PER_MINUTE = 5;
  
  static async checkRateLimit(): Promise<boolean> {
    // Implementation tracks and limits requests
  }
}
```

### 3. Enhanced Concurrent Processing
**File**: `src/lib/on-chain/concurrentProcessing.ts`

- **Reduced concurrency**: From 2 to 1 concurrent operation for price requests
- **Smaller batches**: From 5 to 3 items per batch
- **Extended timeouts**: From 60 to 120 seconds for rate-limited requests
- **Fewer retries**: From 5 to 3 attempts with longer delays

### 4. Improved Error Handling
**File**: `src/lib/on-chain/price-fetcher.ts`

- **Rate limit detection**: Specifically handles 429 errors with 30-second waits
- **Better fallback logging**: More informative console messages
- **Graceful degradation**: Continues processing with fallback prices when API fails

```typescript
// If it's a rate limit error, wait longer before continuing
if (error instanceof Error && error.message.includes('429')) {
  console.warn(`Rate limit hit for ${date}, waiting 30 seconds before continuing...`);
  await new Promise(resolve => setTimeout(resolve, 30000));
}
```

## Expected Results

### Performance Impact
- **Slower but reliable**: Processing will take significantly longer but should complete successfully
- **Reduced 429 errors**: Much fewer rate limit violations
- **Better user experience**: Progress indicators show processing status
- **Fallback resilience**: Uses historical averages when API fails

### Rate Limiting Strategy
- **Client-side**: Maximum 5 requests per minute with 5-second intervals
- **Server-side**: Additional 5 requests per minute limit with 1-second delays
- **Combined effect**: Extremely conservative approach to avoid rate limits

### User Experience
- **Progress tracking**: Shows current date being processed and progress percentage
- **Informative messages**: Clear console logging for debugging
- **Graceful fallbacks**: Uses reasonable price estimates when API fails
- **Retry logic**: Intelligent backoff with longer delays for rate limits

## Testing Recommendations

1. **Test with multiple years**: Try 5+ years of vesting data to stress test
2. **Monitor console logs**: Watch for rate limiting messages and fallback usage
3. **Check progress indicators**: Verify UI shows processing status correctly
4. **Verify fallback behavior**: Ensure reasonable prices when API fails

## Monitoring

Watch for these console messages:
- `"Fetching price for DATE (X/Y)..."` - Normal progress
- `"Rate limited, retrying after Xms..."` - Client-side rate limit hit
- `"Rate limit hit for DATE, waiting 30 seconds..."` - Extended wait for 429 errors
- `"Using fallback price for DATE: $X"` - API failed, using fallback
- `"Server rate limit exceeded"` - Server-side protection triggered

## Future Improvements

If rate limiting issues persist:
1. **Consider CoinGecko Pro API**: Paid tier has higher rate limits
2. **Implement request queuing**: More sophisticated queue management
3. **Add caching layer**: Redis or database caching for price data
4. **Alternative price sources**: Fallback to other APIs when CoinGecko fails