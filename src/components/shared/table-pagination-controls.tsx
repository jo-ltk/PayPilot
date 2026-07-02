"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPaginationRange } from "@/lib/pagination-range";
import { cn } from "@/lib/utils";

interface TablePaginationControlsProps {
  currentPage: number;
  pageCount: number;
  total?: number;
  canPrevious: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

function PaginationPageButtons({
  currentPage,
  pageCount,
  siblingCount,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  siblingCount: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getPaginationRange(currentPage, pageCount, siblingCount);

  return pages.map((page, index) => {
    if (page === "ellipsis") {
      return (
        <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    return (
      <PaginationItem key={page} className="hidden sm:block">
        <PaginationLink
          href="#"
          isActive={page === currentPage}
          onClick={(event) => {
            event.preventDefault();
            if (page !== currentPage) {
              onPageChange(page);
            }
          }}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    );
  });
}

/** Shared prev/next pagination with page links (desktop) and page picker (mobile). */
export function TablePaginationControls({
  currentPage,
  pageCount,
  total,
  canPrevious,
  canNext,
  onPageChange,
  className,
}: TablePaginationControlsProps) {
  const pageOptions = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {pageCount}
        {total !== undefined && total > 0 ? ` · ${total} total` : ""}
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canPrevious) {
                  onPageChange(currentPage - 1);
                }
              }}
              aria-disabled={!canPrevious}
              className={
                !canPrevious ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>

          <PaginationItem className="sm:hidden">
            <Select
              value={String(currentPage)}
              onValueChange={(value) => {
                if (value) {
                  onPageChange(Number(value));
                }
              }}
            >
              <SelectTrigger size="sm" aria-label="Go to page">
                <SelectValue>{currentPage}</SelectValue>
              </SelectTrigger>
              <SelectContent align="center">
                {pageOptions.map((page) => (
                  <SelectItem key={page} value={String(page)}>
                    Page {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PaginationItem>

          <PaginationPageButtons
            currentPage={currentPage}
            pageCount={pageCount}
            siblingCount={1}
            onPageChange={onPageChange}
          />

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canNext) {
                  onPageChange(currentPage + 1);
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
