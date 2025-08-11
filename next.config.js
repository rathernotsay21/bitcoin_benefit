/** @type {import('next').NextConfig} */
const nextConfig = {
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
  
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://bitcoinbenefit.netlify.app/' 
      : 'http://localhost:3000'
  },
}

module.exports = nextConfig