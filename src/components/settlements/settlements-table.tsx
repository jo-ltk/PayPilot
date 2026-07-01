"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

import { DataTableEmpty } from "@/components/shared/data-table-empty";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ServerDataTable } from "@/components/shared/server-data-table";
import type { SettlementView } from "@/schemas/payments.schema";

interface SettlementsTableProps {
  table: Table<SettlementView>;
  columns: ColumnDef<SettlementView>[];
  isLoading: boolean;
  onRowClick: (settlement: SettlementView) => void;
  onResetFilters: () => void;
}

/** Settlements data table with loading and empty states. */
export function SettlementsTable({
  table,
  columns,
  isLoading,
  onRowClick,
  onResetFilters,
}: SettlementsTableProps) {
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
          title="No settlements yet"
          description="Payout batches will appear here once settlements are processed."
          actionLabel="Clear filters"
          onAction={onResetFilters}
        />
      }
    />
  );
}
