"use client";

import type { Table } from "@tanstack/react-table";

import { DataTableEmpty } from "@/components/shared/data-table-empty";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ServerDataTable } from "@/components/shared/server-data-table";
import type { TransactionView } from "@/schemas/payments.schema";
import type { ColumnDef } from "@tanstack/react-table";

interface TransactionsTableProps {
  table: Table<TransactionView>;
  columns: ColumnDef<TransactionView>[];
  isLoading: boolean;
  onRowClick: (transaction: TransactionView) => void;
  onResetFilters: () => void;
}

/** Transactions data table with loading and empty states. */
export function TransactionsTable({
  table,
  columns,
  isLoading,
  onRowClick,
  onResetFilters,
}: TransactionsTableProps) {
  if (isLoading && table.getRowModel().rows.length === 0) {
    return <LoadingSkeleton variant="table" rows={10} />;
  }

  return (
    <ServerDataTable
      table={table}
      columns={columns}
      isLoading={isLoading}
      onRowClick={onRowClick}
      emptyState={
        <DataTableEmpty
          title="No transactions yet"
          description="Payments will appear here once your gateway starts sending data."
          actionLabel="Clear filters"
          onAction={onResetFilters}
        />
      }
    />
  );
}
