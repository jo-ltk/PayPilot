"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition } from "@/components/shared/page-transition";
import { ServerDataTablePagination } from "@/components/shared/server-data-table-pagination";
import { TransactionDetailSheet } from "@/components/transactions/transaction-detail-sheet";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionsToolbar } from "@/components/transactions/transactions-toolbar";
import { useTransactionColumns } from "@/components/transactions/transaction-columns";
import { useListFilters } from "@/hooks/use-list-filters";
import { usePayments } from "@/hooks/use-payments";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import { useShopContext } from "@/hooks/use-shop-context";
import { buildCsv, downloadCsv } from "@/lib/export-csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatStatusLabel } from "@/lib/payment-status";
import type { TransactionView } from "@/schemas/payments.schema";

/** Shared transactions page wired to the payments API. */
export function TransactionsPage() {
  const queryClient = useQueryClient();
  const { shopId, mode } = useShopContext();
  const {
    filters,
    apiParams,
    setSearch,
    setStatus,
    setDateRange,
    setPage,
    toggleSort,
    resetFilters,
  } = useListFilters({ sortBy: "occurredAt" });
  const payments = usePayments(shopId, apiParams);
  const [selected, setSelected] = useState<TransactionView | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const columns = useTransactionColumns(
    { sortBy: filters.sortBy, sortOrder: filters.sortOrder },
    toggleSort,
  );

  const rows = payments.data?.data ?? [];
  const meta = payments.data?.meta ?? {
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
      queryKey: ["shop", shopId, "payments"],
    });
  }, [queryClient, shopId]);

  const handleExport = useCallback(() => {
    if (!rows.length) {
      toast.info("No transactions to export");
      return;
    }

    const csv = buildCsv(rows, [
      { header: "Transaction ID", value: (row) => row.id },
      { header: "Order", value: (row) => row.txnid ?? row.matchedOrderId },
      {
        header: "Gateway Reference",
        value: (row) => row.easebuzzPaymentId ?? row.easebuzzTxnId,
      },
      { header: "Customer", value: (row) => row.email ?? row.phone },
      {
        header: "Amount",
        value: (row) => formatCurrency(row.amountPaise, row.currency),
      },
      { header: "Status", value: (row) => formatStatusLabel(row.status) },
      {
        header: "Created At",
        value: (row) => formatDate(row.occurredAt, "yyyy-MM-dd HH:mm:ss"),
      },
    ]);

    downloadCsv(`transactions-${shopId ?? "export"}.csv`, csv);
    toast.success("Transactions exported");
  }, [rows, shopId]);

  const handleRowClick = useCallback((transaction: TransactionView) => {
    setSelected(transaction);
    setSheetOpen(true);
  }, []);

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Search and review payment activity."
      />

      <TransactionsToolbar
        table={table}
        search={filters.search}
        status={filters.status}
        dateRange={filters.dateRange}
        isRefreshing={payments.isFetching}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDateRangeChange={setDateRange}
        onRefresh={refresh}
        onExport={handleExport}
      />

      {payments.isError ? (
        <ErrorState
          message={payments.error?.message ?? "Failed to load transactions"}
          onRetry={refresh}
        />
      ) : (
        <>
          <TransactionsTable
            table={table}
            columns={columns}
            isLoading={payments.isLoading || payments.isFetching}
            onRowClick={handleRowClick}
            onResetFilters={resetFilters}
          />
          {rows.length > 0 ? (
            <ServerDataTablePagination meta={meta} onPageChange={setPage} />
          ) : null}
        </>
      )}

      <TransactionDetailSheet
        transaction={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={mode}
        shopId={shopId}
        onRefresh={refresh}
      />
    </PageTransition>
  );
}
