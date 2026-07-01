"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

/**
 * Generic TanStack Query mutation hook for API write operations.
 * @param mutationFn - Async function performing the mutation
 * @param options - Additional mutation options
 * @returns TanStack Mutation result
 */
export function useApiMutation<TData, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables, TContext>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}
