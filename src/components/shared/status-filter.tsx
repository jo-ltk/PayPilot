"use client";

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
}

/** Reusable status dropdown filter for data tables. */
export function StatusFilter<T extends string = string>({
  value,
  onChange,
  options,
  label = "Status",
  className,
}: StatusFilterProps<T>) {
  const selectValue = value === "all" ? "all" : value;

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
        <SelectTrigger id="status-filter" className="w-full sm:w-40">
          <SelectValue placeholder={label} />
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
