"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { ServerDataTablePagination } from "@/components/shared/server-data-table-pagination";
import { SettlementDetailSheet } from "@/components/settlements/settlement-detail-sheet";
import { useSettlementColumns } from "@/components/settlements/settlement-columns";
import { SettlementsTable } from "@/components/settlements/settlements-table";
import { SettlementsToolbar } from "@/components/settlements/settlements-toolbar";
import { useListFilters } from "@/hooks/use-list-filters";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import { useSettlements } from "@/hooks/use-settlements";
import { useShopContext } from "@/hooks/use-shop-context";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { buildCsv, downloadCsv } from "@/lib/export-csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatStatusLabel } from "@/lib/payment-status";
import type { SettlementView } from "@/schemas/payments.schema";

function filterSettlementRows(
  rows: SettlementView[],
  search?: string,
): SettlementView[] {
  const query = search?.trim().toLowerCase();
  if (!query) {
    return rows;
  }

  return rows.filter((row) =>
    [row.payoutId, row.id, row.utrNumber, row.bankAccountLast4]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

/** Shared settlements page wired to the settlements API. */
export function SettlementsPage() {
  const queryClient = useQueryClient();
  const { shopId, mode } = useShopContext();
  const {
    filters,
    apiParams,
    setSearch,
    setDateRange,
    setPage,
    toggleSort,
    resetFilters,
  } = useListFilters({ sortBy: "payoutDate" });
  const settlements = useSettlements(shopId, apiParams);
  const prefersReducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<SettlementView | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const columns = useSettlementColumns(
    { sortBy: filters.sortBy, sortOrder: filters.sortOrder },
    toggleSort,
  );

  const rows = useMemo(
    () => filterSettlementRows(settlements.data?.data ?? [], apiParams.search),
    [apiParams.search, settlements.data?.data],
  );
  const meta = settlements.data?.meta ?? {
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
      queryKey: ["shop", shopId, "settlements"],
    });
  }, [queryClient, shopId]);

  const handleExport = useCallback(() => {
    if (!rows.length) {
      toast.info("No settlements to export");
      return;
    }

    const csv = buildCsv(rows, [
      { header: "Settlement ID", value: (row) => row.payoutId },
      { header: "Payout Date", value: (row) => formatDate(row.payoutDate) },
      {
        header: "Gross Amount",
        value: (row) => formatCurrency(row.totalAmountPaise),
      },
      { header: "Fees", value: () => "" },
      { header: "GST", value: () => "" },
      {
        header: "Net Amount",
        value: (row) => formatCurrency(row.totalAmountPaise),
      },
      { header: "Status", value: (row) => formatStatusLabel(row.status) },
    ]);

    downloadCsv(`settlements-${shopId ?? "export"}.csv`, csv);
    toast.success("Settlements exported");
  }, [rows, shopId]);

  const handleRowClick = useCallback((settlement: SettlementView) => {
    setSelected(settlement);
    setSheetOpen(true);
  }, []);

  return (
    <div className="retro-dash -mx-4 -my-6 min-h-full space-y-8 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <header className="max-w-4xl space-y-3">
        <h1 className="font-retro text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
          Every payout, tracked and clear
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Track payout batches and settlement status.
        </p>
      </header>

      <SettlementsToolbar
        search={filters.search}
        dateRange={filters.dateRange}
        isRefreshing={settlements.isFetching}
        onSearchChange={setSearch}
        onDateRangeChange={setDateRange}
        onRefresh={refresh}
        onExport={handleExport}
      />

      {settlements.isError ? (
        <ErrorState
          message={settlements.error?.message ?? "Failed to load settlements"}
          onRetry={refresh}
        />
      ) : (
        <>
          <SettlementsTable
            table={table}
            columns={columns}
            isLoading={settlements.isLoading || settlements.isFetching}
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

      <SettlementDetailSheet
        settlement={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={mode}
        shopId={shopId}
        onRefresh={refresh}
      />
    </div>
  );
}
