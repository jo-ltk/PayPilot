"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Download } from "lucide-react";

import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import type { DateRange } from "@/types/common";

interface SettlementsToolbarProps {
  search: string;
  dateRange: DateRange;
  isRefreshing: boolean;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExport: () => void;
}

/** Toolbar for settlements search, date filter, and actions. */
export function SettlementsToolbar({
  search,
  dateRange,
  isRefreshing,
  onSearchChange,
  onDateRangeChange,
  onRefresh,
  onExport,
}: SettlementsToolbarProps) {
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
            placeholder="Search payout ID…"
            aria-label="Search settlements"
          />
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} />
          <Button type="button" variant="outline" size="sm" onClick={onExport}>
            <Download aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </DataTableToolbar>
    </motion.div>
  );
}
