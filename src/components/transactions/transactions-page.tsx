"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { ServerDataTablePagination } from "@/components/shared/server-data-table-pagination";
import { TransactionDetailSheet } from "@/components/transactions/transaction-detail-sheet";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionsToolbar } from "@/components/transactions/transactions-toolbar";
import { useTransactionColumns } from "@/components/transactions/transaction-columns";
import { useListFilters } from "@/hooks/use-list-filters";
import { usePayments } from "@/hooks/use-payments";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import { useShopContext } from "@/hooks/use-shop-context";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { buildCsv, downloadCsv } from "@/lib/export-csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatStatusLabel } from "@/lib/payment-status";
import type { TransactionView } from "@/schemas/payments.schema";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

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
  const prefersReducedMotion = useReducedMotion();
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
    <div className="retro-dash -mx-4 -my-6 min-h-full space-y-8 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <header className="max-w-4xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {getGreeting()}
        </p>
        <h1 className="font-retro text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
          Every payment, tracked and searchable
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Search and review payment activity across your store.
        </p>
      </header>

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

      <TransactionDetailSheet
        transaction={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={mode}
        shopId={shopId}
        onRefresh={refresh}
      />
    </div>
  );
}
