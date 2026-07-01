import { createHmac } from "crypto";

import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, create, eventFindUnique } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  eventFindUnique: vi.fn(),
}));
const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: {
    shop: { findUnique },
    webhookEvent: { create, findUnique: eventFindUnique },
  },
}));
vi.mock("@/lib/inngest/client", () => ({ inngest: { send } }));

import { POST } from "@/app/api/webhooks/shopify/route";

const SECRET = "test-api-secret";

/**
 * Builds a signed Shopify webhook request.
 */
function webhookRequest(body: string, overrides: Record<string, string> = {}) {
  const hmac = createHmac("sha256", SECRET).update(body, "utf8").digest("base64");
  return new Request("http://localhost/api/webhooks/shopify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-shopify-hmac-sha256": hmac,
      "x-shopify-topic": "orders/paid",
      "x-shopify-shop-domain": "demo.myshopify.com",
      "x-shopify-webhook-id": "wh_1",
      ...overrides,
    },
    body,
  });
}

const ORDER_BODY = JSON.stringify({ id: 1, name: "#1001", total_price: "10.00" });

describe("POST /api/webhooks/shopify", () => {
  beforeEach(() => {
    findUnique.mockResolvedValue({ id: "shop_1" });
    create.mockResolvedValue({ id: "evt_1" });
    send.mockResolvedValue(undefined);
  });

  afterEach(() => {
    findUnique.mockReset();
    create.mockReset();
    eventFindUnique.mockReset();
    send.mockReset();
  });

  it("accepts a valid signature, persists, and enqueues processing", async () => {
    const response = await POST(webhookRequest(ORDER_BODY) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({ success: true, data: { duplicate: false } });
    expect(create).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      name: "shopify/webhook.received",
      data: { webhookEventId: "evt_1" },
    });
  });

  it("rejects an invalid HMAC signature with 401", async () => {
    const request = new Request("http://localhost/api/webhooks/shopify", {
      method: "POST",
      headers: {
        "x-shopify-hmac-sha256": "invalid",
        "x-shopify-topic": "orders/paid",
        "x-shopify-shop-domain": "demo.myshopify.com",
        "x-shopify-webhook-id": "wh_1",
      },
      body: ORDER_BODY,
    });

    const response = await POST(request as never);
    expect(response.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("treats a duplicate delivery idempotently without re-enqueueing", async () => {
    create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("dup", {
        code: "P2002",
        clientVersion: "6.19.0",
      }),
    );
    eventFindUnique.mockResolvedValueOnce({ id: "evt_existing" });

    const response = await POST(webhookRequest(ORDER_BODY) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.duplicate).toBe(true);
    expect(send).not.toHaveBeenCalled();
  });
});
