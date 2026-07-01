"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const canPrevious = meta.page > 1;
  const canNext = meta.hasMore;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {pageCount}
        {meta.total > 0 ? ` · ${meta.total} total` : ""}
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canPrevious) {
                  onPageChange(meta.page - 1);
                }
              }}
              aria-disabled={!canPrevious}
              className={
                !canPrevious ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>
          <PaginationItem>
            <Button variant="outline" size="sm" disabled>
              {meta.page}
            </Button>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canNext) {
                  onPageChange(meta.page + 1);
                }
              }}
              aria-disabled={!canNext}
              className={!canNext ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
