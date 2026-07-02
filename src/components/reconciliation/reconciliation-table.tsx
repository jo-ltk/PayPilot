"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { DataTableEmpty } from "@/components/shared/data-table-empty";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ServerDataTable } from "@/components/shared/server-data-table";
import { reducedMotionTransition, tableBodyVariants } from "@/lib/animations";
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
  const prefersReducedMotion = useReducedMotion();

  if (isLoading && table.getRowModel().rows.length === 0) {
    return (
      <LoadingSkeleton
        variant="table"
        rows={10}
        className="retro-panel retro-table-skeleton p-4 sm:p-5"
      />
    );
  }

  return (
    <motion.div
      variants={tableBodyVariants}
      initial="hidden"
      animate="visible"
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
      className="retro-panel overflow-hidden"
    >
      <ServerDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        onRowClick={onRowClick}
        className="retro-data-table max-h-[calc(100vh-22rem)] overflow-auto rounded-none border-0"
        emptyState={
          <DataTableEmpty
            icon={CheckCircle2}
            title="All clear — everything is reconciled"
            description="No mismatches match your current filters."
            actionLabel="Clear filters"
            onAction={onResetFilters}
            className="border-0 px-4 py-12"
          />
        }
      />
    </motion.div>
  );
}
