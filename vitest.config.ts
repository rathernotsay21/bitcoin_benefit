import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.performance.test.{ts,tsx}'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    },
    testTimeout: 30000, // 30 seconds for performance tests
    hookTimeout: 30000,
    teardownTimeout: 30000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
