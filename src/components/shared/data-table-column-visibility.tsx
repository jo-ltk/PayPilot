"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnVisibilityProps<TData> {
  table: Table<TData>;
  className?: string;
  showLabel?: boolean;
  mobileLabel?: string;
}

/** Dropdown to toggle visible table columns. */
export function DataTableColumnVisibility<TData>({
  table,
  className,
  showLabel = true,
  mobileLabel,
}: DataTableColumnVisibilityProps<TData>) {
  const isCompact = !showLabel && mobileLabel;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("ml-auto", className)}
            aria-label="Toggle columns"
          />
        }
      >
        {isCompact ? (
          <>
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--retro-blue)] text-[var(--retro-chart-strong)]">
              <Settings2 aria-hidden="true" className="size-4" />
            </span>
            <span className="text-[0.65rem] font-semibold tracking-wide text-foreground/70 uppercase">
              {mobileLabel}
            </span>
          </>
        ) : (
          <>
            <Settings2 aria-hidden="true" className="size-4" />
            {showLabel ? "Columns" : null}
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {(column.columnDef.meta as { label?: string } | undefined)?.label ??
                column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
