"use client";

import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { ServerDataTablePagination } from "@/components/shared/server-data-table-pagination";
import { useRefundColumns } from "@/components/refunds/refund-columns";
import { RefundsTable } from "@/components/refunds/refunds-table";
import { RefundsToolbar } from "@/components/refunds/refunds-toolbar";
import { useListFilters } from "@/hooks/use-list-filters";
import { useRefunds } from "@/hooks/use-refunds";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import { useShopContext } from "@/hooks/use-shop-context";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import type { RefundView } from "@/schemas/payments.schema";

const RefundDetailSheet = dynamic(
  () =>
    import("@/components/refunds/refund-detail-sheet").then(
      (mod) => mod.RefundDetailSheet,
    ),
  { ssr: false },
);

function filterRefundRows(rows: RefundView[], search?: string): RefundView[] {
  const query = search?.trim().toLowerCase();
  if (!query) {
    return rows;
  }

  return rows.filter((row) =>
    [row.refundId, row.id, row.transactionId, row.shopifyRefundId]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

/** Shared refunds page wired to the refunds API. */
export function RefundsPage() {
  const queryClient = useQueryClient();
  const { shopId } = useShopContext();
  const {
    filters,
    apiParams,
    setSearch,
    setStatus,
    setDateRange,
    setPage,
    toggleSort,
    resetFilters,
  } = useListFilters({ sortBy: "processedAt" });
  const refunds = useRefunds(shopId, apiParams);
  const prefersReducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<RefundView | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const columns = useRefundColumns(
    { sortBy: filters.sortBy, sortOrder: filters.sortOrder },
    toggleSort,
  );

  const rows = useMemo(
    () => filterRefundRows(refunds.data?.data ?? [], apiParams.search),
    [apiParams.search, refunds.data?.data],
  );

  const meta = refunds.data?.meta ?? {
    page: filters.page,
    pageSize: filters.pageSize,
    total: 0,
    hasMore: false,
  };
  const pageCount = Math.max(Math.ceil(meta.total / meta.pageSize), 1);

  const table = useServerDataTable({
    data: rows,
    columns,
    pageIndex: meta.page,
    pageSize: meta.pageSize,
    pageCount,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    onPaginationChange: setPage,
  });

  const refresh = useCallback(() => {
    if (!shopId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: ["shop", shopId, "refunds"],
    });
  }, [queryClient, shopId]);

  const handleRowClick = useCallback((refund: RefundView) => {
    setSelected(refund);
    setSheetOpen(true);
  }, []);

  return (
    <div className="retro-dash -mx-4 -my-6 min-h-full space-y-8 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <header className="max-w-4xl space-y-3">
        <h1 className="font-retro text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
          Every refund, tracked and clear
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Monitor refund volume and processing status.
        </p>
      </header>

      <RefundsToolbar
        search={filters.search}
        status={filters.status}
        dateRange={filters.dateRange}
        isRefreshing={refunds.isFetching}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDateRangeChange={setDateRange}
        onRefresh={refresh}
      />

      {refunds.isError ? (
        <ErrorState
          message={refunds.error?.message ?? "Failed to load refunds"}
          onRetry={refresh}
        />
      ) : (
        <>
          <RefundsTable
            table={table}
            columns={columns}
            isLoading={refunds.isLoading || refunds.isFetching}
            onRowClick={handleRowClick}
            onResetFilters={resetFilters}
          />
          {rows.length > 0 ? (
            <motion.div
              variants={filterToolbarVariants}
              initial="hidden"
              animate="visible"
              transition={
                prefersReducedMotion ? reducedMotionTransition : undefined
              }
            >
              <ServerDataTablePagination
                meta={meta}
                onPageChange={setPage}
                className="retro-pagination px-3 sm:px-4"
              />
            </motion.div>
          ) : null}
        </>
      )}

      <RefundDetailSheet
        refund={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRefresh={refresh}
      />
    </div>
  );
}
