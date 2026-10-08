import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4200', // URL donde corre Angular (ng serve)
    headless: false,                 // 'false' abre la ventana de Chrome para ver las pruebas
    viewport: { width: 1280, height: 720 },
    screenshot: 'off',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});