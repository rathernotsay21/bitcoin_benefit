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
    optimizePackageImports: ['recharts', '@heroicons/react', '@headlessui/react'],
  },
  
  // Optimize JavaScript bundles
  swcMinify: true,
  
  // Additional performance settings
  poweredByHeader: false,
  
  // Webpack optimizations for better code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Split large vendor libraries into separate chunks
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/](recharts|d3-)[\\/]/,
            chunks: 'all',
            priority: 10,
          },
          heroicons: {
            name: 'heroicons',
            test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
            chunks: 'all',
            priority: 9,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
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