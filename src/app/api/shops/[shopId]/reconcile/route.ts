import { randomUUID } from "crypto";

import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { requireShopAccess } from "@/lib/auth/require-shop-access";
import { inngest } from "@/lib/inngest/client";
import { captureProductEvent } from "@/lib/monitoring/posthog";
import type { ReconcileTrigger } from "@/schemas/payments.schema";

const ROUTE = "/api/shops/[shopId]/reconcile";

type RouteContext = { params: Promise<{ shopId: string }> };

/**
 * Manually triggers reconciliation for a shop (async via Inngest). Requires ADMIN+.
 * @param _request - Incoming request (unused)
 * @param context - Route params containing the shop id
 * @returns Acknowledgement that reconciliation was queued
 */
export async function POST(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { shopId } = await context.params;

  return withErrorHandling(
    { requestId: randomUUID(), route: ROUTE, shopId },
    async () => {
      const access = await requireShopAccess(shopId, Role.ADMIN);
      await inngest.send({ name: "reconciliation/run", data: { shopId } });
      captureProductEvent(access.userId, "reconcile_triggered", { shopId });
      const payload: ReconcileTrigger = { queued: true };
      return jsonSuccess(payload);
    },
  );
}
