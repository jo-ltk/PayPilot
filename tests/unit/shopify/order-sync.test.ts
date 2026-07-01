import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { encrypt } from "@/lib/crypto/encrypt";

const { findUnique, upsert } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    shop: { findUnique },
    shopifyOrder: { upsert },
  },
}));

import { syncShopifyOrders } from "@/lib/shopify/order-sync";

/**
 * Builds a GraphQL orders-page Response.
 */
function ordersPage(
  nodes: unknown[],
  hasNextPage: boolean,
  endCursor: string | null,
): Response {
  return new Response(
    JSON.stringify({
      data: { orders: { pageInfo: { hasNextPage, endCursor }, nodes } },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

const node = {
  legacyResourceId: "111",
  name: "#1001",
  processedAt: "2026-01-15T10:00:00Z",
  displayFinancialStatus: "PAID",
  paymentGatewayNames: ["Easebuzz"],
  currentTotalPriceSet: { shopMoney: { amount: "1500.00", currencyCode: "INR" } },
};

describe("syncShopifyOrders", () => {
  beforeEach(() => {
    findUnique.mockResolvedValue({
      id: "shop_1",
      shopDomain: "demo.myshopify.com",
      session: { accessToken: encrypt("shpat_offline") },
    });
    upsert.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    upsert.mockReset();
    findUnique.mockReset();
  });

  it("pages through results and upserts each order", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(ordersPage([node], true, "cursor-1"))
      .mockResolvedValueOnce(ordersPage([{ ...node, legacyResourceId: "112" }], false, null));

    const count = await syncShopifyOrders("shop_1");

    expect(count).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenCalledTimes(2);

    const firstCall = upsert.mock.calls[0][0];
    expect(firstCall.where.shopId_shopifyOrderId.shopifyOrderId).toBe("111");
    expect(firstCall.create.totalPricePaise).toBe(150000);
  });

  it("uses the decrypted token in the Admin API request", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(ordersPage([], false, null));

    await syncShopifyOrders("shop_1", { query: "updated_at:>=2026-01-01" });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Shopify-Access-Token"]).toBe("shpat_offline");
  });

  it("throws when the shop session is missing", async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(syncShopifyOrders("missing")).rejects.toThrow();
  });
});
