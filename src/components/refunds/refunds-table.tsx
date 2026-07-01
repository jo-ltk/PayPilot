"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

import { DataTableEmpty } from "@/components/shared/data-table-empty";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ServerDataTable } from "@/components/shared/server-data-table";
import type { RefundView } from "@/schemas/payments.schema";

interface RefundsTableProps {
  table: Table<RefundView>;
  columns: ColumnDef<RefundView>[];
  isLoading: boolean;
  onRowClick: (refund: RefundView) => void;
  onResetFilters: () => void;
}

/** Refunds data table with loading and empty states. */
export function RefundsTable({
  table,
  columns,
  isLoading,
  onRowClick,
  onResetFilters,
}: RefundsTableProps) {
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
          title="No refunds yet"
          description="Refunds will appear here once processed by the gateway."
          actionLabel="Clear filters"
          onAction={onResetFilters}
        />
      }
    />
  );
}
