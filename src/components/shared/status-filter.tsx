"use client";

import { ListFilter } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/common";

interface StatusFilterProps<T extends string = string> {
  value: T | "all";
  onChange: (value: T | "all") => void;
  options: SelectOption<T>[];
  label?: string;
  className?: string;
  variant?: "default" | "icon";
  triggerClassName?: string;
}

/** Reusable status dropdown filter for data tables. */
export function StatusFilter<T extends string = string>({
  value,
  onChange,
  options,
  label = "Status",
  className,
  variant = "default",
  triggerClassName,
}: StatusFilterProps<T>) {
  const selectValue = value === "all" ? "all" : value;
  const isIcon = variant === "icon";
  const isActive = value !== "all";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor="status-filter" className="sr-only">
        {label}
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) => {
          if (!next) {
            return;
          }
          onChange(next === "all" ? "all" : (next as T));
        }}
      >
        <SelectTrigger
          id="status-filter"
          className={cn(
            "w-full sm:w-40",
            isIcon &&
              "size-10 w-10 min-w-10 justify-center gap-0 rounded-full border-transparent bg-transparent p-0 shadow-none [&>svg:last-child]:hidden",
            triggerClassName,
          )}
        >
          {isIcon ? (
            <>
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full bg-[var(--retro-yellow)] text-[var(--retro-chart-strong)] shadow-[0_0_0_1px_var(--retro-ink)] transition-shadow",
                  isActive &&
                    "shadow-[0_0_0_2px_var(--retro-chart-strong)]",
                )}
              >
                <ListFilter aria-hidden="true" className="size-4" />
              </span>
              <SelectValue className="sr-only" />
            </>
          ) : (
            <SelectValue placeholder={label} />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
