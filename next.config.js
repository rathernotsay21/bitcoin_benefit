/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: Removed 'output: export' to enable API routes
  // For static deployment, consider using Netlify Functions instead
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // SWC configuration for better unicode escape handling
  swcMinify: true,
  
  // Compiler options for SWC
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    
    // Enable emotion if needed
    emotion: false,
    
    // SWC transform options
    styledComponents: false
  },
  
  // Performance optimizations
  experimental: {
    swcTraceProfiling: false,
    optimizePackageImports: ['recharts', '@heroicons/react', 'zustand'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Enable compression for static assets
  compress: true,
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for client-side bundles
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
            reuseExistingChunk: true,
          },
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          icons: {
            test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
            name: 'icons',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          utils: {
            test: /[\\/]node_modules[\\/](zustand|date-fns|numeral)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 15,
            reuseExistingChunk: true,
          },
        },
      };
      
      // Tree shake unused code
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Add module concatenation for better performance
      config.optimization.concatenateModules = true;
    }
    
    return config;
  },
  
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://bitcoinbenefit.netlify.app/' 
      : 'http://localhost:3000'
  },
}

module.exports = nextConfig
