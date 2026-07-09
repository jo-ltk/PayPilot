import { randomUUID } from "crypto";

import { GatewayProvider, Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { requireShopAccess } from "@/lib/auth/require-shop-access";
import { paymentGatewayRegistry } from "@/lib/gateways/index";
import { getGatewayCredentials } from "@/lib/services/settings.service";
import type { ValidateResponse } from "@/schemas/settings.schema";

const ROUTE = "/api/shops/[shopId]/settings/validate";

type RouteContext = { params: Promise<{ shopId: string }> };

/**
 * Validates stored gateway credentials against the provider API. Requires ADMIN+.
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
      const adapter = paymentGatewayRegistry.get(GatewayProvider.EASEBUZZ);
      const result = await adapter.testConnection(
        {
          key: credentials.key,
          salt: credentials.salt,
          merchantEmail: credentials.merchantEmail,
        },
        credentials.environment,
      );
      const webhookUrls = adapter.getWebhookUrls(shopId);
      const payload: ValidateResponse = {
        ...result,
        webhookUrls: {
          transaction: webhookUrls.transaction ?? "",
          payout: webhookUrls.payout ?? "",
          refund: webhookUrls.refund ?? "",
        },
      };
      return jsonSuccess(payload);
    },
  );
}
