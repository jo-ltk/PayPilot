import { describe, expect, it } from "vitest";

import { mapGraphQLOrder, mapWebhookOrder } from "@/lib/services/order.service";
import type { ShopifyGraphQLOrder } from "@/lib/shopify/queries/orders";

describe("mapWebhookOrder", () => {
  it("maps a webhook payload to integer-paise order data", () => {
    const result = mapWebhookOrder({
      id: 6543210001,
      name: "#1001",
      order_number: 1001,
      total_price: "1500.00",
      currency: "INR",
      financial_status: "paid",
      payment_gateway_names: ["Easebuzz"],
      processed_at: "2026-01-15T10:00:00Z",
    });

    expect(result.shopifyOrderId).toBe("6543210001");
    expect(result.orderNumber).toBe(1001);
    expect(result.totalPricePaise).toBe(150000);
    expect(result.financialStatus).toBe("paid");
    expect(result.paymentGatewayNames).toEqual(["Easebuzz"]);
    expect(result.processedAt).toBeInstanceOf(Date);
  });

  it("defaults missing financial status and gateways", () => {
    const result = mapWebhookOrder({
      id: "1",
      name: "#1",
      current_total_price: "10.00",
    });
    expect(result.financialStatus).toBe("pending");
    expect(result.paymentGatewayNames).toEqual([]);
    expect(result.processedAt).toBeNull();
  });

  it("throws on an invalid payload", () => {
    expect(() => mapWebhookOrder({ name: "#1" })).toThrow();
  });
});

describe("mapGraphQLOrder", () => {
  it("maps a GraphQL node and derives the order number from the name", () => {
    const node: ShopifyGraphQLOrder = {
      legacyResourceId: "6543210001",
      name: "#1042",
      processedAt: "2026-01-15T10:00:00Z",
      displayFinancialStatus: "PAID",
      paymentGatewayNames: ["Easebuzz"],
      currentTotalPriceSet: {
        shopMoney: { amount: "2500.00", currencyCode: "INR" },
      },
    };

    const result = mapGraphQLOrder(node);
    expect(result.shopifyOrderId).toBe("6543210001");
    expect(result.orderName).toBe("#1042");
    expect(result.orderNumber).toBe(1042);
    expect(result.totalPricePaise).toBe(250000);
    expect(result.currency).toBe("INR");
    expect(result.financialStatus).toBe("PAID");
  });
});
