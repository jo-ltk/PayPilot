"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { apiGet } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { HealthStatus } from "@/lib/health";

/**
 * Fetches the public API health payload.
 * @returns TanStack Query result with health status
 */
export function useHealth() {
  return useApiQuery(queryKeys.health(), async () =>
    apiGet<HealthStatus>("/health"),
  );
}
