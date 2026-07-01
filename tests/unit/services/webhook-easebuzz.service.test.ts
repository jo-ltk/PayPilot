import { afterEach, describe, expect, it, vi } from "vitest";

const {
  eventUpdate,
  gatewayFindFirst,
  txnUpsert,
  txnFindUnique,
  settlementUpsert,
  refundUpsert,
} = vi.hoisted(() => ({
  eventUpdate: vi.fn(),
  gatewayFindFirst: vi.fn(),
  txnUpsert: vi.fn(),
  txnFindUnique: vi.fn(),
  settlementUpsert: vi.fn(),
  refundUpsert: vi.fn(),
}));

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: {
    webhookEvent: { update: eventUpdate },
    paymentGateway: { findFirst: gatewayFindFirst },
    gatewayTransaction: { upsert: txnUpsert, findUnique: txnFindUnique },
    gatewaySettlement: { upsert: settlementUpsert },
    gatewayRefund: { upsert: refundUpsert },
  },
}));
vi.mock("@/lib/inngest/client", () => ({ inngest: { send } }));

import { processEasebuzzWebhook } from "@/lib/services/webhook.service";

/** Stages the PROCESSING update to return the given stored event. */
function stageEvent(eventType: string, payload: Record<string, string>): void {
  eventUpdate
    .mockResolvedValueOnce({ id: "evt_1", shopId: "s1", eventType, payload })
    .mockResolvedValue(undefined);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("processEasebuzzWebhook", () => {
  it("routes a transaction event to the transaction service and marks PROCESSED", async () => {
    stageEvent("transaction", {
      txnid: "txn_1",
      amount: "100.00",
      status: "success",
      key: "k",
      hash: "h",
    });
    gatewayFindFirst.mockResolvedValue({ id: "g1", shopId: "s1" });
    txnUpsert.mockResolvedValue(undefined);

    await processEasebuzzWebhook("evt_1");

    expect(txnUpsert).toHaveBeenCalledTimes(1);
    expect(eventUpdate.mock.calls[1][0].data.status).toBe("PROCESSED");
    expect(send).toHaveBeenCalledWith({
      name: "reconciliation/run",
      data: { shopId: "s1" },
    });
  });

  it("routes a payout event to the settlement service", async () => {
    stageEvent("payout", {
      payout_id: "po_1",
      payout_amount: "500.00",
      status: "completed",
      key: "k",
      hash: "h",
    });
    gatewayFindFirst.mockResolvedValue({ id: "g1", shopId: "s1" });
    settlementUpsert.mockResolvedValue(undefined);

    await processEasebuzzWebhook("evt_1");

    expect(settlementUpsert).toHaveBeenCalledTimes(1);
  });

  it("marks the event FAILED and rethrows when a refund's transaction is missing", async () => {
    stageEvent("refund", {
      refund_id: "rf_1",
      txnid: "missing",
      refund_amount: "5.00",
      refund_status: "refunded",
      key: "k",
      hash: "h",
    });
    txnFindUnique.mockResolvedValue(null);

    await expect(processEasebuzzWebhook("evt_1")).rejects.toThrow();
    expect(eventUpdate.mock.calls[1][0].data.status).toBe("FAILED");
    expect(refundUpsert).not.toHaveBeenCalled();
  });
});
