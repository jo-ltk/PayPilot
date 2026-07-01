import { randomUUID } from "crypto";

import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { buildPaginationMeta } from "@/lib/api/pagination";
import { parseListQuery, type ListQuery } from "@/lib/api/query";
import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { requireShopAccess } from "@/lib/auth/require-shop-access";

type RouteContext = { params: Promise<{ shopId: string }> };

/** A paginated lister: returns mapped items plus a total count. */
export type Lister<T> = (
  shopId: string,
  query: ListQuery,
) => Promise<{ items: T[]; total: number }>;

/**
 * Builds a thin, shop-scoped GET handler for a paginated list endpoint.
 *
 * Enforces VIEWER access, parses pagination/filter/sort query params, and wraps
 * the result in the standard success envelope with pagination metadata.
 * @param route - Route label used for logging
 * @param lister - Service function returning items and a total count
 * @returns A Next.js route GET handler
 */
export function createListRoute<T>(
  route: string,
  lister: Lister<T>,
): (request: NextRequest, context: RouteContext) => Promise<Response> {
  return async (request, context) => {
    const { shopId } = await context.params;
    return withErrorHandling(
      { requestId: randomUUID(), route, shopId },
      async () => {
        await requireShopAccess(shopId, Role.VIEWER);
        const query = parseListQuery(new URL(request.url));
        const { items, total } = await lister(shopId, query);
        return jsonSuccess(
          items,
          undefined,
          buildPaginationMeta(query.page, query.pageSize, total),
        );
      },
    );
  };
}
