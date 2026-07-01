"use client";

import { useEffect, useMemo, useState } from "react";

import {
  defaultListFilters,
  nextSortState,
  toListParams,
  type ListFilterState,
} from "@/lib/list-filters";
import type { ListParams } from "@/lib/api-client";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Manages paginated list filter state with debounced search.
 * @param initial - Optional initial filter overrides
 * @returns Filter state and update helpers
 */
export function useListFilters(initial?: Partial<ListFilterState>) {
  const [filters, setFilters] = useState<ListFilterState>({
    ...defaultListFilters(),
    ...initial,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const apiParams = useMemo(
    () => toListParams(filters, debouncedSearch),
    [filters, debouncedSearch],
  );

  const setSearch = (search: string) => {
    setFilters((current) => ({ ...current, search, page: 1 }));
  };

  const setStatus = (status: string | "all") => {
    setFilters((current) => ({ ...current, status, page: 1 }));
  };

  const setDateRange = (dateRange: ListFilterState["dateRange"]) => {
    setFilters((current) => ({ ...current, dateRange, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const toggleSort = (columnId: string) => {
    setFilters((current) => ({ ...current, ...nextSortState(current, columnId) }));
  };

  const resetFilters = () => {
    setFilters(defaultListFilters());
  };

  return {
    filters,
    apiParams: apiParams as ListParams,
    setSearch,
    setStatus,
    setDateRange,
    setPage,
    toggleSort,
    resetFilters,
  };
}
