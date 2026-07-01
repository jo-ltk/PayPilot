"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGetList } from "@/lib/api-client";
import {
  buildMatchRateTrend,
  buildSuccessRateTrend,
  computeAverageSettlementDays,
  computeGatewayPerformance,
  computePaymentHealthScore,
  computeRefundPercentage,
  computeSuccessRate,
  findLargestSettlement,
  getTopPaymentDays,
  type AnalyticsInsights,
} from "@/lib/analytics-metrics";
import { bucketByDate, toApiDateRange } from "@/lib/dashboard";
import type { AnalyticsResponse } from "@/schemas/analytics.schema";
import type {
  ReconciliationView,
  RefundView,
  SettlementView,
  TransactionView,
} from "@/schemas/payments.schema";
import type { DateRange } from "@/types/common";

/** Extended analytics payload with derived insights and trends. */
export type AnalyticsInsightsData = AnalyticsInsights & {
  settlements: ReturnType<typeof bucketByDate>;
  refunds: ReturnType<typeof bucketByDate>;
};

/**
 * Builds derived insight metrics from raw API payloads.
 * @param analytics - Analytics API response
 * @param payments - Transaction rows
 * @param settlements - Settlement rows
 * @param refunds - Refund rows
 * @param reconciliation - Reconciliation rows
 * @returns Derived insights and trend series
 */
export function buildAnalyticsInsights(
  analytics: AnalyticsResponse,
  payments: TransactionView[],
  settlements: SettlementView[],
  refunds: RefundView[],
  reconciliation: ReconciliationView[],
): AnalyticsInsightsData {
  const successRate = computeSuccessRate(payments);

  return {
    successRate,
    paymentHealthScore: computePaymentHealthScore(analytics.kpis, successRate),
    refundPercentage: computeRefundPercentage(analytics.kpis),
    topPaymentDays: getTopPaymentDays(analytics.series),
    largestSettlement: findLargestSettlement(settlements),
    averageSettlementDays: computeAverageSettlementDays(payments, settlements),
    gatewayPerformance: computeGatewayPerformance(payments),
    successRateTrend: buildSuccessRateTrend(payments),
    matchRateTrend: buildMatchRateTrend(reconciliation),
    settlements: bucketByDate(
      settlements.map((item) => ({
        date: item.payoutDate.slice(0, 10),
        amountPaise: item.totalAmountPaise,
      })),
    ),
    refunds: bucketByDate(
      refunds
        .filter((item) => item.processedAt)
        .map((item) => ({
          date: item.processedAt!.slice(0, 10),
          amountPaise: item.amountPaise,
        })),
    ),
  };
}

/**
 * Fetches list APIs and derives analytics insights for a date range.
 * @param shopId - Active shop id
 * @param range - Selected date range
 * @param analytics - Analytics API response
 * @returns TanStack Query result with derived insights
 */
export function useAnalyticsInsights(
  shopId: string | null,
  range: DateRange,
  analytics: AnalyticsResponse | undefined,
) {
  const { getOptions } = useShopApi();
  const rangeParams = toApiDateRange(range);
  const listParams = { page: 1, pageSize: 100, ...rangeParams };

  return useApiQuery(
    ["shop", shopId ?? "", "analytics-insights", listParams] as const,
    async () => {
      if (!shopId || !analytics) {
        throw new Error("Shop context and analytics data are required");
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

      return buildAnalyticsInsights(
        analytics,
        payments.data,
        settlements.data,
        refunds.data,
        reconciliation.data,
      );
    },
    { enabled: Boolean(shopId && analytics) },
  );
}
