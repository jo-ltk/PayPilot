"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGet } from "@/lib/api-client";
import { buildAnalyticsQuery, toApiDateRange } from "@/lib/dashboard";
import { queryKeys } from "@/lib/query-keys";
import type { AnalyticsResponse } from "@/schemas/analytics.schema";
import type { DateRange } from "@/types/common";

/**
 * Fetches dashboard analytics KPIs and revenue series for a shop.
 * @param shopId - Active shop id
 * @param range - Selected date range
 * @returns TanStack Query result with analytics payload
 */
export function useAnalytics(shopId: string | null, range: DateRange) {
  const { getOptions } = useShopApi();
  const rangeParams = toApiDateRange(range);

  return useApiQuery(
    queryKeys.analytics(shopId ?? "", rangeParams),
    async () => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      const query = buildAnalyticsQuery(rangeParams);

      return apiGet<AnalyticsResponse>(
        `/shops/${shopId}/analytics${query}`,
        options,
      );
    },
    { enabled: Boolean(shopId) },
  );
}
