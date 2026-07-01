import { randomUUID } from "crypto";

import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { requireShopAccess } from "@/lib/auth/require-shop-access";
import { resolveRecord } from "@/lib/services/reconciliation.service";

const ROUTE = "/api/shops/[shopId]/reconciliation/[id]";

type RouteContext = { params: Promise<{ shopId: string; id: string }> };

/**
 * Marks a reconciliation record as resolved. Requires ADMIN+.
 * @param _request - Incoming request (unused)
 * @param context - Route params containing the shop id and record id
 * @returns The updated reconciliation record
 */
export async function PATCH(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { shopId, id } = await context.params;

  return withErrorHandling(
    { requestId: randomUUID(), route: ROUTE, shopId },
    async () => {
      const access = await requireShopAccess(shopId, Role.ADMIN);
      const record = await resolveRecord(shopId, id, access.userId);
      return jsonSuccess(record);
    },
  );
}
