import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";

import { TransactionsTable } from "@/components/transactions/transactions-table";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import type { TransactionView } from "@/schemas/payments.schema";

const mockRow: TransactionView = {
  id: "txn-1",
  easebuzzTxnId: "EZ-TXN-001",
  easebuzzPaymentId: "EZ-PAY-001",
  amountPaise: 150000,
  feesPaise: 3000,
  netAmountPaise: 147000,
  currency: "INR",
  status: "success",
  mode: "UPI",
  email: "buyer@example.com",
  phone: "9876543210",
  txnid: "ORD-1001",
  matchedOrderId: "order-1",
  settlementStatus: "SETTLED",
  occurredAt: "2026-06-01T10:00:00.000Z",
};

const columns: ColumnDef<TransactionView>[] = [
  { accessorKey: "txnid", header: "Order" },
  { accessorKey: "email", header: "Customer" },
];

function TableFixture({
  onRowClick = vi.fn(),
}: {
  onRowClick?: (row: TransactionView) => void;
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
    <TransactionsTable
      table={table}
      columns={columns}
      isLoading={false}
      onRowClick={onRowClick}
      onResetFilters={vi.fn()}
    />
  );
}

describe("TransactionsTable", () => {
  it("renders provided rows", () => {
    render(<TableFixture />);

    expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
  });

  it("calls onRowClick when a row is activated", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<TableFixture onRowClick={onRowClick} />);

    await user.click(screen.getByText("ORD-1001"));

    expect(onRowClick).toHaveBeenCalledWith(mockRow);
  });
});
