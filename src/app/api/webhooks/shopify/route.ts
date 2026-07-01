import { randomUUID } from "crypto";

import type { NextRequest } from "next/server";

import { WebhookVerificationError } from "@/lib/api/errors";
import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { handleShopifyWebhook } from "@/lib/services/webhook.service";
import { verifyShopifyHmac } from "@/lib/shopify/webhooks";

const ROUTE = "/api/webhooks/shopify";

/**
 * Receives Shopify webhooks: verifies HMAC, persists idempotently, returns 200.
 *
 * The raw body is read before parsing for signature verification. Processing is
 * handed off to Inngest so the route always responds quickly.
 * @param request - Incoming Shopify webhook request
 * @returns 200 acknowledgement (or 401 on signature failure)
 */
export async function POST(request: NextRequest): Promise<Response> {
  const requestId = randomUUID();

  return withErrorHandling({ requestId, route: ROUTE }, async () => {
    const rawBody = await request.text();
    const hmac = request.headers.get("x-shopify-hmac-sha256") ?? "";
    if (!verifyShopifyHmac(rawBody, hmac)) {
      throw new WebhookVerificationError();
    }

    const result = await handleShopifyWebhook({
      topic: request.headers.get("x-shopify-topic") ?? "",
      shopDomain: request.headers.get("x-shopify-shop-domain") ?? "",
      webhookId: request.headers.get("x-shopify-webhook-id") ?? "",
      rawBody,
    });

    return jsonSuccess({ received: true, duplicate: result.duplicate });
  });
}
