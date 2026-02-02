import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/cli.ts', 'src/**/types.ts', 'src/**/*.test.ts'],
      reporter: ['text', 'text-summary'],
    },
  },
})
