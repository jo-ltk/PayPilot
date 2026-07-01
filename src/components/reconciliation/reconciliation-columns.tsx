"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { MismatchBadge } from "@/components/reconciliation/mismatch-badge";
import { ReconciliationRowActions } from "@/components/reconciliation/reconciliation-row-actions";
import { getSettlementColumnLabel } from "@/lib/filter-reconciliation-rows";
import { formatDate } from "@/lib/format";
import type { ReconciliationView } from "@/schemas/payments.schema";
import type { SortOrder } from "@/types/common";

type SortState = {
  sortBy?: string;
  sortOrder: SortOrder;
};

type ColumnHandlers = {
  onSort: (columnId: string) => void;
  onViewDetails: (record: ReconciliationView) => void;
  onResolve: (record: ReconciliationView) => void;
  canResolve: boolean;
};

function truncateId(value: string | null, length = 10): string {
  if (!value) {
    return "—";
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}…`;
}

/**
 * Memoized column definitions for the reconciliation table.
 * @param sort - Current sort state
 * @param handlers - Sort and row action handlers
 * @returns TanStack column definitions
 */
export function useReconciliationColumns(
  sort: SortState,
  handlers: ColumnHandlers,
): ColumnDef<ReconciliationView>[] {
  const { onSort, onViewDetails, onResolve, canResolve } = handlers;

  return useMemo(
    () => [
      {
        id: "shopifyOrderId",
        accessorKey: "shopifyOrderId",
        meta: { label: "Order" },
        header: () => <DataTableColumnHeader title="Order" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {truncateId(row.original.shopifyOrderId)}
          </span>
        ),
        enableHiding: true,
      },
      {
        id: "transactionId",
        accessorKey: "transactionId",
        meta: { label: "Transaction" },
        header: () => <DataTableColumnHeader title="Transaction" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {truncateId(row.original.transactionId)}
          </span>
        ),
        enableHiding: true,
      },
      {
        id: "settlement",
        accessorKey: "status",
        meta: { label: "Settlement" },
        header: () => <DataTableColumnHeader title="Settlement" />,
        cell: ({ row }) => getSettlementColumnLabel(row.original.status),
        enableHiding: true,
      },
      {
        id: "matchStrategy",
        accessorKey: "reason",
        meta: { label: "Match Strategy" },
        header: () => <DataTableColumnHeader title="Match Strategy" />,
        cell: ({ row }) => row.original.reason ?? "Auto-match",
        enableHiding: true,
      },
      {
        id: "status",
        accessorKey: "status",
        header: () => (
          <DataTableColumnHeader
            title="Status"
            sorted={sort.sortBy === "status" ? sort.sortOrder : false}
            onSort={() => onSort("status")}
          />
        ),
        cell: ({ row }) => <MismatchBadge status={row.original.status} />,
      },
      {
        id: "deltaPaise",
        accessorKey: "deltaPaise",
        meta: { label: "Difference" },
        header: () => (
          <DataTableColumnHeader
            title="Difference"
            sorted={sort.sortBy === "deltaPaise" ? sort.sortOrder : false}
            onSort={() => onSort("deltaPaise")}
          />
        ),
        cell: ({ row }) =>
          row.original.deltaPaise != null ? (
            <CurrencyDisplay paise={row.original.deltaPaise} signed />
          ) : (
            "—"
          ),
        enableHiding: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: () => (
          <DataTableColumnHeader
            title="Created At"
            sorted={sort.sortBy === "createdAt" ? sort.sortOrder : false}
            onSort={() => onSort("createdAt")}
          />
        ),
        cell: ({ row }) =>
          formatDate(row.original.createdAt, "dd MMM yyyy, HH:mm"),
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <ReconciliationRowActions
            record={row.original}
            canResolve={canResolve}
            onViewDetails={onViewDetails}
            onResolve={onResolve}
          />
        ),
      },
    ],
    [canResolve, onResolve, onSort, onViewDetails, sort.sortBy, sort.sortOrder],
  );
}
