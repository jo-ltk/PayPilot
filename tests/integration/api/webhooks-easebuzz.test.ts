import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { gatewayFindMany, eventCreate, eventFindUnique } = vi.hoisted(() => ({
  gatewayFindMany: vi.fn(),
  eventCreate: vi.fn(),
  eventFindUnique: vi.fn(),
}));
const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: {
    paymentGateway: { findMany: gatewayFindMany },
    webhookEvent: { create: eventCreate, findUnique: eventFindUnique },
  },
}));
vi.mock("@/lib/inngest/client", () => ({ inngest: { send } }));

import { POST as transactionPost } from "@/app/api/webhooks/easebuzz/transaction/route";
import { POST as payoutPost } from "@/app/api/webhooks/easebuzz/payout/route";
import { POST as refundPost } from "@/app/api/webhooks/easebuzz/refund/route";
import { encrypt } from "@/lib/crypto/encrypt";
import {
  computeEasebuzzHash,
  type EasebuzzWebhookKind,
  type EasebuzzWebhookPayload,
} from "@/lib/easebuzz/webhooks";

const MERCHANT_KEY = "merchant-key";
const MERCHANT_SALT = "merchant-salt";

const storedGateway = {
  id: "g1",
  shopId: "s1",
  provider: "EASEBUZZ",
  key: encrypt(MERCHANT_KEY),
  salt: encrypt(MERCHANT_SALT),
  merchantEmail: "merchant@example.com",
  environment: "SANDBOX",
  isActive: true,
};

/** Builds a signed form-urlencoded webhook request for a channel. */
function webhookRequest(
  kind: EasebuzzWebhookKind,
  fields: EasebuzzWebhookPayload,
): Request {
  const payload: EasebuzzWebhookPayload = { key: MERCHANT_KEY, ...fields };
  payload.hash = computeEasebuzzHash(kind, payload, MERCHANT_SALT);
  return new Request(`http://localhost/api/webhooks/easebuzz/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload).toString(),
  });
}

const TXN_FIELDS = { txnid: "txn_1", amount: "100.00", status: "success" };

beforeEach(() => {
  gatewayFindMany.mockResolvedValue([storedGateway]);
  eventCreate.mockResolvedValue({ id: "evt_1" });
  send.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/webhooks/easebuzz/transaction", () => {
  it("verifies the hash, persists, and enqueues processing", async () => {
    const response = await transactionPost(
      webhookRequest("transaction", TXN_FIELDS) as never,
    );

    expect(response.status).toBe(200);
    expect(eventCreate).toHaveBeenCalledTimes(1);
    expect(eventCreate.mock.calls[0][0].data.idempotencyKey).toBe(
      "easebuzz:txn:txn_1:success",
    );
    expect(send).toHaveBeenCalledWith({
      name: "easebuzz/webhook.received",
      data: { webhookEventId: "evt_1" },
    });
  });

  it("rejects an invalid hash with 401 and does not persist", async () => {
    const request = new Request(
      "http://localhost/api/webhooks/easebuzz/transaction",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          ...TXN_FIELDS,
          key: MERCHANT_KEY,
          hash: "deadbeef",
        }).toString(),
      },
    );

    const response = await transactionPost(request as never);
    expect(response.status).toBe(401);
    expect(eventCreate).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects an unknown merchant key with 401", async () => {
    gatewayFindMany.mockResolvedValue([]);
    const response = await transactionPost(
      webhookRequest("transaction", TXN_FIELDS) as never,
    );
    expect(response.status).toBe(401);
    expect(eventCreate).not.toHaveBeenCalled();
  });

  it("treats a duplicate delivery idempotently without re-enqueueing", async () => {
    eventCreate.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("dup", {
        code: "P2002",
        clientVersion: "6.19.0",
      }),
    );
    eventFindUnique.mockResolvedValueOnce({ id: "evt_existing" });

    const response = await transactionPost(
      webhookRequest("transaction", TXN_FIELDS) as never,
    );
    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("POST /api/webhooks/easebuzz/payout", () => {
  it("verifies the hash and persists with a payout idempotency key", async () => {
    const response = await payoutPost(
      webhookRequest("payout", {
        payout_id: "po_1",
        payout_amount: "500.00",
        status: "completed",
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(eventCreate.mock.calls[0][0].data.idempotencyKey).toBe(
      "easebuzz:payout:po_1",
    );
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/webhooks/easebuzz/refund", () => {
  it("verifies the hash and persists with a refund idempotency key", async () => {
    const response = await refundPost(
      webhookRequest("refund", {
        refund_id: "rf_1",
        txnid: "txn_1",
        refund_amount: "50.00",
        refund_status: "refunded",
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(eventCreate.mock.calls[0][0].data.idempotencyKey).toBe(
      "easebuzz:refund:rf_1:refunded",
    );
    expect(send).toHaveBeenCalledTimes(1);
  });
});
