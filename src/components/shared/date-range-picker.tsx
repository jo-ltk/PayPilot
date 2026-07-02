"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types/common";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
  /** "chip" mirrors the sidebar's icon-chip nav style; "default" is a plain outline trigger. */
  variant?: "default" | "chip";
  /** Icon-only circle trigger for compact mobile toolbars. */
  iconOnly?: boolean;
}

function formatRangeLabel(range: DateRange): string {
  if (range.from && range.to) {
    return `${format(range.from, "dd MMM yyyy")} – ${format(range.to, "dd MMM yyyy")}`;
  }
  if (range.from) {
    return format(range.from, "dd MMM yyyy");
  }
  return "Select dates";
}

/** Accessible date range picker built on shadcn Calendar + Popover. */
export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Select dates",
  variant = "default",
  iconOnly = false,
}: DateRangePickerProps) {
  const label = value.from || value.to ? formatRangeLabel(value) : placeholder;
  const isChip = variant === "chip";
  const hasRange = Boolean(value.from || value.to);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start font-normal sm:w-[260px]",
              !value.from && "text-muted-foreground",
              isChip &&
                iconOnly &&
                "size-10 w-10 min-w-10 justify-center rounded-full border-transparent p-0 shadow-none",
              isChip &&
                !iconOnly &&
                "retro-pill h-11 w-auto justify-start gap-2.5 border-transparent pl-1.5 pr-3",
              className,
            )}
          />
        }
      >
        {isChip ? (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-[var(--retro-blue)] text-[var(--retro-chart-strong)] shadow-[0_0_0_1px_var(--retro-ink)] transition-shadow",
              iconOnly ? "size-10" : "size-8 rounded-xl",
              hasRange &&
                iconOnly &&
                "shadow-[0_0_0_2px_var(--retro-chart-strong)]",
            )}
          >
            <CalendarIcon aria-hidden="true" className="size-4" />
          </span>
        ) : (
          <CalendarIcon aria-hidden="true" className="size-4" />
        )}
        {!(isChip && iconOnly) ? (
          <span
            className={cn(
              isChip &&
                "hidden font-retro text-sm font-medium text-foreground sm:inline",
            )}
          >
            {label}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: value.from, to: value.to }}
          onSelect={(range) =>
            onChange({ from: range?.from, to: range?.to })
          }
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
