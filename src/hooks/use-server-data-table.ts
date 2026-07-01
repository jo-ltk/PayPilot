"use client";

import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { SortOrder } from "@/types/common";

interface UseServerDataTableOptions<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  sortBy?: string;
  sortOrder: SortOrder;
  onPaginationChange: (pageIndex: number) => void;
}

/**
 * Creates a TanStack Table configured for server-side pagination and sorting.
 * @param options - Table data, pagination meta, and handlers
 * @returns Configured table instance
 */
export function useServerDataTable<TData, TValue>({
  data,
  columns,
  pageIndex,
  pageSize,
  pageCount,
  sortBy,
  sortOrder,
  onPaginationChange,
}: UseServerDataTableOptions<TData, TValue>): TanStackTable<TData> {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: Math.max(pageIndex - 1, 0), pageSize }),
    [pageIndex, pageSize],
  );

  const sorting = useMemo<SortingState>(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
    [sortBy, sortOrder],
  );

  const onPaginationChangeHandler: OnChangeFn<PaginationState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(pagination) : updater;
    onPaginationChange(next.pageIndex + 1);
  };

  return useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination, sorting, columnVisibility },
    onPaginationChange: onPaginationChangeHandler,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });
}
