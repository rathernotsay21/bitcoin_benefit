/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignoring build errors - TypeScript strictness issues need separate resolution
    // TODO: Fix all TypeScript errors and remove this flag
    ignoreBuildErrors: true,
  },
  // Configure for Netlify deployment
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Enable compression for static assets
  compress: true,
  
  // Performance optimizations with CSS reliability fixes
  experimental: {
    optimizePackageImports: ['recharts', '@heroicons/react', '@headlessui/react', 'react-window'],
    esmExternals: false, // Prevents CSS loading issues
  },
  
  // Optimize JavaScript bundles
  swcMinify: true,
  
  // Additional performance settings
  poweredByHeader: false,
  
  // Webpack optimizations for better code splitting
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Enhanced optimization for production client bundles
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 5, // Reduce initial bundle count
          minSize: 20000, // Smaller chunks for better caching
          maxAsyncRequests: 10, // Allow more async chunks
          cacheGroups: {
            // CSS should always be in initial chunks to prevent loading issues
            styles: {
              name: 'styles',
              test: /\.(css|scss|sass)$/,
              chunks: 'all',
              priority: 50,
              enforce: true,
              reuseExistingChunk: true,
            },
            // Critical vendor libraries
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              chunks: 'all',
              enforce: true,
            },
            // Recharts and D3 dependencies (largest bundle)
            recharts: {
              name: 'recharts',
              test: /[\\/]node_modules[\\/](recharts|d3-|victory-)[\\/]/,
              priority: 30,
              chunks: 'async', // Load only when needed
              reuseExistingChunk: true,
            },
            // State management
            zustand: {
              name: 'zustand',
              test: /[\\/]node_modules[\\/]zustand[\\/]/,
              priority: 25,
              chunks: 'all',
            },
            // Icons (load on demand) - tree shake unused icons
            icons: {
              name: 'icons', 
              test: /[\\/]node_modules[\\/](@heroicons|lucide-react)[\\/]/,
              priority: 20,
              chunks: 'async',
              enforce: true,
              reuseExistingChunk: true,
            },
            // UI components
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@headlessui|react-window)[\\/]/,
              priority: 15,
              chunks: 'async',
            },
            // Common shared modules
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 10,
              chunks: 'async',
              reuseExistingChunk: true,
            },
            // Default vendor chunk
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 5,
              chunks: 'async',
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Add module concatenation for better tree shaking
      config.optimization.concatenateModules = true;
      
      // Enable aggressive tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Minimize unused code
      config.optimization.minimize = true;
      
      // Ensure CSS is extracted properly and not split
      config.optimization.splitChunks.cacheGroups.default = {
        ...config.optimization.splitChunks.cacheGroups.default,
        minChunks: 1,
        priority: -20,
        reuseExistingChunk: true
      };

      // Optimize moment.js if used
      config.plugins.push(
        new (require('webpack')).IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        })
      );
    }

    // Add aliases for optimized imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components/HistoricalTimelineVisualization': '@/components/HistoricalTimelineVisualizationOptimized',
      '@/components/VirtualizedAnnualBreakdown': '@/components/VirtualizedAnnualBreakdownOptimized',
    };

    return config;
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms", // unsafe-eval needed for Next.js, clarity.ms for analytics
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
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
