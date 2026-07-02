"use client";

import type { Table } from "@tanstack/react-table";
import { motion, useReducedMotion } from "framer-motion";

import { DataTableEmpty } from "@/components/shared/data-table-empty";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ServerDataTable } from "@/components/shared/server-data-table";
import { reducedMotionTransition, tableBodyVariants } from "@/lib/animations";
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
            title="No transactions yet"
            description="Payments will appear here once your gateway starts sending data."
            actionLabel="Clear filters"
            onAction={onResetFilters}
            className="border-0 px-4 py-12"
          />
        }
      />
    </motion.div>
  );
}
