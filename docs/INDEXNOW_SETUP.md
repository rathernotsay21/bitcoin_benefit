# IndexNow Setup Documentation

## Overview
IndexNow is configured for Bitcoin Benefit to instantly notify search engines about new or updated content. The implementation supports both static (Netlify) and dynamic (Next.js) deployments.

## Configuration Details

### API Key
- **Key**: `a22a916ab0474727b6815e40d4ade00a`
- **Verification File**: `/public/a22a916ab0474727b6815e40d4ade00a.txt`
- **Public URL**: `https://bitcoinbenefits.me/a22a916ab0474727b6815e40d4ade00a.txt`

### Supported Search Engines
- Bing
- Yandex
- Seznam.cz
- IndexNow.org (redistributes to participating engines)

## Implementation Components

### 1. Static Files (Required)
- **Key Verification File**: `public/a22a916ab0474727b6815e40d4ade00a.txt`
  - Must be accessible at root domain
  - Contains the API key for verification
  - Already created and ready for deployment

### 2. For Static Deployments (Netlify)
- **Netlify Function**: `netlify/functions/indexnow.js`
  - Serverless function for API submissions
  - Handles CORS for browser requests
  - Endpoint: `/.netlify/functions/indexnow`

### 3. For Next.js Deployments
- **API Route**: `src/app/api/indexnow/route.ts`
  - Next.js API endpoint
  - Endpoint: `/api/indexnow`

### 4. Client-Side Utilities
- **TypeScript Client**: `src/lib/indexnow-client.ts`
  - Auto-detects deployment type
  - Provides programmatic submission methods
- **HTML Tool**: `scripts/submit-indexnow-static.html`
  - Standalone submission interface
  - Works with both deployment types

### 5. Node.js Script
- **Script**: `scripts/submit-to-indexnow.js`
  - Command-line submission tool
  - Parses sitemap automatically
  - NPM commands: `npm run indexnow`

## Usage Instructions

### Method 1: Command Line (Build Time)
```bash
# Submit all URLs from sitemap
npm run indexnow

# Or directly
node scripts/submit-to-indexnow.js
```

### Method 2: Programmatic (Runtime)
```typescript
import { indexNow } from '@/lib/indexnow-client';

// Submit specific URLs
await indexNow.submitUrls([
  'https://bitcoinbenefits.me/calculator',
  'https://bitcoinbenefits.me/historical'
]);

// Submit current page
await indexNow.submitCurrentPage();

// Submit all pages from sitemap
await indexNow.submitSitemap();
```

### Method 3: Browser Console
```javascript
// After page loads, indexNow is available globally
await indexNow.submitCurrentPage();
```

### Method 4: Web Interface
1. Open `scripts/submit-indexnow-static.html` in browser
2. Use the GUI to submit URLs

## Deployment Checklist

### For Netlify Static Deployment:
- [x] Key verification file in `public/`
- [x] Netlify function in `netlify/functions/`
- [x] Client-side utilities
- [ ] Deploy to Netlify
- [ ] Verify key file is accessible
- [ ] Test Netlify function endpoint

### For Next.js/Vercel Deployment:
- [x] Key verification file in `public/`
- [x] API route in `src/app/api/indexnow/`
- [x] Client-side utilities
- [ ] Deploy application
- [ ] Verify key file is accessible
- [ ] Test API endpoint

## Verification Steps

1. **Verify Key File Access**:
   ```bash
   curl https://bitcoinbenefits.me/a22a916ab0474727b6815e40d4ade00a.txt
   # Should return: a22a916ab0474727b6815e40d4ade00a
   ```

2. **Test Submission (Netlify)**:
   ```bash
   curl -X POST https://bitcoinbenefits.me/.netlify/functions/indexnow \
     -H "Content-Type: application/json" \
     -d '{"urls":["https://bitcoinbenefits.me/"]}'
   ```

3. **Test Submission (Next.js)**:
   ```bash
   curl -X POST https://bitcoinbenefits.me/api/indexnow \
     -H "Content-Type: application/json" \
     -d '{"urls":["https://bitcoinbenefits.me/"]}'
   ```

## Automation Options

### GitHub Actions (CI/CD)
Add to your deployment workflow:
```yaml
- name: Submit to IndexNow
  run: |
    npm ci
    npm run indexnow
```

### Netlify Post-Build
Add to `netlify.toml`:
```toml
[build]
  command = "npm run build && npm run indexnow"
```

### On Content Updates
Use the client library to submit after dynamic updates:
```typescript
// After updating content
await indexNow.submitOnContentUpdate([updatedUrl]);
```

## Monitoring

### Check Submission Status
- Bing Webmaster Tools: https://www.bing.com/webmasters
- Yandex Webmaster: https://webmaster.yandex.com
- Monitor server logs for submission responses

### Expected Response Codes
- `202 Accepted`: URL accepted for processing
- `200 OK`: URL successfully processed
- `400 Bad Request`: Invalid request format
- `403 Forbidden`: Key verification failed
- `422 Unprocessable Entity`: Invalid URL format
- `429 Too Many Requests`: Rate limit exceeded

## Troubleshooting

### Key Verification Fails
1. Ensure file is deployed to `public/` directory
2. Check file is accessible without authentication
3. Verify exact filename matches the key

### Submissions Not Working
1. Check network connectivity
2. Verify API endpoints are accessible
3. Review console/server logs for errors
4. Ensure URLs use HTTPS protocol

### Rate Limiting
- IndexNow typically allows 10,000 URLs per day
- Submit in batches of 100 or fewer URLs
- Implement retry logic with exponential backoff

## Best Practices

1. **Submit Immediately**: Submit URLs as soon as content is published/updated
2. **Batch Submissions**: Group multiple URLs in single requests
3. **Error Handling**: Implement retry logic for failed submissions
4. **Monitor Results**: Check webmaster tools for indexing status
5. **Regular Updates**: Re-submit important pages periodically

## Security Notes

- The API key is not sensitive (it's meant to be public)
- The key file must be publicly accessible
- No authentication required for IndexNow protocol
- Rate limiting prevents abuse

## Support

For issues or questions:
1. Check IndexNow documentation: https://www.indexnow.org/documentation
2. Review search engine specific docs:
   - Bing: https://www.bing.com/indexnow
   - Yandex: https://yandex.com/support/webmaster/indexnow/
3. Monitor deployment logs for errors