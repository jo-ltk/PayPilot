"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import {
  formatStatusLabel,
  getSettlementStatusVariant,
} from "@/lib/payment-status";
import type { SettlementView } from "@/schemas/payments.schema";
import type { SortOrder } from "@/types/common";

type SortState = {
  sortBy?: string;
  sortOrder: SortOrder;
};

/**
 * Memoized column definitions for the settlements table.
 * @param sort - Current sort state
 * @param onSort - Sort toggle handler
 * @returns TanStack column definitions
 */
export function useSettlementColumns(
  sort: SortState,
  onSort: (columnId: string) => void,
): ColumnDef<SettlementView>[] {
  return useMemo(
    () => [
      {
        id: "payoutId",
        accessorKey: "payoutId",
        header: () => <DataTableColumnHeader title="Settlement ID" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.payoutId}</span>
        ),
      },
      {
        id: "payoutDate",
        accessorKey: "payoutDate",
        header: () => (
          <DataTableColumnHeader
            title="Payout Date"
            sorted={sort.sortBy === "payoutDate" ? sort.sortOrder : false}
            onSort={() => onSort("payoutDate")}
          />
        ),
        cell: ({ row }) => formatDate(row.original.payoutDate),
      },
      {
        id: "totalAmountPaise",
        accessorKey: "totalAmountPaise",
        header: () => (
          <DataTableColumnHeader
            title="Gross Amount"
            sorted={
              sort.sortBy === "totalAmountPaise" ? sort.sortOrder : false
            }
            onSort={() => onSort("totalAmountPaise")}
          />
        ),
        cell: ({ row }) => (
          <CurrencyDisplay paise={row.original.totalAmountPaise} />
        ),
      },
      {
        id: "fees",
        header: () => <DataTableColumnHeader title="Fees" />,
        cell: () => <span className="text-muted-foreground">—</span>,
        enableSorting: false,
      },
      {
        id: "gst",
        header: () => <DataTableColumnHeader title="GST" />,
        cell: () => <span className="text-muted-foreground">—</span>,
        enableSorting: false,
      },
      {
        id: "netAmount",
        header: () => <DataTableColumnHeader title="Net Amount" />,
        cell: ({ row }) => (
          <CurrencyDisplay paise={row.original.totalAmountPaise} />
        ),
        enableSorting: false,
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
            variant={getSettlementStatusVariant(row.original.status)}
          />
        ),
      },
    ],
    [onSort, sort.sortBy, sort.sortOrder],
  );
}
