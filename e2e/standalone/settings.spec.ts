import { SignJWT } from "jose";
import { expect, test } from "@playwright/test";

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "test-session-secret-32-chars-min";

async function createSessionCookie(shopId = "shop-1") {
  const token = await new SignJWT({
    userId: "user-1",
    email: "finance@settleflow.test",
    memberships: [{ shopId, role: "ADMIN" }],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(SESSION_SECRET));

  return {
    name: "sf_session",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax" as const,
  };
}

const mockSettings = {
  gateway: {
    id: "gw-1",
    provider: "EASEBUZZ",
    keyMasked: "****1234",
    saltMasked: "****5678",
    merchantEmail: "merchant@example.com",
    environment: "SANDBOX",
    isActive: true,
  },
  matching: {
    strategy: "UDF_ORDER_ID",
    priority: [],
    fieldMapping: {},
    amountTolerancePaise: 0,
    includeGatewayFees: false,
  },
};

test.describe("standalone settings", () => {
  test("saves settings and shows success toast", async ({ page, context }) => {
    await context.addCookies([await createSessionCookie()]);

    await page.route("**/api/shops/shop-1/settings", async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              ...mockSettings,
              matching: {
                ...mockSettings.matching,
                strategy: "COMPOSITE",
              },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockSettings }),
      });
    });

    await page.route("**/api/shops", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "shop-1",
              shopDomain: "demo.myshopify.com",
              shopName: "Demo Store",
              currency: "INR",
              isActive: true,
              onboardingStep: "COMPLETE",
            },
          ],
        }),
      });
    });

    await page.route("**/api/health", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            status: "ok",
            checks: { database: "ok" },
            timestamp: new Date().toISOString(),
            version: "0.1.0",
          },
        }),
      });
    });

    await page.goto("/shops/shop-1/settings");

    await expect(
      page.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Gateway settings")).toBeVisible();

    await page.getByLabel("Matching strategy").click();
    await page.getByRole("option", { name: /Composite/i }).click();
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Settings saved")).toBeVisible();
  });
});
