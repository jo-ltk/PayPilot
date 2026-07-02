"use client";

import { TablePaginationControls } from "@/components/shared/table-pagination-controls";
import type { PaginationMeta } from "@/lib/api/response";
import { cn } from "@/lib/utils";

interface ServerDataTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Server-side pagination controls driven by API metadata. */
export function ServerDataTablePagination({
  meta,
  onPageChange,
  className,
}: ServerDataTablePaginationProps) {
  const pageCount = Math.max(Math.ceil(meta.total / meta.pageSize), 1);

  return (
    <TablePaginationControls
      currentPage={meta.page}
      pageCount={pageCount}
      total={meta.total}
      canPrevious={meta.page > 1}
      canNext={meta.hasMore}
      onPageChange={onPageChange}
      className={className}
    />
  );
}
