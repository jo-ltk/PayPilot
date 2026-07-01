import { ReconciliationStatus, SettlementStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  amountsMatch,
  classifyMatch,
  comparisonAmount,
} from "@/lib/reconciliation/rules";

describe("comparisonAmount", () => {
  it("returns gross amount by default", () => {
    expect(comparisonAmount(10000, 9700, false)).toBe(10000);
  });

  it("returns net amount when fees are included in comparison", () => {
    expect(comparisonAmount(10000, 9700, true)).toBe(9700);
  });
});

describe("amountsMatch", () => {
  it("matches exact amounts", () => {
    expect(amountsMatch(10000, 10000, 0)).toBe(true);
  });

  it("matches within tolerance", () => {
    expect(amountsMatch(10000, 10050, 100)).toBe(true);
  });

  it("rejects amounts outside tolerance", () => {
    expect(amountsMatch(10000, 10200, 100)).toBe(false);
  });
});

describe("classifyMatch", () => {
  const base = {
    expectedAmountPaise: 10000,
    actualAmountPaise: 10000,
    settlementStatus: SettlementStatus.SETTLED,
    orderRefunded: false,
    gatewayRefundPaise: 0,
    amountTolerancePaise: 0,
  };

  it("returns MATCHED when all signals align", () => {
    expect(classifyMatch(base).status).toBe(ReconciliationStatus.MATCHED);
  });

  it("returns AMOUNT_MISMATCH first", () => {
    const result = classifyMatch({ ...base, actualAmountPaise: 9000 });
    expect(result.status).toBe(ReconciliationStatus.AMOUNT_MISMATCH);
  });

  it("returns REFUND_MISMATCH when refund signals disagree", () => {
    const result = classifyMatch({
      ...base,
      orderRefunded: true,
      gatewayRefundPaise: 0,
    });
    expect(result.status).toBe(ReconciliationStatus.REFUND_MISMATCH);
  });

  it("returns PENDING_SETTLEMENT when not yet settled", () => {
    const result = classifyMatch({
      ...base,
      settlementStatus: SettlementStatus.PENDING,
    });
    expect(result.status).toBe(ReconciliationStatus.PENDING_SETTLEMENT);
  });
});
