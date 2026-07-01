import { afterEach, describe, expect, it, vi } from "vitest";

const { txnUpsert } = vi.hoisted(() => ({ txnUpsert: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: { gatewayTransaction: { upsert: txnUpsert } },
}));

import {
  mapTransactionPayload,
  upsertTransaction,
} from "@/lib/services/transaction.service";

afterEach(() => {
  vi.clearAllMocks();
});

describe("mapTransactionPayload", () => {
  it("converts amounts to paise and derives net of fees", () => {
    const data = mapTransactionPayload({
      txnid: "txn_1",
      amount: "100.00",
      easebuzz_charges: "2.00",
      status: "success",
      key: "k",
      hash: "h",
    });

    expect(data.amountPaise).toBe(10000);
    expect(data.feesPaise).toBe(200);
    expect(data.netAmountPaise).toBe(9800);
    expect(data.easebuzzTxnId).toBe("txn_1");
  });

  it("maps all ten udf fields and defaults fees to zero", () => {
    const data = mapTransactionPayload({
      txnid: "txn_2",
      amount: "10.00",
      status: "success",
      key: "k",
      hash: "h",
      udf1: "1001",
      udf10: "tenth",
    });

    expect(data.feesPaise).toBe(0);
    expect(data.udf1).toBe("1001");
    expect(data.udf10).toBe("tenth");
    expect(data.udf5).toBeNull();
  });

  it("throws when required fields are missing", () => {
    expect(() => mapTransactionPayload({ amount: "10.00" })).toThrow();
  });
});

describe("upsertTransaction", () => {
  it("upserts by composite (shopId, easebuzzTxnId) key", async () => {
    txnUpsert.mockResolvedValue(undefined);
    const data = mapTransactionPayload({
      txnid: "txn_3",
      amount: "10.00",
      status: "success",
      key: "k",
      hash: "h",
    });

    await upsertTransaction("s1", "g1", data);

    const call = txnUpsert.mock.calls[0][0];
    expect(call.where.shopId_easebuzzTxnId).toEqual({
      shopId: "s1",
      easebuzzTxnId: "txn_3",
    });
    expect(call.create.gatewayId).toBe("g1");
  });
});
