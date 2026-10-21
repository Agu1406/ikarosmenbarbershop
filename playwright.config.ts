import { defineConfig, devices } from "@playwright/test";

// Puerto propio para no chocar con `npm run dev` (4321): los tests deben correr sobre el build real.
const PORT = 4399;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  reporter: [["list"]],
  use: { baseURL, locale: "es-ES", timezoneId: "Europe/Madrid" },
  webServer: {
    command: `npm run build && npx astro preview --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "movil", use: { ...devices["Pixel 7"] } },
    { name: "escritorio", use: { viewport: { width: 1440, height: 900 } } },
  ],
});
