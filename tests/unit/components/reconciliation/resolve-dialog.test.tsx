import { ReconciliationStatus } from "@prisma/client";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ResolveDialog } from "@/components/reconciliation/resolve-dialog";
import type { ReconciliationView } from "@/schemas/payments.schema";

const mockRecord: ReconciliationView = {
  id: "rec-1",
  shopifyOrderId: "order-1",
  transactionId: "txn-1",
  status: ReconciliationStatus.AMOUNT_MISMATCH,
  expectedAmountPaise: 150000,
  actualAmountPaise: 145000,
  deltaPaise: -5000,
  reason: "Amount mismatch",
  resolvedAt: null,
  resolvedByUserId: null,
  createdAt: "2026-06-01T11:00:00.000Z",
};

describe("ResolveDialog", () => {
  it("calls onConfirm when resolution is confirmed", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ResolveDialog
        record={mockRecord}
        open
        onOpenChange={vi.fn()}
        isPending={false}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Confirm resolution" }));

    expect(onConfirm).toHaveBeenCalledWith("rec-1", "");
  });

  it("submits resolution notes with the confirm handler", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ResolveDialog
        record={mockRecord}
        open
        onOpenChange={vi.fn()}
        isPending={false}
        onConfirm={onConfirm}
      />,
    );

    await user.type(
      screen.getByLabelText("Resolution notes"),
      "Verified with finance",
    );
    await user.click(screen.getByRole("button", { name: "Confirm resolution" }));

    expect(onConfirm).toHaveBeenCalledWith("rec-1", "Verified with finance");
  });
});
