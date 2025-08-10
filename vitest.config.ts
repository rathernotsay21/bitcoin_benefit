import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use test-specific TypeScript configuration
    typecheck: {
      tsconfig: './tsconfig.test.json'
    },
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
    // Enhanced ES module support for CommonJS compatibility
    deps: {
      inline: [
        '@testing-library/react',
        '@testing-library/jest-dom',
        'recharts'
      ],
      external: []
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/test-utils': resolve(__dirname, './src/__tests__/utils'),
      '@/test-fixtures': resolve(__dirname, './src/__tests__/fixtures'),
      '@/mocks': resolve(__dirname, './src/__tests__/mocks')
    }
  },
  // Enhanced TypeScript and module support for better unicode handling
  esbuild: {
    target: 'node14',
    // Better handling of unicode escape sequences
    charset: 'utf8',
    // Handle large template literals
    keepNames: true
  },
  // Optimizations for better module resolution
  optimizeDeps: {
    include: [
      '@testing-library/react',
      '@testing-library/jest-dom',
      'vitest'
    ]
  }
});
