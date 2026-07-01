import { expect, test } from "@playwright/test";

test("rejects a request without a session token", async ({ request }) => {
  const response = await request.post("/api/auth/shopify");
  expect(response.status()).toBe(401);

  const body = await response.json();
  expect(body.success).toBe(false);
  expect(body.error.code).toBe("AUTH_ERROR");
});

test("rejects a malformed bearer token", async ({ request }) => {
  const response = await request.post("/api/auth/shopify", {
    headers: { Authorization: "Bearer not-a-real-jwt" },
  });
  expect(response.status()).toBe(401);

  const body = await response.json();
  expect(body.success).toBe(false);
});
