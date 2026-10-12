import { defineConfig } from 'vitest/config';

/* Data checks only. The browser tests in tests/ belong to Playwright. */
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
