"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";

import { DataTableEmpty } from "@/components/shared/data-table-empty";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ServerDataTable } from "@/components/shared/server-data-table";
import type { ReconciliationView } from "@/schemas/payments.schema";

interface ReconciliationTableProps {
  table: Table<ReconciliationView>;
  columns: ColumnDef<ReconciliationView>[];
  isLoading: boolean;
  onRowClick: (record: ReconciliationView) => void;
  onResetFilters: () => void;
}

/** Reconciliation data table with loading and empty states. */
export function ReconciliationTable({
  table,
  columns,
  isLoading,
  onRowClick,
  onResetFilters,
}: ReconciliationTableProps) {
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
          icon={CheckCircle2}
          title="All clear — everything is reconciled"
          description="No mismatches match your current filters."
          actionLabel="Clear filters"
          onAction={onResetFilters}
        />
      }
    />
  );
}
