import { randomUUID } from "crypto";

import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { requireShopAccess } from "@/lib/auth/require-shop-access";
import { getAnalytics } from "@/lib/services/analytics.service";

const ROUTE = "/api/shops/[shopId]/analytics";

type RouteContext = { params: Promise<{ shopId: string }> };

/**
 * Parses an optional ISO date query param.
 * @param value - Raw query value
 * @returns Date or undefined
 */
function parseDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Returns KPIs and a daily volume series for a shop. Requires VIEWER+.
 * @param request - Incoming request (reads `from`/`to` query params)
 * @param context - Route params containing the shop id
 * @returns Analytics payload
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { shopId } = await context.params;

  return withErrorHandling(
    { requestId: randomUUID(), route: ROUTE, shopId },
    async () => {
      await requireShopAccess(shopId, Role.VIEWER);
      const params = new URL(request.url).searchParams;
      const analytics = await getAnalytics(shopId, {
        from: parseDate(params.get("from")),
        to: parseDate(params.get("to")),
      });
      return jsonSuccess(analytics);
    },
  );
}
