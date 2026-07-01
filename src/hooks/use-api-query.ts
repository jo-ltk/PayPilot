"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

/**
 * Generic TanStack Query hook for GET requests via a fetcher function.
 * @param queryKey - Stable query key
 * @param fetcher - Async function returning typed data
 * @param options - Additional query options
 * @returns TanStack Query result
 */
export function useApiQuery<TData>(
  queryKey: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}
