import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Only maintained examples belong to CI; local scaffolds may still be pending.
    include: [
      'tests/**/*.test.ts',
      'examples/calculator/*.feature.test.ts',
      'examples/order-confirmation/*.feature.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/cli.ts', 'examples/**'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
})
