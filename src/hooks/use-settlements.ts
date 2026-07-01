"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGetList, type ListParams } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { SettlementView } from "@/schemas/payments.schema";

/**
 * Fetches paginated settlements for a shop.
 * @param shopId - Active shop id
 * @param params - List query parameters
 * @returns TanStack Query result with settlement rows and pagination meta
 */
export function useSettlements(shopId: string | null, params: ListParams) {
  const { getOptions } = useShopApi();

  return useApiQuery(
    queryKeys.settlements(shopId ?? "", params),
    async () => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      return apiGetList<SettlementView>(
        `/shops/${shopId}/settlements`,
        params,
        options,
      );
    },
    { enabled: Boolean(shopId), placeholderData: (previous) => previous },
  );
}
