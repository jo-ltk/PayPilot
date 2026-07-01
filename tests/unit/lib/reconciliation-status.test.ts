import { ReconciliationStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  getReconciliationStatusLabel,
  getReconciliationStatusVariant,
  isMismatchStatus,
  isResolvableStatus,
} from "@/lib/reconciliation-status";

describe("reconciliation-status", () => {
  it("maps reconciliation statuses to display labels", () => {
    expect(getReconciliationStatusLabel(ReconciliationStatus.MATCHED)).toBe(
      "Settled",
    );
    expect(
      getReconciliationStatusLabel(ReconciliationStatus.AMOUNT_MISMATCH),
    ).toBe("Mismatch");
  });

  it("maps reconciliation statuses to semantic variants", () => {
    expect(getReconciliationStatusVariant(ReconciliationStatus.MATCHED)).toBe(
      "success",
    );
    expect(
      getReconciliationStatusVariant(ReconciliationStatus.PENDING_SETTLEMENT),
    ).toBe("pending");
    expect(
      getReconciliationStatusVariant(ReconciliationStatus.MISSING_GATEWAY),
    ).toBe("error");
  });

  it("identifies resolvable and mismatch statuses", () => {
    expect(isResolvableStatus(ReconciliationStatus.AMOUNT_MISMATCH)).toBe(true);
    expect(isResolvableStatus(ReconciliationStatus.MATCHED)).toBe(false);
    expect(isResolvableStatus(ReconciliationStatus.RESOLVED)).toBe(false);
    expect(isMismatchStatus(ReconciliationStatus.REFUND_MISMATCH)).toBe(true);
    expect(isMismatchStatus(ReconciliationStatus.MATCHED)).toBe(false);
  });
});
