"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiGet, apiPatch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  SettingsResponse,
  SettingsUpdateInput,
} from "@/schemas/settings.schema";

/**
 * Fetches masked gateway and matching settings for a shop.
 * @param shopId - Active shop id
 * @returns TanStack Query result with settings payload
 */
export function useSettings(shopId: string | null) {
  const { getOptions } = useShopApi();

  return useApiQuery(
    queryKeys.settings(shopId ?? ""),
    async () => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      return apiGet<SettingsResponse>(`/shops/${shopId}/settings`, options);
    },
    { enabled: Boolean(shopId) },
  );
}

/**
 * Persists gateway and/or matching settings updates.
 * @param shopId - Active shop id
 * @returns TanStack mutation for PATCH settings
 */
export function useUpdateSettings(shopId: string | null) {
  const queryClient = useQueryClient();
  const { getOptions } = useShopApi();

  return useApiMutation(
    async (input: SettingsUpdateInput) => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      return apiPatch<SettingsResponse>(
        `/shops/${shopId}/settings`,
        input,
        options,
      );
    },
    {
      onSuccess: (data) => {
        if (!shopId) {
          return;
        }

        queryClient.setQueryData(queryKeys.settings(shopId), data);
        void queryClient.invalidateQueries({
          queryKey: ["shop", shopId, "reconciliation"],
        });
      },
    },
  );
}
