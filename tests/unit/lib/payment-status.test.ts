import { describe, expect, it } from "vitest";

import {
  formatStatusLabel,
  getPaymentStatusVariant,
  getSettlementStatusVariant,
} from "@/lib/payment-status";

describe("payment-status", () => {
  it("maps payment statuses to semantic variants", () => {
    expect(getPaymentStatusVariant("success")).toBe("success");
    expect(getPaymentStatusVariant("pending")).toBe("pending");
    expect(getPaymentStatusVariant("failure")).toBe("error");
  });

  it("maps settlement statuses to semantic variants", () => {
    expect(getSettlementStatusVariant("completed")).toBe("success");
    expect(getSettlementStatusVariant("pending")).toBe("warning");
    expect(getSettlementStatusVariant("failed")).toBe("error");
  });

  it("formats status labels for display", () => {
    expect(formatStatusLabel("userCancelled")).toBe("User Cancelled");
  });
});
