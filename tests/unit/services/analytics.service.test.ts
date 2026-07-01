import { ReconciliationStatus } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const {
  txnAggregate,
  txnFindMany,
  refundAggregate,
  settlementAggregate,
  reconGroupBy,
} = vi.hoisted(() => ({
  txnAggregate: vi.fn(),
  txnFindMany: vi.fn(),
  refundAggregate: vi.fn(),
  settlementAggregate: vi.fn(),
  reconGroupBy: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    gatewayTransaction: { aggregate: txnAggregate, findMany: txnFindMany },
    gatewayRefund: { aggregate: refundAggregate },
    gatewaySettlement: { aggregate: settlementAggregate },
    reconciliationRecord: { groupBy: reconGroupBy },
  },
}));

import { getAnalytics } from "@/lib/services/analytics.service";

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAnalytics", () => {
  it("aggregates KPIs and builds a daily series", async () => {
    txnAggregate
      .mockResolvedValueOnce({
        _count: { _all: 2 },
        _sum: { amountPaise: 20000, feesPaise: 400, netAmountPaise: 19600 },
      })
      .mockResolvedValueOnce({ _sum: { amountPaise: 5000 } });
    refundAggregate.mockResolvedValue({
      _count: { _all: 1 },
      _sum: { amountPaise: 1000 },
    });
    settlementAggregate.mockResolvedValue({
      _count: { _all: 1 },
      _sum: { totalAmountPaise: 15000 },
    });
    reconGroupBy.mockResolvedValue([
      { status: ReconciliationStatus.MATCHED, _count: { _all: 1 } },
      { status: ReconciliationStatus.AMOUNT_MISMATCH, _count: { _all: 1 } },
    ]);
    txnFindMany.mockResolvedValue([
      { occurredAt: new Date("2026-01-01T12:00:00Z"), amountPaise: 10000 },
      { occurredAt: new Date("2026-01-01T18:00:00Z"), amountPaise: 10000 },
    ]);

    const result = await getAnalytics("s1", {});

    expect(result.kpis.transactionCount).toBe(2);
    expect(result.kpis.grossVolumePaise).toBe(20000);
    expect(result.kpis.matchRate).toBe(0.5);
    expect(result.series).toEqual([
      { date: "2026-01-01", grossPaise: 20000, count: 2 },
    ]);
  });
});
