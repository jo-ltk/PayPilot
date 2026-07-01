"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ReconciliationStatus } from "@prisma/client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { useShopApi } from "@/hooks/use-shop-api";
import { apiPatch } from "@/lib/api-client";
import { invalidateAfterReconciliationResolve } from "@/lib/invalidate-shop-queries";
import { queryKeys } from "@/lib/query-keys";
import type { ListResult } from "@/lib/api-client";
import type { ReconciliationView } from "@/schemas/payments.schema";

type ResolveVariables = {
  recordId: string;
  shopId: string;
  listParams: Record<string, unknown>;
};

type ResolveContext = {
  previous?: ListResult<ReconciliationView>;
  queryKey: ReturnType<typeof queryKeys.reconciliation>;
};

/**
 * Mutation hook to mark a reconciliation record as resolved.
 * Applies optimistic list updates and invalidates dashboard-related caches.
 * @param shopId - Active shop id
 * @returns TanStack mutation for resolving reconciliation records
 */
export function useResolveReconciliation(shopId: string | null) {
  const queryClient = useQueryClient();
  const { getOptions } = useShopApi();

  return useApiMutation<ReconciliationView, ResolveVariables, ResolveContext>(
    async ({ recordId }) => {
      if (!shopId) {
        throw new Error("Shop context is required");
      }

      const options = await getOptions();
      return apiPatch<ReconciliationView>(
        `/shops/${shopId}/reconciliation/${recordId}`,
        {},
        options,
      );
    },
    {
      onMutate: async ({ recordId, shopId: activeShopId, listParams }) => {
        const queryKey = queryKeys.reconciliation(activeShopId, listParams);
        await queryClient.cancelQueries({ queryKey });

        const previous = queryClient.getQueryData<ListResult<ReconciliationView>>(
          queryKey,
        );

        if (previous) {
          queryClient.setQueryData<ListResult<ReconciliationView>>(queryKey, {
            ...previous,
            data: previous.data.map((row) =>
              row.id === recordId
                ? {
                    ...row,
                    status: ReconciliationStatus.RESOLVED,
                    resolvedAt: new Date().toISOString(),
                  }
                : row,
            ),
          });
        }

        return { previous, queryKey };
      },
      onError: (_error, _variables, context) => {
        if (context?.previous && context.queryKey) {
          queryClient.setQueryData(context.queryKey, context.previous);
        }
      },
      onSuccess: (_data, { shopId: activeShopId }) => {
        invalidateAfterReconciliationResolve(queryClient, activeShopId);
      },
    },
  );
}
