"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGetList, type ListParams } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ReconciliationView } from "@/schemas/payments.schema";

/**
 * Fetches paginated reconciliation records for a shop.
 * @param shopId - Active shop id
 * @param params - List query parameters
 * @returns TanStack Query result with reconciliation rows and pagination meta
 */
export function useReconciliation(shopId: string | null, params: ListParams) {
  const { getOptions } = useShopApi();

  return useApiQuery(
    queryKeys.reconciliation(shopId ?? "", params),
    async () => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      return apiGetList<ReconciliationView>(
        `/shops/${shopId}/reconciliation`,
        params,
        options,
      );
    },
    { enabled: Boolean(shopId), placeholderData: (previous) => previous },
  );
}
