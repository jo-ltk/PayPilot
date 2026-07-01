import { afterEach, describe, expect, it, vi } from "vitest";

const { txnFindUnique, refundUpsert } = vi.hoisted(() => ({
  txnFindUnique: vi.fn(),
  refundUpsert: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    gatewayTransaction: { findUnique: txnFindUnique },
    gatewayRefund: { upsert: refundUpsert },
  },
}));

import { NotFoundError } from "@/lib/api/errors";
import { mapRefundPayload, upsertRefund } from "@/lib/services/refund.service";

afterEach(() => {
  vi.clearAllMocks();
});

describe("mapRefundPayload", () => {
  it("normalises the refund amount and original txn id", () => {
    const data = mapRefundPayload({
      refund_id: "rf_1",
      txnid: "txn_1",
      refund_amount: "25.00",
      refund_status: "refunded",
      key: "k",
      hash: "h",
    });

    expect(data.amountPaise).toBe(2500);
    expect(data.originalTxnId).toBe("txn_1");
    expect(data.refundId).toBe("rf_1");
  });
});

describe("upsertRefund", () => {
  it("links the refund to its parent transaction", async () => {
    txnFindUnique.mockResolvedValue({ id: "gt_1" });
    refundUpsert.mockResolvedValue(undefined);

    await upsertRefund(
      "s1",
      mapRefundPayload({
        refund_id: "rf_1",
        txnid: "txn_1",
        refund_amount: "25.00",
        refund_status: "refunded",
        key: "k",
        hash: "h",
      }),
    );

    const call = refundUpsert.mock.calls[0][0];
    expect(call.create.transactionId).toBe("gt_1");
    expect(call.where.shopId_refundId).toEqual({ shopId: "s1", refundId: "rf_1" });
  });

  it("throws NotFoundError when the parent transaction is missing", async () => {
    txnFindUnique.mockResolvedValue(null);

    await expect(
      upsertRefund(
        "s1",
        mapRefundPayload({
          refund_id: "rf_2",
          txnid: "missing",
          refund_amount: "5.00",
          refund_status: "refunded",
          key: "k",
          hash: "h",
        }),
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(refundUpsert).not.toHaveBeenCalled();
  });
});
