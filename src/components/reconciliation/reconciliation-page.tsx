"use client";

import { Role } from "@prisma/client";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition } from "@/components/shared/page-transition";
import { ServerDataTablePagination } from "@/components/shared/server-data-table-pagination";
import { ReconciliationTable } from "@/components/reconciliation/reconciliation-table";
import { ReconciliationToolbar } from "@/components/reconciliation/reconciliation-toolbar";
import { useReconciliationColumns } from "@/components/reconciliation/reconciliation-columns";
import { useListFilters } from "@/hooks/use-list-filters";
import { useReconciliation } from "@/hooks/use-reconciliation";
import { useResolveReconciliation } from "@/hooks/use-resolve-reconciliation";
import { useServerDataTable } from "@/hooks/use-server-data-table";
import { useShopContext } from "@/hooks/use-shop-context";
import { filterReconciliationRows } from "@/lib/filter-reconciliation-rows";
import { toApiDateRange } from "@/lib/dashboard";
import { hasRole } from "@/lib/auth/rbac";
import type { ReconciliationView } from "@/schemas/payments.schema";

const ReconciliationDetailSheet = dynamic(
  () =>
    import("@/components/reconciliation/reconciliation-detail-sheet").then(
      (mod) => mod.ReconciliationDetailSheet,
    ),
  { ssr: false },
);

const ResolveDialog = dynamic(
  () =>
    import("@/components/reconciliation/resolve-dialog").then(
      (mod) => mod.ResolveDialog,
    ),
  { ssr: false },
);

/** Shared reconciliation page wired to the reconciliation API. */
export function ReconciliationPage() {
  const queryClient = useQueryClient();
  const { shopId, role } = useShopContext();
  const {
    filters,
    apiParams,
    setSearch,
    setStatus,
    setDateRange,
    setPage,
    toggleSort,
    resetFilters,
  } = useListFilters({ sortBy: "createdAt" });
  const reconciliation = useReconciliation(shopId, apiParams);
  const resolveMutation = useResolveReconciliation(shopId);
  const [selected, setSelected] = useState<ReconciliationView | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<ReconciliationView | null>(
    null,
  );
  const [resolveOpen, setResolveOpen] = useState(false);

  const canResolve = role != null && hasRole(role, Role.ADMIN);
  const dates = toApiDateRange(filters.dateRange);

  const handleViewDetails = useCallback((record: ReconciliationView) => {
    setSelected(record);
    setSheetOpen(true);
  }, []);

  const handleResolve = useCallback((record: ReconciliationView) => {
    setResolveTarget(record);
    setResolveOpen(true);
  }, []);

  const columns = useReconciliationColumns(
    { sortBy: filters.sortBy, sortOrder: filters.sortOrder },
    {
      onSort: toggleSort,
      onViewDetails: handleViewDetails,
      onResolve: handleResolve,
      canResolve,
    },
  );

  const rows = useMemo(
    () =>
      filterReconciliationRows(
        reconciliation.data?.data ?? [],
        apiParams.search,
        dates.from,
        dates.to,
      ),
    [apiParams.search, dates.from, dates.to, reconciliation.data?.data],
  );

  const meta = reconciliation.data?.meta ?? {
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
      queryKey: ["shop", shopId, "reconciliation"],
    });
  }, [queryClient, shopId]);

  const handleConfirmResolve = useCallback(
    async (recordId: string) => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      await resolveMutation.mutateAsync({
        recordId,
        shopId,
        listParams: apiParams,
      });
    },
    [apiParams, resolveMutation, shopId],
  );

  const handleRowClick = useCallback((record: ReconciliationView) => {
    setSelected(record);
    setSheetOpen(true);
  }, []);

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Reconciliation"
        description="Review mismatches and resolve payment gaps."
      />

      <ReconciliationToolbar
        table={table}
        search={filters.search}
        status={filters.status}
        dateRange={filters.dateRange}
        isRefreshing={reconciliation.isFetching}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDateRangeChange={setDateRange}
        onRefresh={refresh}
      />

      {reconciliation.isError ? (
        <ErrorState
          message={
            reconciliation.error?.message ??
            "Failed to load reconciliation records"
          }
          onRetry={refresh}
        />
      ) : (
        <>
          <ReconciliationTable
            table={table}
            columns={columns}
            isLoading={reconciliation.isLoading || reconciliation.isFetching}
            onRowClick={handleRowClick}
            onResetFilters={resetFilters}
          />
          {rows.length > 0 ? (
            <ServerDataTablePagination meta={meta} onPageChange={setPage} />
          ) : null}
        </>
      )}

      <ReconciliationDetailSheet
        record={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        role={role}
        onRefresh={refresh}
        onResolve={handleResolve}
      />

      <ResolveDialog
        record={resolveTarget}
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        isPending={resolveMutation.isPending}
        onConfirm={handleConfirmResolve}
      />
    </PageTransition>
  );
}
