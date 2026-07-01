"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGetList } from "@/lib/api-client";
import { bucketByDate, toApiDateRange, type TrendPoint } from "@/lib/dashboard";
import type { RefundView, SettlementView } from "@/schemas/payments.schema";
import type { DateRange } from "@/types/common";

/** Settlement and refund trend series for dashboard charts. */
export type DashboardTrends = {
  settlements: TrendPoint[];
  refunds: TrendPoint[];
};

/**
 * Fetches settlement and refund list data and buckets into daily trends.
 * @param shopId - Active shop id
 * @param range - Selected date range
 * @returns TanStack Query result with trend series
 */
export function useDashboardTrends(
  shopId: string | null,
  range: DateRange,
) {
  const { getOptions } = useShopApi();
  const rangeParams = toApiDateRange(range);
  const listParams = { page: 1, pageSize: 100, ...rangeParams };

  return useApiQuery(
    ["shop", shopId ?? "", "dashboard-trends", listParams] as const,
    async () => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      const [settlements, refunds] = await Promise.all([
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
      ]);

      return {
        settlements: bucketByDate(
          settlements.data.map((item) => ({
            date: item.payoutDate.slice(0, 10),
            amountPaise: item.totalAmountPaise,
          })),
        ),
        refunds: bucketByDate(
          refunds.data
            .filter((item) => item.processedAt)
            .map((item) => ({
              date: item.processedAt!.slice(0, 10),
              amountPaise: item.amountPaise,
            })),
        ),
      } satisfies DashboardTrends;
    },
    { enabled: Boolean(shopId) },
  );
}
