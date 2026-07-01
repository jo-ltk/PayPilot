"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGetList, type ListParams } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { RefundView } from "@/schemas/payments.schema";

/**
 * Fetches paginated refunds for a shop.
 * @param shopId - Active shop id
 * @param params - List query parameters
 * @returns TanStack Query result with refund rows and pagination meta
 */
export function useRefunds(shopId: string | null, params: ListParams) {
  const { getOptions } = useShopApi();

  return useApiQuery(
    queryKeys.refunds(shopId ?? "", params),
    async () => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      return apiGetList<RefundView>(
        `/shops/${shopId}/refunds`,
        params,
        options,
      );
    },
    { enabled: Boolean(shopId), placeholderData: (previous) => previous },
  );
}
