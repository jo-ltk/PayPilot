import { ReconciliationStatus } from "@prisma/client";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MismatchBadge } from "@/components/reconciliation/mismatch-badge";

describe("MismatchBadge", () => {
  it("renders a labelled status badge for mismatches", () => {
    render(<MismatchBadge status={ReconciliationStatus.AMOUNT_MISMATCH} />);

    expect(screen.getByText("Mismatch")).toBeInTheDocument();
  });

  it("renders settled label for matched records", () => {
    render(<MismatchBadge status={ReconciliationStatus.MATCHED} />);

    expect(screen.getByText("Settled")).toBeInTheDocument();
  });
});
