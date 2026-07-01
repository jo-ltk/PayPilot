import type { ListParams } from "@/lib/api-client";
import { toApiDateRange } from "@/lib/dashboard";
import type { DateRange, SortOrder } from "@/types/common";

/** UI state for paginated list pages. */
export type ListFilterState = {
  search: string;
  status: string | "all";
  dateRange: DateRange;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: SortOrder;
};

export const DEFAULT_LIST_PAGE_SIZE = 25;

/** Default filter state for transactions and settlements pages. */
export function defaultListFilters(): ListFilterState {
  return {
    search: "",
    status: "all",
    dateRange: {},
    page: 1,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    sortOrder: "desc",
  };
}

/**
 * Converts list filter state to API query parameters.
 * @param filters - Current filter state
 * @param debouncedSearch - Debounced search string
 * @returns API list params
 */
export function toListParams(
  filters: ListFilterState,
  debouncedSearch: string,
): ListParams {
  const dates = toApiDateRange(filters.dateRange);

  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: debouncedSearch || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    from: dates.from,
    to: dates.to,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}

/**
 * Toggles sort direction or sets a new sort column.
 * @param current - Current filter state
 * @param columnId - Column to sort by
 * @returns Updated filter state partial
 */
export function nextSortState(
  current: ListFilterState,
  columnId: string,
): Pick<ListFilterState, "sortBy" | "sortOrder" | "page"> {
  if (current.sortBy !== columnId) {
    return { sortBy: columnId, sortOrder: "desc", page: 1 };
  }

  return {
    sortBy: columnId,
    sortOrder: current.sortOrder === "desc" ? "asc" : "desc",
    page: 1,
  };
}
