/**
 * End-to-end tests (Playwright): the real web app in a real browser, against a
 * throwaway API server with an in-memory database — your own data is never touched.
 *
 *   npm run e2e          run them (starts both servers, stops them afterwards)
 *   npm run e2e:ui       Playwright's UI mode (watch, step through, time-travel)
 *
 * Ports 4100 (API) and 5174 (web) so they don't clash with `npm run dev` (4000 / 5173).
 */
import { defineConfig, devices } from '@playwright/test'

const API_PORT = 4100
const WEB_PORT = 5174

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts', // not *.test.ts — those are Vitest unit tests
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  outputDir: 'e2e-results',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } }],
  webServer: [
    {
      command: 'node scripts/e2e-server.js',
      cwd: '../server',
      env: { PORT: String(API_PORT) },
      url: `http://localhost:${API_PORT}/api/v1/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      env: { VITE_API_BASE_URL: `http://localhost:${API_PORT}/api/v1` },
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
