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
import type { TransactionView } from "@/schemas/payments.schema";
import type { SortOrder } from "@/types/common";

type SortState = {
  sortBy?: string;
  sortOrder: SortOrder;
};

function truncateId(value: string, length = 10): string {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}…`;
}

/**
 * Memoized column definitions for the transactions table.
 * @param sort - Current sort state
 * @param onSort - Sort toggle handler
 * @returns TanStack column definitions
 */
export function useTransactionColumns(
  sort: SortState,
  onSort: (columnId: string) => void,
): ColumnDef<TransactionView>[] {
  return useMemo(
    () => [
      {
        id: "id",
        accessorKey: "id",
        meta: { label: "Transaction ID" },
        header: () => (
          <DataTableColumnHeader title="Transaction ID" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {truncateId(row.original.easebuzzTxnId)}
          </span>
        ),
        enableHiding: true,
      },
      {
        id: "txnid",
        accessorKey: "txnid",
        header: () => <DataTableColumnHeader title="Order" />,
        cell: ({ row }) => row.original.txnid ?? row.original.matchedOrderId ?? "—",
      },
      {
        id: "easebuzzPaymentId",
        accessorKey: "easebuzzPaymentId",
        header: () => <DataTableColumnHeader title="Gateway Reference" />,
        cell: ({ row }) =>
          row.original.easebuzzPaymentId ?? row.original.easebuzzTxnId,
      },
      {
        id: "email",
        accessorKey: "email",
        header: () => <DataTableColumnHeader title="Customer" />,
        cell: ({ row }) => row.original.email ?? row.original.phone ?? "—",
      },
      {
        id: "amountPaise",
        accessorKey: "amountPaise",
        header: () => (
          <DataTableColumnHeader
            title="Amount"
            sorted={
              sort.sortBy === "amountPaise"
                ? sort.sortOrder
                : false
            }
            onSort={() => onSort("amountPaise")}
          />
        ),
        cell: ({ row }) => (
          <CurrencyDisplay
            paise={row.original.amountPaise}
            currency={row.original.currency}
          />
        ),
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
        id: "occurredAt",
        accessorKey: "occurredAt",
        header: () => (
          <DataTableColumnHeader
            title="Created At"
            sorted={sort.sortBy === "occurredAt" ? sort.sortOrder : false}
            onSort={() => onSort("occurredAt")}
          />
        ),
        cell: ({ row }) => formatDate(row.original.occurredAt, "dd MMM yyyy, HH:mm"),
      },
    ],
    [onSort, sort.sortBy, sort.sortOrder],
  );
}
