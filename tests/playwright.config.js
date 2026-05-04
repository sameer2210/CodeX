import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    baseURL: 'http://localhost:5173',
  },
  webServer: [
    {
      command: 'npm run start',
      cwd: './Backend',
      port: 5001,
      env: {
        PORT: '5001',
      },
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npx vite --host 127.0.0.1 --port 5173',
      cwd: './Frontend',
      port: 5173,
      env: {
        VITE_BACKEND_URL: 'http://127.0.0.1:5001',
      },
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
