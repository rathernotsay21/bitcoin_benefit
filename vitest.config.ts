import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/',
      'out/',
      '.next/',
      'coverage/',
      '**/*.d.ts',
      '**/*.config.*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        'src/test-utils.tsx',
        'src/__mocks__/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'out/',
        '.next/'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // Enhanced ES module support
    server: {
      deps: {
        inline: [
          '@testing-library/react',
          '@testing-library/jest-dom',
          'recharts'
        ]
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  // Enhanced TypeScript support
  esbuild: {
    target: 'node14'
  }
});
