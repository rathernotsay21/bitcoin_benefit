ext build

  ▲ Next.js 14.2.31

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types  ...Failed to compile.

./src/app/api-test/page.tsx:14:18
Type error: Parameter 'prev' implicitly has an 'any' type.

  12 |       const response = await fetch(url);
  13 |       const data = await response.json();
> 14 |       setResults(prev => ({ 
     |                  ^
  15 |         ...prev, 
  16 |         [name]: { 
  17 |           status: response.status, 
Next.js build worker exited with code: 1 and signal: null
rathernotsay@rathernotsays-MacBook-Pro bitcoin_benefit % npm run build

> bitcoin-benefit@1.0.0 prebuild
> node scripts/generate-static-data.js

🚀 Generating static data for build...
📅 Current year: 2025
📋 Using cached currentPrice (55s old)
📊 Loading Bitcoin historical data...
✅ Static data for 2015: $264 avg
✅ Static data for 2016: $574 avg
✅ Static data for 2017: $4,951 avg
✅ Static data for 2018: $7,532 avg
✅ Static data for 2019: $7,179 avg
✅ Static data for 2020: $11,111 avg
✅ Static data for 2021: $47,686 avg
✅ Static data for 2022: $31,717 avg
✅ Static data for 2023: $29,234 avg
✅ Static data for 2024: $65,000 avg
📋 Using cached currentYearData (55s old)
🧮 Pre-calculating vesting results...
  Calculating Accelerator...
  Calculating Steady Builder...
  Calculating Slow Burn...
💾 Saved current Bitcoin price data
💾 Saved historical Bitcoin data
💾 Saved pre-calculated results
💾 Saved schemes metadata
✅ Static data generation complete!
   Current BTC Price: $118,205 (live)
   Historical Years: 11
   Pre-calculated Schemes: 3
   Cache Status: Price=fresh, CurrentYear=live

> bitcoin-benefit@1.0.0 build
> next build

  ▲ Next.js 14.2.31

   Creating an optimized production build ...
         ✓ Compiled successfully
   Linting and checking validity of types  ..Failed to compile.

./src/components/dev/APITester.tsx:18:18
Type error: Parameter 'prev' implicitly has an 'any' type.

  16 |       const response = await fetch(url);
  17 |       const data = await response.json();
> 18 |       setResults(prev => ({ 
     |                  ^
  19 |         ...prev, 
  20 |         [name]: { 
  21 |           status: response.status, 
Next.js build worker exited with code: 1 and signal: null
rathernotsay@rathernotsays-MacBook-Pro bitcoin_benefit % npm run dev  

> bitcoin-benefit@1.0.0 dev
> next dev

  ▲ Next.js 14.2.31
  - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 1104ms
 ○ Compiling / ...
 ✓ Compiled / in 1021ms (686 modules)
 GET / 200 in 1243ms
 ✓ Compiled in 180ms (351 modules)
 ✓ Compiled /track in 309ms (750 modules)
 GET /track 200 in 395ms
 ✓ Compiled /api/mempool/address/[address]/txs in 274ms (416 modules)
 ⨯ Error: Page "/api/mempool/address/[address]/txs/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
    at DevServer.renderToResponseWithComponentsImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1079:27)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async DevServer.renderPageComponent (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1962:32)
    at async DevServer.pipeImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:922:25)
    at async NextNodeServer.handleCatchallRenderRequest (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/next-server.js:272:17)
    at async DevServer.handleRequestImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:818:17)
    at async /Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/dev/next-dev-server.js:339:20
    at async Span.traceAsyncFn (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/trace/trace.js:154:20)
    at async DevServer.handleRequest (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/dev/next-dev-server.js:336:24)
    at async invokeRender (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/lib/router-server.js:179:21)
    at async handleRequest (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/lib/router-server.js:359:24)
    at async requestHandlerImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/lib/router-server.js:383:13)
    at async Server.requestListener (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/lib/start-server.js:141:13) {
  page: '/api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs'
}
 ○ Compiling /_error ...
 ✓ Compiled /_error in 540ms (1018 modules)
 GET /api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs 500 in 1182ms
 ⨯ Error: Page "/api/mempool/address/[address]/txs/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
    at DevServer.renderToResponseWithComponentsImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1079:27) {
  page: '/api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs'
}
 GET /api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs 500 in 18ms
 ⨯ Error: Page "/api/mempool/address/[address]/txs/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
    at DevServer.renderToResponseWithComponentsImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1079:27) {
  page: '/api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs'
}
 GET /api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs 500 in 15ms
 ⨯ Error: Page "/api/mempool/address/[address]/txs/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
    at DevServer.renderToResponseWithComponentsImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1079:27) {
  page: '/api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs'
}
 GET /api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs 500 in 13ms
 ⨯ Error: Page "/api/mempool/address/[address]/txs/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
    at DevServer.renderToResponseWithComponentsImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1079:27) {
  page: '/api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs'
}
 GET /api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs 500 in 14ms
 ⨯ Error: Page "/api/mempool/address/[address]/txs/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
    at DevServer.renderToResponseWithComponentsImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1079:27) {
  page: '/api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs'
}
 GET /api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs 500 in 13ms
 ⨯ Error: Page "/api/mempool/address/[address]/txs/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
    at DevServer.renderToResponseWithComponentsImpl (/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/node_modules/next/dist/server/base-server.js:1079:27) {
  page: '/api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs'
}
 GET /api/mempool/address/bc1qmhq35g9h4h2jmzcn9w3u7ua3nxve7hal2unw3j/txs 500 in 10ms
 GET /track 200 in 86ms
 ✓ Compiled /_not-found in 207ms (1006 modules)
 GET /.well-known/appspecific/com.chrome.devtools.json 404 in 261ms