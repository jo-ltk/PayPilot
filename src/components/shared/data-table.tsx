"use client";

import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  emptyState?: ReactNode;
  className?: string;
  stickyHeader?: boolean;
  onRowClick?: (row: TData) => void;
}

/** Reusable TanStack Table wrapper with shadcn table primitives. */
export function DataTable<TData, TValue>({
  table,
  columns,
  emptyState,
  className,
  stickyHeader = false,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border",
        stickyHeader && "max-h-[min(70vh,48rem)] overflow-auto",
        className,
      )}
    >
      <Table>
        <TableHeader
          className={cn(stickyHeader && "sticky top-0 z-10 bg-background")}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
                data-state={row.getIsSelected() && "selected"}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row.original);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
