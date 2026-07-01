import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";

import { SettlementsTable } from "@/components/settlements/settlements-table";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import type { SettlementView } from "@/schemas/payments.schema";

const mockRow: SettlementView = {
  id: "set-1",
  payoutId: "PAYOUT-001",
  payoutDate: "2026-06-05",
  totalAmountPaise: 500000,
  transactionCount: 12,
  status: "completed",
  utrNumber: "UTR123456",
  bankAccountLast4: "4321",
};

const columns: ColumnDef<SettlementView>[] = [
  { accessorKey: "payoutId", header: "Settlement ID" },
];

function TableFixture({
  onRowClick = vi.fn(),
}: {
  onRowClick?: (row: SettlementView) => void;
}) {
  const table = useServerDataTable({
    data: [mockRow],
    columns,
    pageIndex: 1,
    pageSize: 25,
    pageCount: 1,
    sortOrder: "desc",
    onPaginationChange: vi.fn(),
  });

  return (
    <SettlementsTable
      table={table}
      columns={columns}
      isLoading={false}
      onRowClick={onRowClick}
      onResetFilters={vi.fn()}
    />
  );
}

describe("SettlementsTable", () => {
  it("renders provided rows", () => {
    render(<TableFixture />);

    expect(screen.getByText("PAYOUT-001")).toBeInTheDocument();
  });

  it("calls onRowClick when a row is activated", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<TableFixture onRowClick={onRowClick} />);

    await user.click(screen.getByText("PAYOUT-001"));

    expect(onRowClick).toHaveBeenCalledWith(mockRow);
  });
});
