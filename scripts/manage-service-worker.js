#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SW_SOURCE = path.join(__dirname, '..', 'public', 'sw-production.js.prod');
const SW_DEST = path.join(__dirname, '..', 'public', 'sw-production.js');

// Check if we're in production build
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');

if (isProduction) {
  // Copy service worker for production
  if (fs.existsSync(SW_SOURCE)) {
    fs.copyFileSync(SW_SOURCE, SW_DEST);
    console.log('✅ Service worker prepared for production');
  } else {
    console.log('⚠️  Service worker source file not found');
  }
} else {
  // Remove service worker in development
  if (fs.existsSync(SW_DEST)) {
    fs.unlinkSync(SW_DEST);
    console.log('🧹 Service worker removed for development');
  }
}