import { describe, expect, it } from "vitest";

import {
  computeGatewayPerformance,
  computePaymentHealthScore,
  computeRefundPercentage,
  computeSuccessRate,
  getTopPaymentDays,
  normalizeMatchRate,
} from "@/lib/analytics-metrics";
import type { AnalyticsKpis } from "@/schemas/analytics.schema";

const baseKpis: AnalyticsKpis = {
  transactionCount: 100,
  grossVolumePaise: 1_000_000,
  feesPaise: 20_000,
  netVolumePaise: 980_000,
  refundCount: 2,
  refundTotalPaise: 50_000,
  settlementCount: 3,
  settlementTotalPaise: 900_000,
  pendingSettlementPaise: 100_000,
  reconciliation: { MATCHED: 95, AMOUNT_MISMATCH: 5 },
  matchRate: 0.95,
};

describe("analytics-metrics", () => {
  it("normalizes match rate from 0–1 scale", () => {
    expect(normalizeMatchRate(0.95)).toBe(95);
    expect(normalizeMatchRate(98.3)).toBe(98.3);
  });

  it("computes payment health score", () => {
    const score = computePaymentHealthScore(baseKpis, 96);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("computes success rate from payments", () => {
    const rate = computeSuccessRate([
      { status: "success" } as never,
      { status: "failed" } as never,
      { status: "success" } as never,
    ]);
    expect(rate).toBeCloseTo(66.7, 0);
  });

  it("computes refund percentage", () => {
    expect(computeRefundPercentage(baseKpis)).toBe(5);
  });

  it("returns top payment days by volume", () => {
    const top = getTopPaymentDays([
      { date: "2026-06-01", grossPaise: 100, count: 1 },
      { date: "2026-06-02", grossPaise: 500, count: 2 },
    ]);
    expect(top[0]?.date).toBe("2026-06-02");
  });

  it("groups gateway performance by mode", () => {
    const rows = computeGatewayPerformance([
      {
        mode: "UPI",
        status: "success",
        amountPaise: 1000,
      } as never,
      {
        mode: "UPI",
        status: "failed",
        amountPaise: 500,
      } as never,
    ]);

    expect(rows[0]?.mode).toBe("UPI");
    expect(rows[0]?.successRate).toBe(50);
  });
});
