/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Netlify deployment
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Enable compression for static assets
  compress: true,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['recharts', '@heroicons/react', '@headlessui/react', 'react-window'],
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
          maxInitialRequests: 25,
          minSize: 20000,
          maxAsyncRequests: 10,
          cacheGroups: {
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
            // Icons (load on demand)
            icons: {
              name: 'icons',
              test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
              priority: 20,
              chunks: 'async',
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
  
  // Headers for better caching
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
