import { describe, expect, it } from "vitest";

import {
  defaultListFilters,
  nextSortState,
  toListParams,
} from "@/lib/list-filters";

describe("list-filters", () => {
  it("returns default filter state", () => {
    const filters = defaultListFilters();

    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(25);
    expect(filters.status).toBe("all");
  });

  it("maps filters to API params", () => {
    const filters = {
      ...defaultListFilters(),
      search: "ignored",
      status: "success",
      sortBy: "occurredAt",
    };

    const params = toListParams(filters, "ORD-1001");

    expect(params.search).toBe("ORD-1001");
    expect(params.status).toBe("success");
    expect(params.sortBy).toBe("occurredAt");
  });

  it("toggles sort direction for the same column", () => {
    const current = {
      ...defaultListFilters(),
      sortBy: "amountPaise",
      sortOrder: "desc" as const,
    };

    expect(nextSortState(current, "amountPaise")).toEqual({
      sortBy: "amountPaise",
      sortOrder: "asc",
      page: 1,
    });
  });
});
