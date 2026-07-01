import { afterEach, describe, expect, it, vi } from "vitest";

const { settlementUpsert } = vi.hoisted(() => ({ settlementUpsert: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: { gatewaySettlement: { upsert: settlementUpsert } },
}));

import {
  mapSettlementPayload,
  upsertSettlement,
} from "@/lib/services/settlement.service";

afterEach(() => {
  vi.clearAllMocks();
});

describe("mapSettlementPayload", () => {
  it("normalises amount, count, and last4 bank digits", () => {
    const data = mapSettlementPayload({
      payout_id: "po_1",
      payout_amount: "1500.50",
      payout_date: "2026-01-01",
      transaction_count: "3",
      status: "completed",
      utr: "UTR123",
      account_number: "1234567890",
      key: "k",
      hash: "h",
    });

    expect(data.totalAmountPaise).toBe(150050);
    expect(data.transactionCount).toBe(3);
    expect(data.bankAccountLast4).toBe("7890");
    expect(data.utrNumber).toBe("UTR123");
  });

  it("defaults optional fields", () => {
    const data = mapSettlementPayload({
      payout_id: "po_2",
      payout_amount: "10.00",
      status: "pending",
      key: "k",
      hash: "h",
    });

    expect(data.transactionCount).toBe(0);
    expect(data.utrNumber).toBeNull();
    expect(data.bankAccountLast4).toBeNull();
  });
});

describe("upsertSettlement", () => {
  it("upserts by composite (shopId, payoutId) key", async () => {
    settlementUpsert.mockResolvedValue(undefined);
    const data = mapSettlementPayload({
      payout_id: "po_3",
      payout_amount: "10.00",
      status: "completed",
      key: "k",
      hash: "h",
    });

    await upsertSettlement("s1", "g1", data);

    const call = settlementUpsert.mock.calls[0][0];
    expect(call.where.shopId_payoutId).toEqual({ shopId: "s1", payoutId: "po_3" });
    expect(call.create.gatewayId).toBe("g1");
  });
});
