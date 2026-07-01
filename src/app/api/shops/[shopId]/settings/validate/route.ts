import { randomUUID } from "crypto";

import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { requireShopAccess } from "@/lib/auth/require-shop-access";
import { getEnv } from "@/lib/env";
import { validateCredentials } from "@/lib/easebuzz/client";
import { getGatewayCredentials } from "@/lib/services/settings.service";
import type { ValidateResponse } from "@/schemas/settings.schema";

const ROUTE = "/api/shops/[shopId]/settings/validate";

type RouteContext = { params: Promise<{ shopId: string }> };

/**
 * Builds the Easebuzz webhook URLs a merchant copies into their dashboard.
 * @returns Transaction, payout, and refund webhook URLs
 */
function buildWebhookUrls(): ValidateResponse["webhookUrls"] {
  const base = `${getEnv().HOST ?? ""}/api/webhooks/easebuzz`;
  return {
    transaction: `${base}/transaction`,
    payout: `${base}/payout`,
    refund: `${base}/refund`,
  };
}

/**
 * Validates stored Easebuzz credentials against the gateway API. Requires ADMIN+.
 * @param _request - Incoming request (unused)
 * @param context - Route params containing the shop id
 * @returns Validation outcome plus webhook URLs
 */
export async function POST(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { shopId } = await context.params;

  return withErrorHandling(
    { requestId: randomUUID(), route: ROUTE, shopId },
    async () => {
      await requireShopAccess(shopId, Role.ADMIN);
      const credentials = await getGatewayCredentials(shopId);
      const result = await validateCredentials(credentials);
      const payload: ValidateResponse = {
        ...result,
        webhookUrls: buildWebhookUrls(),
      };
      return jsonSuccess(payload);
    },
  );
}
