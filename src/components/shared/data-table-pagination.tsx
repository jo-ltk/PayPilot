"use client";

import type { Table } from "@tanstack/react-table";

import { TablePaginationControls } from "@/components/shared/table-pagination-controls";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  className?: string;
}

/** Client-side pagination controls for a TanStack Table instance. */
export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = Math.max(table.getPageCount(), 1);

  return (
    <TablePaginationControls
      currentPage={pageIndex + 1}
      pageCount={pageCount}
      canPrevious={table.getCanPreviousPage()}
      canNext={table.getCanNextPage()}
      onPageChange={(page) => table.setPageIndex(page - 1)}
      className={className}
    />
  );
}
