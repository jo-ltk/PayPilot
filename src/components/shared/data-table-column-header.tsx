"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps {
  title: string;
  sorted?: false | "asc" | "desc";
  onSort?: () => void;
  className?: string;
}

/** Sortable column header button for data tables. */
export function DataTableColumnHeader({
  title,
  sorted = false,
  onSort,
  className,
}: DataTableColumnHeaderProps) {
  const SortIcon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  if (!onSort) {
    return <span className={className}>{title}</span>;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-8 font-medium", className)}
      onClick={onSort}
      aria-label={`Sort by ${title}`}
    >
      {title}
      <SortIcon aria-hidden="true" className="size-3.5" />
    </Button>
  );
}
