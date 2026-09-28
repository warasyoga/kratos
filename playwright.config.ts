import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
/** Uji situs produksi: E2E_BASE_URL=https://kratos-aris.netlify.app npm run e2e */
const remote = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: remote ?? `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'android', use: { ...devices['Pixel 7'] } },
    // Ukuran layar iPhone di Chromium. Uji WebKit sungguhan ditambahkan sebelum rilis (Tahap 9).
    { name: 'iphone', use: { ...devices['iPhone 14'], browserName: 'chromium' } },
  ],
  webServer: remote
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
