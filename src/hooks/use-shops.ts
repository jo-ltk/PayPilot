"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGet } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ShopView } from "@/schemas/payments.schema";

/**
 * Fetches shops the current user can access.
 * @param enabled - Whether the query should run
 * @returns TanStack Query result with shop summaries
 */
export function useShops(enabled = true) {
  const { getOptions } = useShopApi();

  return useApiQuery(
    queryKeys.shops(),
    async () => {
      const options = await getOptions();
      return apiGet<ShopView[]>("/shops", options);
    },
    { enabled },
  );
}
