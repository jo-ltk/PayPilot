/** Health check response from `/api/health`. */
export type HealthResponse = {
  status: string;
  timestamp: string;
};

/** Generic select option for filters and dropdowns. */
export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

/** Date range used by filters and analytics queries. */
export type DateRange = {
  from?: Date;
  to?: Date;
};

/** Sort direction for table columns. */
export type SortOrder = "asc" | "desc";

/** Shared table density preference. */
export type TableDensity = "comfortable" | "compact";
