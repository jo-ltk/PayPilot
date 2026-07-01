"use client";

import { motion, useReducedMotion } from "framer-motion";

import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { StatusFilter } from "@/components/shared/status-filter";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { REFUND_STATUS_OPTIONS } from "@/lib/reconciliation-status";
import type { DateRange } from "@/types/common";

interface RefundsToolbarProps {
  search: string;
  status: string | "all";
  dateRange: DateRange;
  isRefreshing: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | "all") => void;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
}

/** Toolbar for refunds search, filters, and refresh. */
export function RefundsToolbar({
  search,
  status,
  dateRange,
  isRefreshing,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onRefresh,
}: RefundsToolbarProps) {
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
            placeholder="Search refund or transaction ID…"
            aria-label="Search refunds"
          />
          <StatusFilter
            value={status}
            onChange={onStatusChange}
            options={REFUND_STATUS_OPTIONS}
          />
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
        <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} />
      </DataTableToolbar>
    </motion.div>
  );
}
