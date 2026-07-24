/**
 * Playwright config for the e2e suite in `e2e/`. Points `baseURL` at
 * `http://localhost:4200` — the front container's published port under
 * `vista-v2-infra`'s docker-compose — and assumes that stack (front + API +
 * Postgres) is already running; this config deliberately has no `webServer`
 * block, since compose already owns starting/stopping the app.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
