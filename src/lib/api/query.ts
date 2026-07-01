import { parsePagination } from "@/lib/api/pagination";

/** Normalized list query parameters shared by all dashboard list endpoints. */
export type ListQuery = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  from?: Date;
  to?: Date;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder: "asc" | "desc";
};

/**
 * Parses a positive integer query value, ignoring invalid input.
 * @param value - Raw query string value
 * @returns Parsed integer, or undefined
 */
function parseIntParam(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Parses an ISO date query value into a Date, ignoring invalid input.
 * @param value - Raw query string value
 * @returns Parsed Date, or undefined
 */
function parseDateParam(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Parses pagination, date range, filter, and sort params from a URL.
 * @param url - Request URL
 * @returns Normalized list query
 */
export function parseListQuery(url: URL): ListQuery {
  const params = url.searchParams;
  const { page, pageSize, skip, take } = parsePagination({
    page: parseIntParam(params.get("page")),
    pageSize: parseIntParam(params.get("pageSize")),
  });
  const sortOrder = params.get("sortOrder") === "asc" ? "asc" : "desc";

  return {
    page,
    pageSize,
    skip,
    take,
    from: parseDateParam(params.get("from")),
    to: parseDateParam(params.get("to")),
    status: params.get("status") ?? undefined,
    search: params.get("search") ?? undefined,
    sortBy: params.get("sortBy") ?? undefined,
    sortOrder,
  };
}

/**
 * Builds a Prisma `orderBy` from a whitelisted sort field.
 * @param sortBy - Requested sort field (validated against `allowed`)
 * @param sortOrder - Sort direction
 * @param allowed - Permitted sort fields
 * @param fallback - Default sort field when none/invalid is requested
 * @returns Prisma orderBy object
 */
export function buildOrderBy(
  sortBy: string | undefined,
  sortOrder: "asc" | "desc",
  allowed: readonly string[],
  fallback: string,
): Record<string, "asc" | "desc"> {
  const field = sortBy && allowed.includes(sortBy) ? sortBy : fallback;
  return { [field]: sortOrder };
}
