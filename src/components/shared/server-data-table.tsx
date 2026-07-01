"use client";

import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reducedMotionTransition, tableBodyVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ServerDataTableProps<TData, TValue> {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  emptyState?: ReactNode;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  className?: string;
}

/** Server-driven data table with sticky header, hover, and row click. */
export function ServerDataTable<TData, TValue>({
  table,
  columns,
  emptyState,
  onRowClick,
  isLoading = false,
  className,
}: ServerDataTableProps<TData, TValue>) {
  const prefersReducedMotion = useReducedMotion();
  const rows = table.getRowModel().rows;

  if (!isLoading && rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <motion.div
      className={cn(
        "max-h-[calc(100vh-18rem)] overflow-auto rounded-xl border border-border",
        className,
      )}
      variants={tableBodyVariants}
      initial="hidden"
      animate="visible"
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                tabIndex={onRowClick ? 0 : undefined}
                className={cn(onRowClick && "cursor-pointer focus-visible:outline-none")}
                onClick={() => onRowClick?.(row.original)}
                onKeyDown={(event) => {
                  if (!onRowClick) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(row.original);
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {isLoading ? "Loading…" : "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
}
