import { ReconciliationStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  filterReconciliationRows,
  getSettlementColumnLabel,
} from "@/lib/filter-reconciliation-rows";
import type { ReconciliationView } from "@/schemas/payments.schema";

const sampleRow: ReconciliationView = {
  id: "rec-1",
  shopifyOrderId: "order-abc",
  transactionId: "txn-xyz",
  status: ReconciliationStatus.AMOUNT_MISMATCH,
  expectedAmountPaise: 10000,
  actualAmountPaise: 9000,
  deltaPaise: -1000,
  reason: "Amount mismatch",
  resolvedAt: null,
  resolvedByUserId: null,
  createdAt: "2026-06-15T10:00:00.000Z",
};

describe("filterReconciliationRows", () => {
  it("filters rows by search query", () => {
    const rows = filterReconciliationRows([sampleRow], "order-abc");
    expect(rows).toHaveLength(1);

    const empty = filterReconciliationRows([sampleRow], "missing");
    expect(empty).toHaveLength(0);
  });

  it("filters rows by date range", () => {
    const rows = filterReconciliationRows(
      [sampleRow],
      undefined,
      "2026-06-01",
      "2026-06-30",
    );
    expect(rows).toHaveLength(1);

    const empty = filterReconciliationRows(
      [sampleRow],
      undefined,
      "2026-07-01",
      "2026-07-31",
    );
    expect(empty).toHaveLength(0);
  });
});

describe("getSettlementColumnLabel", () => {
  it("returns settlement labels from status", () => {
    expect(getSettlementColumnLabel(ReconciliationStatus.PENDING_SETTLEMENT)).toBe(
      "Pending",
    );
    expect(getSettlementColumnLabel(ReconciliationStatus.MATCHED)).toBe(
      "Settled",
    );
    expect(getSettlementColumnLabel(ReconciliationStatus.MISSING_GATEWAY)).toBe(
      "—",
    );
  });
});
