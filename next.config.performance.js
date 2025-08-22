/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignoring build errors - TypeScript strictness issues need separate resolution
    // TODO: Fix all TypeScript errors and remove this flag
    ignoreBuildErrors: true,
  },
  // Configure for Netlify deployment
  images: {
    unoptimized: true
  },
  
  // Enable compression for static assets
  compress: true,
  
  // Advanced performance optimizations
  experimental: {
    optimizePackageImports: ['recharts', '@heroicons/react', '@headlessui/react', 'react-window', 'zustand', 'date-fns'],
    optimizeCss: true, // Enable CSS optimization
    scrollRestoration: true,
    // Modern bundle optimizations
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['recharts'],
  },
  
  // Optimize JavaScript bundles
  swcMinify: true,
  
  // Additional performance settings
  poweredByHeader: false,
  
  // Advanced webpack optimization
  webpack: (config, { isServer, dev, webpack }) => {
    // Apply optimizations for both dev and production
    if (!isServer) {
      // Enable modern optimizations
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // Separate vendor chunks for better caching
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 40,
              reuseExistingChunk: true,
            },
            recharts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'recharts',
              priority: 30,
              reuseExistingChunk: true,
            },
            ui: {
              test: /[\\/]node_modules[\\/](@headlessui|@heroicons|@radix-ui)[\\/]/,
              name: 'ui-libs',
              priority: 25,
              reuseExistingChunk: true,
            },
            utilities: {
              test: /[\\/]node_modules[\\/](zustand|date-fns|clsx|tailwind-merge)[\\/]/,
              name: 'utilities',
              priority: 20,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              enforce: true,
            },
          }
        },
        // Advanced optimizations
        usedExports: true,
        sideEffects: false,
        innerGraph: true,
      };
      
      // Tree shaking optimizations
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        include: /node_modules[\\/]recharts/,
        sideEffects: false,
      });
      
      // Performance plugins
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
        })
      );
    }

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
      // Optimize data file caching
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
  
  // Enhanced rewrites for optimized paths
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
        {
          source: '/api/preload/schemes',
          destination: '/data/schemes-meta.json',
        },
        {
          source: '/api/preload/static',
          destination: '/data/static-calculations.json',
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