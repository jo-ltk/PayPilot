import { randomUUID } from "crypto";

import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { createInvite } from "@/lib/auth/invite";
import { requireShopAccess } from "@/lib/auth/require-shop-access";
import { inviteSchema } from "@/schemas/auth.schema";

const ROUTE = "/api/shops/[shopId]/settings/invite";

type RouteContext = { params: Promise<{ shopId: string }> };

/**
 * Invites a team member to a shop. Requires ADMIN or OWNER.
 * @param request - Incoming invite request
 * @param context - Route params containing the shop id
 * @returns The generated invite token
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { shopId } = await context.params;

  return withErrorHandling(
    { requestId: randomUUID(), route: ROUTE, shopId },
    async () => {
      await requireShopAccess(shopId, Role.ADMIN);
      const { email, role } = await parseJsonBody(request, inviteSchema);
      const { inviteToken } = await createInvite({ shopId, email, role });
      return jsonSuccess({ inviteToken });
    },
  );
}
