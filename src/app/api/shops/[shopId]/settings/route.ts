import { randomUUID } from "crypto";

import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { requireShopAccess } from "@/lib/auth/require-shop-access";
import { getSettings, updateSettings } from "@/lib/services/settings.service";
import { settingsUpdateSchema } from "@/schemas/settings.schema";

const ROUTE = "/api/shops/[shopId]/settings";

type RouteContext = { params: Promise<{ shopId: string }> };

/**
 * Returns gateway (secrets masked) and matching settings. Requires VIEWER+.
 * @param _request - Incoming request (unused)
 * @param context - Route params containing the shop id
 * @returns Masked settings payload
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { shopId } = await context.params;

  return withErrorHandling(
    { requestId: randomUUID(), route: ROUTE, shopId },
    async () => {
      await requireShopAccess(shopId, Role.VIEWER);
      const settings = await getSettings(shopId);
      return jsonSuccess(settings);
    },
  );
}

/**
 * Updates gateway and/or matching settings. Requires ADMIN+.
 * @param request - Incoming settings update request
 * @param context - Route params containing the shop id
 * @returns Refreshed masked settings payload
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { shopId } = await context.params;

  return withErrorHandling(
    { requestId: randomUUID(), route: ROUTE, shopId },
    async () => {
      await requireShopAccess(shopId, Role.ADMIN);
      const input = await parseJsonBody(request, settingsUpdateSchema);
      const settings = await updateSettings(shopId, input);
      return jsonSuccess(settings);
    },
  );
}
