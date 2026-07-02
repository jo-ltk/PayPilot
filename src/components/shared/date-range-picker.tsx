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
}: DateRangePickerProps) {
  const label = value.from || value.to ? formatRangeLabel(value) : placeholder;
  const isChip = variant === "chip";

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
                "retro-pill size-10 justify-center border-transparent p-0 sm:h-11 sm:w-auto sm:justify-start sm:gap-2.5 sm:pl-1.5 sm:pr-3",
              className,
            )}
          />
        }
      >
        {isChip ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--retro-blue)] text-[var(--retro-chart-strong)]">
            <CalendarIcon aria-hidden="true" className="size-4" />
          </span>
        ) : (
          <CalendarIcon aria-hidden="true" className="size-4" />
        )}
        <span
          className={cn(
            isChip && "hidden font-retro text-sm font-medium text-foreground sm:inline",
          )}
        >
          {label}
        </span>
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
