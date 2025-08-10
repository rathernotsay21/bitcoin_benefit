/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: Removed 'output: export' to enable API routes
  // For static deployment, consider using Netlify Functions instead
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['recharts', '@heroicons/react', 'zustand'],
  },
  
  // Enable compression for static assets
  compress: true,
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for client-side bundles
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 10,
          },
          icons: {
            test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
            name: 'icons',
            chunks: 'all',
            priority: 10,
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
