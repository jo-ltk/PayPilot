import { randomUUID } from "crypto";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { withErrorHandling } from "@/lib/api/response";
import type { EasebuzzWebhookKind } from "@/lib/easebuzz/webhooks";
import { handleEasebuzzWebhook } from "@/lib/services/webhook.service";

/**
 * Builds a thin Easebuzz webhook POST handler for a given channel.
 *
 * Reads the raw form-urlencoded body, hands off verification + persistence to
 * the webhook service, and always returns a plain `200` (Easebuzz requires a
 * fast acknowledgement; processing happens asynchronously via Inngest).
 * @param kind - Webhook channel this route serves
 * @returns A Next.js route POST handler
 */
export function createEasebuzzWebhookPost(
  kind: EasebuzzWebhookKind,
): (request: NextRequest) => Promise<Response> {
  const route = `/api/webhooks/easebuzz/${kind}`;
  return async (request: NextRequest): Promise<Response> =>
    withErrorHandling({ requestId: randomUUID(), route }, async () => {
      const rawBody = await request.text();
      await handleEasebuzzWebhook({ kind, rawBody });
      return new NextResponse(null, { status: 200 });
    });
}
