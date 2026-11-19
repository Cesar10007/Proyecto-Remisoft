import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  expect: { toHaveScreenshot: { pathTemplate: '{testDir}/referencias/{testFilePath}/{arg}{ext}' } },
  timeout: 90_000,
  use: {
    baseURL: process.env.SALON_BASE_URL || 'http://127.0.0.1:5173',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
})
