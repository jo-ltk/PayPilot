import { expect, test } from "@playwright/test";

test.describe("standalone invite flow", () => {
  test("renders the invite acceptance form", async ({ page }) => {
    await page.goto("/invite/demo-invite-token");

    await expect(page.locator('[data-slot="card-title"]')).toHaveText(
      "Accept invitation",
    );
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /accept invitation/i }),
    ).toBeVisible();
  });
});
