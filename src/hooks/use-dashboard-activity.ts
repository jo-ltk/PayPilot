"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGetList } from "@/lib/api-client";
import { toApiDateRange } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format";
import type {
  ReconciliationView,
  RefundView,
  SettlementView,
  TransactionView,
} from "@/schemas/payments.schema";
import type { DateRange } from "@/types/common";

/** A normalized recent activity row for the dashboard timeline. */
export type ActivityItem = {
  id: string;
  type: "payment" | "settlement" | "refund" | "reconciliation";
  title: string;
  description: string;
  timestamp: string;
};

function mapPayment(item: TransactionView): ActivityItem {
  return {
    id: `payment-${item.id}`,
    type: "payment",
    title: "Payment received",
    description: `${formatCurrency(item.amountPaise, item.currency)} · ${item.txnid ?? item.easebuzzTxnId}`,
    timestamp: item.occurredAt,
  };
}

function mapSettlement(item: SettlementView): ActivityItem {
  return {
    id: `settlement-${item.id}`,
    type: "settlement",
    title: "Settlement completed",
    description: `${formatCurrency(item.totalAmountPaise)} · ${item.transactionCount} transactions`,
    timestamp: item.payoutDate,
  };
}

function mapRefund(item: RefundView): ActivityItem {
  return {
    id: `refund-${item.id}`,
    type: "refund",
    title: "Refund processed",
    description: `${formatCurrency(item.amountPaise)} · ${item.refundId}`,
    timestamp: item.processedAt ?? item.refundId,
  };
}

function mapReconciliation(item: ReconciliationView): ActivityItem {
  const statusLabel =
    item.status === "MATCHED" ? "Reconciliation matched" : "Reconciliation issue";

  return {
    id: `reconciliation-${item.id}`,
    type: "reconciliation",
    title: statusLabel,
    description: item.reason ?? `Order ${item.shopifyOrderId ?? "—"}`,
    timestamp: item.createdAt,
  };
}

function mergeActivity(
  payments: TransactionView[],
  settlements: SettlementView[],
  refunds: RefundView[],
  reconciliation: ReconciliationView[],
): ActivityItem[] {
  return [
    ...payments.map(mapPayment),
    ...settlements.map(mapSettlement),
    ...refunds.map(mapRefund),
    ...reconciliation.map(mapReconciliation),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 8);
}

/**
 * Fetches and merges recent payments, settlements, refunds, and reconciliation.
 * @param shopId - Active shop id
 * @param range - Selected date range
 * @returns TanStack Query result with sorted activity items
 */
export function useDashboardActivity(
  shopId: string | null,
  range: DateRange,
) {
  const { getOptions } = useShopApi();
  const rangeParams = toApiDateRange(range);
  const listParams = { page: 1, pageSize: 5, ...rangeParams };

  return useApiQuery(
    ["shop", shopId ?? "", "dashboard-activity", listParams] as const,
    async () => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      const [payments, settlements, refunds, reconciliation] =
        await Promise.all([
          apiGetList<TransactionView>(
            `/shops/${shopId}/payments`,
            listParams,
            options,
          ),
          apiGetList<SettlementView>(
            `/shops/${shopId}/settlements`,
            listParams,
            options,
          ),
          apiGetList<RefundView>(
            `/shops/${shopId}/refunds`,
            listParams,
            options,
          ),
          apiGetList<ReconciliationView>(
            `/shops/${shopId}/reconciliation`,
            listParams,
            options,
          ),
        ]);

      return mergeActivity(
        payments.data,
        settlements.data,
        refunds.data,
        reconciliation.data,
      );
    },
    { enabled: Boolean(shopId) },
  );
}
