import { randomUUID } from "crypto";

import type { NextRequest } from "next/server";

import { AuthError } from "@/lib/api/errors";
import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { getShopDomain, verifySessionToken } from "@/lib/auth/shopify";
import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/logger";
import { captureProductEvent } from "@/lib/monitoring/posthog";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { upsertShopWithSession } from "@/lib/services/shop.service";
import { registerShopifyWebhooks } from "@/lib/shopify/register-webhooks";
import { exchangeSessionToken } from "@/lib/shopify/token-exchange";

const ROUTE = "/api/auth/shopify";

/**
 * Extracts the Bearer session token from the Authorization header.
 * @param request - Incoming request
 * @returns Raw session token
 * @throws {AuthError} When the header is missing or malformed
 */
function getBearerToken(request: NextRequest): string {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AuthError("Missing Bearer session token");
  }
  return token;
}

/**
 * Runs best-effort post-install steps: webhook registration and order-sync
 * enqueue. Failures are logged but never fail the install itself.
 * @param shopId - Installed shop id
 * @param shopDomain - Shop domain
 * @param accessToken - Plaintext offline access token
 */
async function runPostInstall(
  shopId: string,
  shopDomain: string,
  accessToken: string,
): Promise<void> {
  try {
    await registerShopifyWebhooks(shopDomain, accessToken);
    await inngest.send({
      name: "shopify/sync.requested",
      data: { shopId, shopDomain },
    });
  } catch (error) {
    logger.error({ shopId, route: ROUTE, err: error }, "post-install failed");
  }
}

/**
 * Completes Shopify Managed Installation via token exchange.
 *
 * Verifies the session token, exchanges it for an offline access token, upserts
 * the Shop + ShopifySession, then registers webhooks and enqueues an initial
 * order sync.
 * @param request - Incoming request carrying the Bearer session token
 * @returns Installed shop identifiers
 */
export async function POST(request: NextRequest): Promise<Response> {
  const requestId = randomUUID();

  return withErrorHandling({ requestId, route: ROUTE }, async () => {
    enforceAuthRateLimit(request, ROUTE);
    const sessionToken = getBearerToken(request);
    const claims = await verifySessionToken(sessionToken);
    const shopDomain = getShopDomain(claims);

    const exchange = await exchangeSessionToken(shopDomain, sessionToken);
    const shop = await upsertShopWithSession({
      shopDomain,
      accessToken: exchange.access_token,
      scope: exchange.scope,
    });

    await runPostInstall(shop.id, shopDomain, exchange.access_token);

    captureProductEvent(shop.id, "shop_installed", { shopDomain });

    return jsonSuccess({ shopId: shop.id, shopDomain });
  });
}
