import { test, expect } from "@playwright/test";

test("health endpoint returns a success envelope", async ({ request }) => {
  const response = await request.get("/api/health");
  expect([200, 503]).toContain(response.status());

  const body = await response.json();
  expect(body.success).toBe(true);
  expect(body.data.status).toMatch(/ok|degraded/);
  expect(body.data.checks.database).toMatch(/ok|error|skipped/);
});
