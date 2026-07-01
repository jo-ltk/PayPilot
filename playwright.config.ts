import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv({ path: ".env.test" });

const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3000";
const e2eBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;

function toWebServerEnv(
  env: NodeJS.ProcessEnv,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter((entry): entry is [string, string] => {
      return entry[1] !== undefined;
    }),
  );
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "api",
      testDir: "./e2e/api",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "standalone",
      testDir: "./e2e/standalone",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${e2ePort}`,
        url: `${e2eBaseUrl}/login`,
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true",
        timeout: 120_000,
        env: toWebServerEnv(process.env),
      },
});
