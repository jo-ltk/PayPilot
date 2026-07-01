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

test.describe("standalone dashboard", () => {
  test("loads dashboard KPIs with mocked APIs", async ({ page, context }) => {
    await context.addCookies([await createSessionCookie()]);

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
              transactionCount: 42,
              grossVolumePaise: 5000000,
              feesPaise: 100000,
              netVolumePaise: 4900000,
              refundCount: 1,
              refundTotalPaise: 50000,
              settlementCount: 2,
              settlementTotalPaise: 4000000,
              pendingSettlementPaise: 900000,
              reconciliation: { MATCHED: 40, AMOUNT_MISMATCH: 1 },
              matchRate: 0.976,
            },
            series: [
              { date: "2026-05-01", grossPaise: 200000, count: 2 },
              { date: "2026-05-02", grossPaise: 300000, count: 3 },
            ],
          },
        }),
      });
    });

    await page.route("**/api/shops/shop-1/payments**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "txn-1",
              easebuzzTxnId: "EZ-1",
              easebuzzPaymentId: "PAY-1",
              amountPaise: 150000,
              feesPaise: 3000,
              netAmountPaise: 147000,
              currency: "INR",
              status: "success",
              mode: "UPI",
              email: null,
              phone: null,
              txnid: "ORD-1",
              matchedOrderId: null,
              settlementStatus: "SETTLED",
              occurredAt: "2026-06-01T10:00:00.000Z",
            },
          ],
          meta: { page: 1, pageSize: 5, total: 1, hasMore: false },
        }),
      });
    });

    const emptyList = {
      success: true,
      data: [],
      meta: { page: 1, pageSize: 100, total: 0, hasMore: false },
    };

    await page.route("**/api/shops/shop-1/settlements**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyList),
      });
    });

    await page.route("**/api/shops/shop-1/refunds**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyList),
      });
    });

    await page.route("**/api/shops/shop-1/reconciliation**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
          meta: { page: 1, pageSize: 5, total: 0, hasMore: false },
        }),
      });
    });

    await page.goto("/shops/shop-1");

    await expect(
      page.getByRole("heading", { name: "Dashboard", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Today's Sales")).toBeVisible();
    await expect(page.getByText("Settled Amount")).toBeVisible();
    await expect(page.getByText("Payment received")).toBeVisible();
  });
});
