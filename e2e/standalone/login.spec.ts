import { expect, test } from "@playwright/test";

test.describe("standalone login flow", () => {
  test("renders the sign-in form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Sign in to PayPilot")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "AUTH_ERROR",
            message: "Invalid email or password",
          },
        }),
      });
    });

    await page.goto("/login");

    await page.getByLabel("Email").fill("not-a-user@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.locator('main p[role="alert"]'),
    ).toHaveText(/invalid email or password/i);
  });

  test("redirects unauthenticated shop access to login", async ({ page }) => {
    await page.goto("/shops/seed_shop_demo");

    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.getByText("Sign in to PayPilot")).toBeVisible();
  });
});
