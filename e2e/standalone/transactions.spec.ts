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

const mockTransaction = {
  id: "txn-1",
  easebuzzTxnId: "EZ-1",
  easebuzzPaymentId: "PAY-1",
  amountPaise: 150000,
  feesPaise: 3000,
  netAmountPaise: 147000,
  currency: "INR",
  status: "success",
  mode: "UPI",
  email: "buyer@example.com",
  phone: null,
  txnid: "ORD-1001",
  matchedOrderId: null,
  settlementStatus: "SETTLED",
  occurredAt: "2026-06-01T10:00:00.000Z",
};

const mockSettlement = {
  id: "set-1",
  payoutId: "PAYOUT-001",
  payoutDate: "2026-06-05",
  totalAmountPaise: 500000,
  transactionCount: 12,
  status: "completed",
  utrNumber: "UTR123456",
  bankAccountLast4: "4321",
};

test.describe("standalone transactions and settlements", () => {
  test("filters transactions and opens settlement detail", async ({
    page,
    context,
  }) => {
    await context.addCookies([await createSessionCookie()]);

    await page.route("**/api/shops/shop-1/payments**", async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get("status");
      const includeRow = !status || status === "success";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: includeRow ? [mockTransaction] : [],
          meta: {
            page: 1,
            pageSize: 25,
            total: includeRow ? 1 : 0,
            hasMore: false,
          },
        }),
      });
    });

    await page.route("**/api/shops/shop-1/settlements**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [mockSettlement],
          meta: { page: 1, pageSize: 25, total: 1, hasMore: false },
        }),
      });
    });

    await page.goto("/shops/shop-1/transactions");

    await expect(
      page.getByRole("heading", { name: "Transactions", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("ORD-1001")).toBeVisible();

    await page.locator("#status-filter").click();
    await page.getByRole("option", { name: "Success" }).click();

    await expect(page.getByText("ORD-1001")).toBeVisible();

    await page.goto("/shops/shop-1/settlements");

    await expect(
      page.getByRole("heading", { name: "Settlements", level: 1 }),
    ).toBeVisible();
    await page.getByText("PAYOUT-001").click();

    await expect(
      page.getByRole("heading", { name: "Settlement details" }),
    ).toBeVisible();
    await expect(page.getByText("UTR123456")).toBeVisible();
  });
});
