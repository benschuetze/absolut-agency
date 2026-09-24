import { defineConfig, devices } from '@playwright/test';

/**
 * UI tests run against the real Vite dev server on a dedicated port, so a dev
 * server the founder happens to have open on 5173 is never reused or killed.
 */
const PORT = 5199;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list']] : [['list']],
  outputDir: './test-results',

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      /* Touch device: hover does not exist here, which is the interesting case. */
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
    {
      /* The third engine, for the one thing on this site that replaces what
         the engine itself would draw. Gecko suppresses its scrollbars through
         a different declaration than Blink and WebKit do, so "it works in
         Chrome" says nothing about it. Only those tests: the rest of the site
         is the same HTML everywhere. */
      name: 'firefox-scrollbar',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 860 } },
      grep: /the scrollbar/,
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
