"use client";

import { motion, useReducedMotion } from "framer-motion";

import { DataTableColumnVisibility } from "@/components/shared/data-table-column-visibility";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { StatusFilter } from "@/components/shared/status-filter";
import type { Table } from "@tanstack/react-table";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { RECONCILIATION_STATUS_OPTIONS } from "@/lib/reconciliation-status";
import type { ReconciliationView } from "@/schemas/payments.schema";
import type { DateRange } from "@/types/common";

interface ReconciliationToolbarProps {
  table: Table<ReconciliationView>;
  search: string;
  status: string | "all";
  dateRange: DateRange;
  isRefreshing: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | "all") => void;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
}

/** Toolbar for reconciliation search, filters, and column visibility. */
export function ReconciliationToolbar({
  table,
  search,
  status,
  dateRange,
  isRefreshing,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onRefresh,
}: ReconciliationToolbarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={filterToolbarVariants}
      initial="hidden"
      animate="visible"
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
    >
      <DataTableToolbar>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search order, transaction, or ID…"
            aria-label="Search reconciliation records"
          />
          <StatusFilter
            value={status}
            onChange={onStatusChange}
            options={RECONCILIATION_STATUS_OPTIONS}
          />
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} />
          <DataTableColumnVisibility table={table} />
        </div>
      </DataTableToolbar>
    </motion.div>
  );
}
