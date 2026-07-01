import type { QueryClient } from "@tanstack/react-query";

/**
 * Invalidates queries affected by reconciliation resolution.
 * @param queryClient - TanStack Query client
 * @param shopId - Active shop id
 */
export function invalidateAfterReconciliationResolve(
  queryClient: QueryClient,
  shopId: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: ["shop", shopId, "reconciliation"],
  });
  void queryClient.invalidateQueries({
    queryKey: ["shop", shopId, "analytics"],
  });
  void queryClient.invalidateQueries({
    queryKey: ["shop", shopId, "refunds"],
  });
}

/**
 * Invalidates all shop-scoped queries after a manual reconcile trigger.
 * @param queryClient - TanStack Query client
 * @param shopId - Active shop id
 */
export function invalidateAfterManualReconcile(
  queryClient: QueryClient,
  shopId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
}
