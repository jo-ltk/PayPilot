import { SignJWT } from "jose";
import { ReconciliationStatus } from "@prisma/client";
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

const mockReconciliation = {
  id: "rec-1",
  shopifyOrderId: "order-1",
  transactionId: "txn-1",
  status: ReconciliationStatus.AMOUNT_MISMATCH,
  expectedAmountPaise: 150000,
  actualAmountPaise: 145000,
  deltaPaise: -5000,
  reason: "Amount mismatch",
  resolvedAt: null,
  resolvedByUserId: null,
  createdAt: "2026-06-01T11:00:00.000Z",
};

test.describe("standalone reconciliation", () => {
  test("resolves a mismatch end-to-end", async ({ page, context }) => {
    await context.addCookies([await createSessionCookie()]);

    let resolved = false;

    await page.route("**/api/shops/shop-1/reconciliation**", async (route) => {
      if (route.request().method() === "PATCH") {
        resolved = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              ...mockReconciliation,
              status: ReconciliationStatus.RESOLVED,
              resolvedAt: new Date().toISOString(),
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [mockReconciliation],
          meta: { page: 1, pageSize: 25, total: 1, hasMore: false },
        }),
      });
    });

    await page.route("**/api/shops/shop-1/analytics**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            from: "2026-05-01",
            to: "2026-06-01",
            kpis: {
              transactionCount: 1,
              grossVolumePaise: 150000,
              feesPaise: 0,
              netVolumePaise: 150000,
              refundCount: 0,
              refundTotalPaise: 0,
              settlementCount: 1,
              settlementTotalPaise: 150000,
              pendingSettlementPaise: 0,
              reconciliation: { AMOUNT_MISMATCH: 1 },
              matchRate: 0,
            },
            series: [],
          },
        }),
      });
    });

    await page.goto("/shops/shop-1/reconciliation");

    await expect(
      page.getByRole("heading", { name: "Reconciliation", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Mismatch")).toBeVisible();

    await page.getByLabel("Row actions").click();
    await page.getByRole("menuitem", { name: "Resolve mismatch" }).click();

    await expect(
      page.getByRole("heading", { name: "Resolve mismatch" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Confirm resolution" }).click();

    await expect(page.getByText("Mismatch resolved")).toBeVisible();
    expect(resolved).toBe(true);
  });
});
