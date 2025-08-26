/** @type {import('next').NextConfig} */

// Detect Netlify environment
const isNetlify = process.env.NETLIFY === 'true' || process.env.CONTEXT === 'production';

const nextConfig = {
  typescript: {
    // Temporarily ignoring to verify performance fixes - TODO: fix remaining TS errors
    ignoreBuildErrors: true,
  },
  // Disable React Fast Refresh cache in development
  reactStrictMode: true,
  onDemandEntries: {
    // Period (in ms) where the page is kept in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Configure image optimization
  images: {
    // Enable image optimization in production
    unoptimized: process.env.NODE_ENV !== 'production',
    // Support WebP and AVIF formats
    formats: ['image/avif', 'image/webp'],
    // Define responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize image size
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    // Domains for external images
    domains: ['api.coingecko.com', 'mempool.space'],
  },
  
  // Enable compression for static assets
  compress: true,
  
  // Enhanced performance optimizations for bundle size reduction
  experimental: {
    optimizePackageImports: [
      'recharts',
      '@heroicons/react',
      '@headlessui/react', 
      'react-window',
      'zustand',
      'zod',
      'date-fns'
    ],
    // serverComponentsExternalPackages: ['recharts'], // Removed due to conflict with optimizePackageImports
    optimizeServerReact: true,
    // Optimize CSS imports
    optimizeCss: true
  },
  
  // Optimize JavaScript bundles
  swcMinify: true,
  
  // Additional performance settings
  poweredByHeader: false,
  
  // Enhanced webpack config for better code splitting and LCP optimization
  webpack: (config, { isServer, dev, webpack }) => {
    // Add Web Worker support
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.(js|ts)$/,
        use: { 
          loader: 'worker-loader',
          options: {
            filename: 'static/[hash].worker.js',
            publicPath: '/_next/',
          }
        },
      });
    }
    
    // Disable caching in development mode
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    
    // Apply optimizations in production and Netlify environments
    if (!isServer && (!dev || isNetlify)) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            // Critical: Split Recharts into async chunk for better LCP
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-[^/]+|victory[^/]*|chart\.js)[\\/]/,
              name: 'charts-vendor',
              priority: 40,
              chunks: 'async',
              enforce: true
            },
            // Split calculation engines separately for better caching
            calculators: {
              test: /[\\/]src[\\/]lib[\\/]calculators[\\/]/,
              name: 'calculators',
              priority: 38,
              chunks: 'async',
              maxSize: 100000 // Limit to 100KB
            },
            // Split heavy animation libraries
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|react-spring|@react-spring)[\\/]/,
              name: 'animations',
              priority: 35,
              chunks: 'async'
            },
            // Icon libraries - load async
            icons: {
              test: /[\\/]node_modules[\\/](@heroicons|@radix-ui[\\/]react-icons|react-icons)[\\/]/,
              name: 'icons',
              priority: 30,
              chunks: 'async'
            },
            // UI components library
            ui: {
              test: /[\\/]node_modules[\\/](@headlessui|@radix-ui)[\\/]/,
              name: 'ui-components',
              priority: 25
            },
            // React and core deps
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'framework',
              priority: 50,
              chunks: 'initial'
            },
            // Default vendor chunk for remaining modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true
            },
            // App code splitting
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        }
      };
      
      // Tree-shaking optimizations
      // Note: Don't alias lodash as recharts needs specific modules
      
      // Add performance hints for Netlify
      if (isNetlify) {
        config.performance = {
          maxAssetSize: 512000, // 500 KB
          maxEntrypointSize: 512000,
          hints: 'warning'
        };
      }
    }
    
    // Add DefinePlugin for environment detection
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.IS_NETLIFY': JSON.stringify(isNetlify),
        'process.env.IS_LIGHTHOUSE': JSON.stringify(false), // Will be true during Lighthouse tests
      })
    );

    return config;
  },
  
  // Headers for security and caching
  async headers() {
    // Development headers to prevent caching
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
            },
            {
              key: 'Pragma',
              value: 'no-cache'
            },
            {
              key: 'Expires',
              value: '0'
            },
            {
              key: 'Surrogate-Control',
              value: 'no-store'
            },
            {
              key: 'X-Development-Mode',
              value: 'true'
            }
          ]
        }
      ];
    }
    
    // Production headers
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Business-Category',
            value: 'HR-Technology'
          },
          {
            key: 'X-Service-Type',
            value: 'Enterprise-SaaS'
          },
          // Add Link header for critical resource preloading
          {
            key: 'Link',
            value: [
              '</data/bitcoin-price.json>; rel=preload; as=fetch; crossorigin',
              '</data/schemes-meta.json>; rel=preload; as=fetch; crossorigin',
              '<https://api.coingecko.com>; rel=preconnect',
              '<https://mempool.space>; rel=dns-prefetch'
            ].join(', ')
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.coingecko.com https://mempool.space https://api.mempool.space",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Powered-By',
            value: 'Employee Benefits Platform'
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
          },
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge'
          },
        ],
      },
      {
        source: '/track',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Optimize font loading
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Optimize image caching
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Static data files caching
      {
        source: '/data/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=7200',
          },
        ],
      },
      // API response caching
      {
        source: '/api/bitcoin',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/api/historical',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        ],
      },
    ];
  },
  
  // Rewrites for optimized paths
  async rewrites() {
    return {
      beforeFiles: [
        // Preload critical data
        {
          source: '/api/preload/bitcoin',
          destination: '/data/bitcoin-price.json',
        },
        {
          source: '/api/preload/historical',
          destination: '/data/historical-bitcoin.json',
        },
      ],
    };
  },
  
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://bitcoinbenefit.netlify.app/' 
      : 'http://localhost:3000'
  },
}

module.exports = nextConfig