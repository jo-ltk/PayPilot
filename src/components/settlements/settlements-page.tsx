"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition } from "@/components/shared/page-transition";
import { ServerDataTablePagination } from "@/components/shared/server-data-table-pagination";
import { SettlementDetailSheet } from "@/components/settlements/settlement-detail-sheet";
import { useSettlementColumns } from "@/components/settlements/settlement-columns";
import { SettlementsTable } from "@/components/settlements/settlements-table";
import { SettlementsToolbar } from "@/components/settlements/settlements-toolbar";
import { useListFilters } from "@/hooks/use-list-filters";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import { useSettlements } from "@/hooks/use-settlements";
import { useShopContext } from "@/hooks/use-shop-context";
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
    <PageTransition className="space-y-6">
      <PageHeader
        title="Settlements"
        description="Track payout batches and settlement status."
      />

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
            <ServerDataTablePagination meta={meta} onPageChange={setPage} />
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
    </PageTransition>
  );
}
