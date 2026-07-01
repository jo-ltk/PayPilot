"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Download } from "lucide-react";

import { DataTableColumnVisibility } from "@/components/shared/data-table-column-visibility";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { StatusFilter } from "@/components/shared/status-filter";
import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { PAYMENT_STATUS_OPTIONS } from "@/lib/payment-status";
import type { TransactionView } from "@/schemas/payments.schema";
import type { DateRange } from "@/types/common";

interface TransactionsToolbarProps {
  table: Table<TransactionView>;
  search: string;
  status: string | "all";
  dateRange: DateRange;
  isRefreshing: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | "all") => void;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExport: () => void;
}

/** Toolbar for transactions search, filters, and actions. */
export function TransactionsToolbar({
  table,
  search,
  status,
  dateRange,
  isRefreshing,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onRefresh,
  onExport,
}: TransactionsToolbarProps) {
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
            placeholder="Search ID, order, or email…"
            aria-label="Search transactions"
          />
          <StatusFilter
            value={status}
            onChange={onStatusChange}
            options={PAYMENT_STATUS_OPTIONS}
          />
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} />
          <Button type="button" variant="outline" size="sm" onClick={onExport}>
            <Download aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <DataTableColumnVisibility table={table} />
        </div>
      </DataTableToolbar>
    </motion.div>
  );
}
