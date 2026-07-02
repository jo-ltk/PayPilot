"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { DateRangeTabs } from "@/components/analytics/date-range-tabs";
import { Button } from "@/components/ui/button";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types/common";

interface AnalyticsToolbarProps {
  dateRange: DateRange;
  isRefreshing: boolean;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  onExportAll: () => void;
}

interface MobileActionProps {
  label: string;
  chipClassName: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

function MobileAction({
  label,
  chipClassName,
  onClick,
  disabled,
  ariaLabel,
  children,
}: MobileActionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      onClick={onClick}
      className="retro-pill flex h-auto w-full flex-col gap-1.5 border-transparent py-2.5"
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl text-[var(--retro-chart-strong)]",
          chipClassName,
        )}
      >
        {children}
      </span>
      <span className="text-[0.65rem] font-semibold tracking-wide text-foreground/70 uppercase">
        {label}
      </span>
    </Button>
  );
}

/** Analytics toolbar with date presets, refresh, and CSV export. */
export function AnalyticsToolbar({
  dateRange,
  isRefreshing,
  onDateRangeChange,
  onRefresh,
  onExportAll,
}: AnalyticsToolbarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={filterToolbarVariants}
      initial="hidden"
      animate="visible"
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
      className="retro-panel px-3 py-3 sm:px-4"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:hidden">
        <DateRangeTabs value={dateRange} onChange={onDateRangeChange} />
        <div className="grid w-full grid-cols-2 gap-2">
          <MobileAction
            label="Refresh"
            chipClassName="bg-[var(--retro-mint)]"
            ariaLabel="Refresh analytics data"
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw
              aria-hidden="true"
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
          </MobileAction>
          <MobileAction
            label="Export"
            chipClassName="bg-[var(--retro-pink)]"
            ariaLabel="Export all analytics as CSV"
            onClick={onExportAll}
          >
            <Download aria-hidden="true" className="size-4" />
          </MobileAction>
        </div>
      </div>

      <div className="retro-desktop-toolbar hidden flex-wrap items-center gap-2 sm:flex">
        <DateRangeTabs value={dateRange} onChange={onDateRangeChange} />
        <Button
          type="button"
          variant="outline"
          className="retro-pill h-11 gap-2.5 border-transparent pl-1.5 pr-3"
          aria-label="Refresh analytics data"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--retro-mint)] text-[var(--retro-chart-strong)]">
            <RefreshCw
              aria-hidden="true"
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
          </span>
          <span className="font-retro text-sm font-medium text-foreground">
            Refresh
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="retro-pill h-11 gap-2.5 border-transparent pl-1.5 pr-3"
          aria-label="Export all analytics as CSV"
          onClick={onExportAll}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--retro-pink)] text-[var(--retro-chart-strong)]">
            <Download aria-hidden="true" className="size-4" />
          </span>
          <span className="font-retro text-sm font-medium text-foreground">
            Export CSV
          </span>
        </Button>
      </div>
    </motion.div>
  );
}
