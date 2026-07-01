import type { ListParams } from "@/lib/api-client";

/** TanStack Query key factory for shop-scoped server state. */
export const queryKeys = {
  shops: () => ["shops"] as const,

  shop: (shopId: string) => ["shop", shopId] as const,

  payments: (shopId: string, filters: ListParams = {}) =>
    ["shop", shopId, "payments", filters] as const,

  settlements: (shopId: string, filters: ListParams = {}) =>
    ["shop", shopId, "settlements", filters] as const,

  reconciliation: (shopId: string, filters: ListParams = {}) =>
    ["shop", shopId, "reconciliation", filters] as const,

  refunds: (shopId: string, filters: ListParams = {}) =>
    ["shop", shopId, "refunds", filters] as const,

  analytics: (shopId: string, range?: { from?: string; to?: string }) =>
    ["shop", shopId, "analytics", range ?? {}] as const,

  settings: (shopId: string) => ["shop", shopId, "settings"] as const,

  health: () => ["health"] as const,
};
