"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { DateRangePicker } from "@/components/shared/date-range-picker";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";
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
      className="retro-panel px-3 py-3 sm:px-4"
    >
      <div className="flex flex-col gap-2.5 sm:hidden">
        <div className="retro-mobile-filter-row flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search…"
            aria-label="Search settlements"
            className="retro-search min-w-0 flex-1 max-w-none"
          />
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            variant="chip"
            iconOnly
            className="shrink-0"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MobileAction
            label="Refresh"
            chipClassName="bg-[var(--retro-mint)]"
            ariaLabel="Refresh settlements"
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
            onClick={onExport}
          >
            <Download aria-hidden="true" className="size-4" />
          </MobileAction>
        </div>
      </div>

      <div className="retro-desktop-toolbar hidden flex-wrap items-center gap-2 sm:flex">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search payout ID…"
          aria-label="Search settlements"
          className="retro-search w-56 min-w-0 lg:w-64"
          inputClassName="h-11"
        />
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          variant="chip"
          className="h-11 shrink-0"
        />
        <Button
          type="button"
          variant="outline"
          className="retro-pill h-11 gap-2.5 border-transparent pl-1.5 pr-3"
          aria-label="Refresh settlements"
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
          onClick={onExport}
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
