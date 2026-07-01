"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import {
  formatStatusLabel,
  getPaymentStatusVariant,
} from "@/lib/payment-status";
import type { RefundView } from "@/schemas/payments.schema";
import type { SortOrder } from "@/types/common";

type SortState = {
  sortBy?: string;
  sortOrder: SortOrder;
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
 * Memoized column definitions for the refunds table.
 * @param sort - Current sort state
 * @param onSort - Sort toggle handler
 * @returns TanStack column definitions
 */
export function useRefundColumns(
  sort: SortState,
  onSort: (columnId: string) => void,
): ColumnDef<RefundView>[] {
  return useMemo(
    () => [
      {
        id: "refundId",
        accessorKey: "refundId",
        header: () => <DataTableColumnHeader title="Refund ID" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.refundId}</span>
        ),
      },
      {
        id: "shopifyRefundId",
        accessorKey: "shopifyRefundId",
        header: () => <DataTableColumnHeader title="Order" />,
        cell: ({ row }) =>
          row.original.shopifyRefundId ??
          truncateId(row.original.transactionId),
      },
      {
        id: "amountPaise",
        accessorKey: "amountPaise",
        header: () => (
          <DataTableColumnHeader
            title="Amount"
            sorted={sort.sortBy === "amountPaise" ? sort.sortOrder : false}
            onSort={() => onSort("amountPaise")}
          />
        ),
        cell: ({ row }) => <CurrencyDisplay paise={row.original.amountPaise} />,
      },
      {
        id: "gateway",
        accessorKey: "transactionId",
        header: () => <DataTableColumnHeader title="Gateway" />,
        cell: () => "Easebuzz",
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
        cell: ({ row }) => (
          <StatusBadge
            label={formatStatusLabel(row.original.status)}
            variant={getPaymentStatusVariant(row.original.status)}
          />
        ),
      },
      {
        id: "processedAt",
        accessorKey: "processedAt",
        header: () => (
          <DataTableColumnHeader
            title="Created At"
            sorted={sort.sortBy === "processedAt" ? sort.sortOrder : false}
            onSort={() => onSort("processedAt")}
          />
        ),
        cell: ({ row }) =>
          row.original.processedAt
            ? formatDate(row.original.processedAt, "dd MMM yyyy, HH:mm")
            : "—",
      },
    ],
    [onSort, sort.sortBy, sort.sortOrder],
  );
}
