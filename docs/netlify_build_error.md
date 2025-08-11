The Netlify deploy errored, with the following guidance provided:

### Diagnosis
The build failure is due to a type error indicating that the module 'glob' or its corresponding type declarations cannot be found. This error is occurring in the file `test-string-normalizer.ts` at line 10.

### Solution
1. Ensure that the package `'glob'` is listed in the `package.json` file of the project as a dependency. If it is not present, install it by running:
   ```bash
   npm install glob
   ```

2. If `'glob'` is used for TypeScript type checking, verify that the corresponding type declarations are available. If not, you can install the type declarations for 'glob' by running:
   ```bash
   npm install --save @types/glob
   ```

By following these steps, you should resolve the issue related to the missing 'glob' module and its type declarations.

The relevant error logs are:

Line 109:    Historical Years: 11
Line 110:    Pre-calculated Schemes: 3
Line 111:    Cache Status: Price=fresh, CurrentYear=live
Line 112: > bitcoin-benefit@1.0.0 build
Line 113: > NODE_OPTIONS='--max-old-space-size=4096' next build
Line 114:   [1m[38;2;173;127;168m▲ Next.js 14.2.31[39m[22m
Line 115:  [37m[1m [22m[39m Creating an optimized production build ...
Line 116:  [32m[1m✓[22m[39m Compiled successfully
Line 117:  [37m[1m [22m[39m Linting and checking validity of types ...
Line 118:  [31m[1m⨯[22m[39m ESLint must be installed in order to run during builds: [1m[36mnpm install --save-dev eslint[39m[22m
Line 119: [31mFailed to compile.
Line 120: [39m
Line 121: [36m./scripts/test-string-normalizer.ts[39m:[33m10[39m:[33m22[39m
Line 122: [31m[1mType error[22m[39m: Cannot find module 'glob' or its corresponding type declarations.
Line 123: [0m [90m  8 |[39m [36mimport[39m [33m*[39m [36mas[39m fs [36mfrom[39m [32m'fs'[39m[33m;[39m[0m
Line 124: [0m [90m  9 |[39m [36mimport[39m [33m*[39m [36mas[39m path [36mfrom[39m [32m'path'[39m[33m;[39m[0m
Line 125: [0m[31m[1m>[22m[39m[90m 10 |[39m [36mimport[39m { glob } [36mfrom[39m [32m'glob'[39m[33m;[39m[0m
Line 126: [0m [90m    |[39m                      [31m[1m^[22m[39m[0m
Line 127: [0m [90m 11 |[39m[0m
Line 128: [0m [90m 12 |[39m [36mexport[39m [36mclass[39m [33mTestStringNormalizer[39m {[0m
Line 129: [0m [90m 13 |[39m   [90m/**[39m[0m
Next.js build worker exited with code: 1 and signal: null

11:52:23 AM: build-image version: 71a98eb82b055b934e7d58946f59957e90f5a76f (noble)
11:52:23 AM: buildbot version: 72ba091da8478e084b7407a21cd8435e7ecab808
11:52:23 AM: Fetching cached dependencies
11:52:23 AM: Starting to download cache of 595.0MB (Last modified: 2025-08-11 14:10:22 +0000 UTC)
11:52:25 AM: Finished downloading cache in 1.477s
11:52:25 AM: Starting to extract cache
11:52:31 AM: Finished extracting cache in 6.45s
11:52:31 AM: Finished fetching cache in 8.001s
11:52:31 AM: Starting to prepare the repo for build
11:52:31 AM: Preparing Git Reference refs/heads/main
11:52:32 AM: Custom publish path detected. Proceeding with the specified path: '.next'
11:52:32 AM: Custom build command detected. Proceeding with the specified command: 'npm run build'
11:52:33 AM: Starting to install dependencies
11:52:33 AM: Started restoring cached python cache
11:52:33 AM: Finished restoring cached python cache
11:52:33 AM: Started restoring cached ruby cache
11:52:33 AM: Finished restoring cached ruby cache
11:52:33 AM: Started restoring cached go cache
11:52:34 AM: Finished restoring cached go cache
11:52:34 AM: Started restoring cached Node.js version
11:52:35 AM: Finished restoring cached Node.js version
11:52:35 AM: Attempting Node.js version '20.19.4' from .nvmrc
11:52:35 AM: Downloading and installing node v20.19.4...
11:52:35 AM: Downloading https://nodejs.org/dist/v20.19.4/node-v20.19.4-linux-x64.tar.xz...
11:52:36 AM: Computing checksum with sha256sum
11:52:36 AM: Checksums matched!
11:52:38 AM: Now using node v20.19.4 (npm v10.8.2)
11:52:38 AM: Enabling Node.js Corepack
11:52:38 AM: Started restoring cached build plugins
11:52:38 AM: Finished restoring cached build plugins
11:52:38 AM: Started restoring cached corepack dependencies
11:52:38 AM: Finished restoring cached corepack dependencies
11:52:38 AM: No npm workspaces detected
11:52:38 AM: Started restoring cached node modules
11:52:38 AM: Finished restoring cached node modules
11:52:38 AM: Installing npm packages using npm version 10.8.2
11:52:39 AM: up to date, audited 232 packages in 1s
11:52:39 AM: 40 packages are looking for funding
11:52:39 AM:   run `npm fund` for details
11:52:39 AM: found 0 vulnerabilities
11:52:39 AM: npm packages installed
11:52:39 AM: Successfully installed dependencies
11:52:39 AM: Starting build script
11:52:40 AM: Detected 1 framework(s)
11:52:40 AM: "next" at version "14.2.31"
11:52:40 AM: Section completed: initializing
11:52:41 AM: ​
11:52:41 AM: Netlify Build                                                 
11:52:41 AM: ────────────────────────────────────────────────────────────────
11:52:41 AM: ​
11:52:41 AM: ❯ Version
11:52:41 AM:   @netlify/build 35.0.5
11:52:41 AM: ​
11:52:41 AM: ❯ Flags
11:52:41 AM:   accountId: 67bf295f1e52307cd8d8add1
11:52:41 AM:   baseRelDir: true
11:52:41 AM:   buildId: 689a11b421ffc90008cd98be
11:52:41 AM:   deployId: 689a11b421ffc90008cd98c0
11:52:41 AM: ​
11:52:41 AM: ❯ Current directory
11:52:41 AM:   /opt/build/repo
11:52:41 AM: ​
11:52:41 AM: ❯ Config file
11:52:41 AM:   /opt/build/repo/netlify.toml
11:52:41 AM: ​
11:52:41 AM: ❯ Context
11:52:41 AM:   production
11:52:41 AM: ​
11:52:41 AM: ❯ Using Next.js Runtime - v5.12.0
11:52:41 AM: ​
11:52:41 AM: ❯ Loading plugins
11:52:41 AM:    - @netlify/plugin-lighthouse@6.0.1 from Netlify app
11:52:44 AM: Next.js cache restored
11:52:44 AM: ​
11:52:44 AM: build.command from netlify.toml                               
11:52:44 AM: ────────────────────────────────────────────────────────────────
11:52:44 AM: ​
11:52:44 AM: $ npm run build
11:52:44 AM: > bitcoin-benefit@1.0.0 prebuild
11:52:44 AM: > node scripts/generate-static-data.js
11:52:44 AM: 🚀 Generating static data for build...
11:52:44 AM: 📅 Current year: 2025
11:52:44 AM: ⏰ Cache expired for currentPrice (610s old)
11:52:44 AM: 🌐 API request (attempt 1/3): https://api.coingecko.com/api/v3/simple/price
11:52:44 AM: ✅ API request successful
11:52:45 AM: 💰 Current Bitcoin price: $120,292 (+1.28%)
11:52:45 AM: 💾 Cached currentPrice -> cache/bitcoin-price-cache.json
11:52:45 AM: 📊 Loading Bitcoin historical data...
11:52:45 AM: ✅ Static data for 2015: $264 avg
11:52:45 AM: ✅ Static data for 2016: $574 avg
11:52:45 AM: ✅ Static data for 2017: $4,951 avg
11:52:45 AM: ✅ Static data for 2018: $7,532 avg
11:52:45 AM: ✅ Static data for 2019: $7,179 avg
11:52:45 AM: ✅ Static data for 2020: $11,111 avg
11:52:45 AM: ✅ Static data for 2021: $47,686 avg
11:52:45 AM: ✅ Static data for 2022: $31,717 avg
11:52:45 AM: ✅ Static data for 2023: $29,234 avg
11:52:45 AM: ✅ Static data for 2024: $65,000 avg
11:52:45 AM: 📋 Using cached currentYearData (1528s old)
11:52:45 AM: 🧮 Pre-calculating vesting results...
11:52:45 AM:   Calculating Accelerator...
11:52:45 AM:   Calculating Steady Builder...
11:52:45 AM:   Calculating Slow Burn...
11:52:45 AM: 💾 Saved current Bitcoin price data
11:52:45 AM: 💾 Saved historical Bitcoin data
11:52:45 AM: 💾 Saved pre-calculated results
11:52:45 AM: 💾 Saved schemes metadata
11:52:45 AM: ✅ Static data generation complete!
11:52:45 AM:    Current BTC Price: $120,292 (live)
11:52:45 AM:    Historical Years: 11
11:52:45 AM:    Pre-calculated Schemes: 3
11:52:45 AM:    Cache Status: Price=fresh, CurrentYear=live
11:52:45 AM: > bitcoin-benefit@1.0.0 build
11:52:45 AM: > NODE_OPTIONS='--max-old-space-size=4096' next build
11:52:45 AM:   ▲ Next.js 14.2.31
11:52:45 AM:    Creating an optimized production build ...
11:52:56 AM:  ✓ Compiled successfully
11:52:56 AM:    Linting and checking validity of types ...
11:52:56 AM:  ⨯ ESLint must be installed in order to run during builds: npm install --save-dev eslint
11:53:01 AM: Failed to compile.
11:53:01 AM: 
11:53:01 AM: ./scripts/test-string-normalizer.ts:10:22
11:53:01 AM: Type error: Cannot find module 'glob' or its corresponding type declarations.
11:53:01 AM:    8 | import * as fs from 'fs';
11:53:01 AM:    9 | import * as path from 'path';
11:53:01 AM: > 10 | import { glob } from 'glob';
11:53:01 AM:      |                      ^
11:53:01 AM:   11 |
11:53:01 AM:   12 | export class TestStringNormalizer {
11:53:01 AM:   13 |   /**
Next.js build worker exited with code: 1 and signal: null
11:53:01 AM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
11:53:01 AM: ​
11:53:01 AM: "build.command" failed                                        
11:53:01 AM: ────────────────────────────────────────────────────────────────
11:53:01 AM: ​
11:53:01 AM:   Error message
11:53:01 AM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
11:53:01 AM: ​
11:53:01 AM:   Error location
11:53:01 AM:   In build.command from netlify.toml:
11:53:01 AM:   npm run build
11:53:01 AM: ​
11:53:01 AM:   Resolved config
11:53:01 AM:   build:
11:53:01 AM:     command: npm run build
11:53:01 AM:     commandOrigin: config
11:53:01 AM:     environment:
11:53:01 AM:       - NODE_VERSION
11:53:01 AM:       - NPM_FLAGS
11:53:01 AM:       - NODE_OPTIONS
11:53:01 AM:       - NEXT_TELEMETRY_DISABLED
11:53:01 AM:     processing:
11:53:01 AM:       css:
11:53:01 AM:         bundle: true
11:53:01 AM:         minify: true
11:53:01 AM:       js:
11:53:01 AM:         bundle: true
11:53:01 AM:         minify: true
11:53:01 AM:       skip_processing: false
11:53:01 AM:     publish: /opt/build/repo/.next
11:53:01 AM:     publishOrigin: config
11:53:01 AM:   headers:
11:53:01 AM:     - for: /_next/static/*
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /api/*
      values:
        Cache-Control: public, max-age=300
    - for: /_next/image/*
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /*
      values:
        Referrer-Policy: strict-origin-when-cross-origin
        X-Content-Type-Options: nosniff
        X-Frame-Options: DENY
        X-XSS-Protection: 1; mode=block
  headersOrigin: config
  plugins:
    - inputs: {}
      origin: ui
      package: "@netlify/plugin-nextjs"
    - inputs: {}
      origin: ui
      package: "@netlify/plugin-lighthouse"
  redirects:
    - from: /old-calculator/*
      status: 301
      to: /calculator/:splat
    - from: /old-historical/*
      status: 301
      to: /historical/:splat
  redirectsOrigin: config
11:53:01 AM: Build failed due to a user error: Build script returned non-zero exit code: 2
11:53:01 AM: Failing build: Failed to build site
11:53:02 AM: Finished processing build request in 38.739s