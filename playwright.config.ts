import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * E2E runs against `next dev` with Clerk bypassed (NEXT_PUBLIC_DEV_BYPASS) and
 * every backend call mocked per test via `page.route("**\/api/backend/**")`.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // One `next dev` server compiles routes on demand; parallel workers just time out waiting on it.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // The app's sw.js would re-issue fetches outside page.route(), bypassing the mocks.
    serviceWorkers: "block",
    ...devices["Pixel 7"],
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_DEV_BYPASS: "true",
      NEXT_PUBLIC_DEV_USERID: "e2e-user",
      NEXT_PUBLIC_GROUP_POOLS: "true",
      NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
    },
  },
});
