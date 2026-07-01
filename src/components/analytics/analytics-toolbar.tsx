"use client";

import { FileSpreadsheet, RefreshCw } from "lucide-react";

import { DateRangeTabs } from "@/components/analytics/date-range-tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types/common";

interface AnalyticsToolbarProps {
  dateRange: DateRange;
  isRefreshing: boolean;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExportAll: () => void;
}

/** Analytics toolbar with date presets, refresh, and CSV export. */
export function AnalyticsToolbar({
  dateRange,
  isRefreshing,
  onDateRangeChange,
  onRefresh,
  onExportAll,
}: AnalyticsToolbarProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border/80 bg-card p-4">
      <DateRangeTabs value={dateRange} onChange={onDateRangeChange} />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Refresh analytics data"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          <RefreshCw
            aria-hidden="true"
            className={cn("size-4", isRefreshing && "animate-spin")}
          />
          Refresh
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Export all analytics as CSV"
          onClick={onExportAll}
        >
          <FileSpreadsheet aria-hidden="true" className="size-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
