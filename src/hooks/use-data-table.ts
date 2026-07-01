"use client";

import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type Table as TanStackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

interface UseDataTableOptions<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageSize?: number;
}

/**
 * Creates a TanStack Table instance with pagination and column visibility.
 * @param options - Table data, columns, and page size
 * @returns Configured table instance
 */
export function useDataTable<TData, TValue>({
  data,
  columns,
  pageSize = 10,
}: UseDataTableOptions<TData, TValue>): TanStackTable<TData> {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  return useReactTable({
    data,
    columns,
    state: { pagination, columnVisibility },
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}
