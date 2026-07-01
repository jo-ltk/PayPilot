"use client";

import { useShopApi } from "@/hooks/use-shop-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { apiPost } from "@/lib/api-client";
import type { ValidateResponse } from "@/schemas/settings.schema";

/**
 * Validates stored Easebuzz credentials against the gateway API.
 * @param shopId - Active shop id
 * @returns TanStack mutation for POST settings validate
 */
export function useValidateSettings(shopId: string | null) {
  const { getOptions } = useShopApi();

  return useApiMutation(async () => {
    if (!shopId) {
      throw new Error("Shop context is required");
    }

    const options = await getOptions();
    return apiPost<ValidateResponse>(
      `/shops/${shopId}/settings/validate`,
      {},
      options,
    );
  });
}
