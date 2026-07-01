export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type SortParams = {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * Normalizes pagination query parameters.
 * @param params - Raw pagination params
 * @returns Sanitized page and pageSize
 */
export function parsePagination(params: PaginationParams) {
  const page = Math.max(DEFAULT_PAGE, params.page ?? DEFAULT_PAGE);
  const rawSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip, take: pageSize };
}

/**
 * Builds pagination metadata for list responses.
 * @param page - Current page number
 * @param pageSize - Items per page
 * @param total - Total item count
 * @returns Pagination meta object
 */
export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
) {
  return {
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  };
}
