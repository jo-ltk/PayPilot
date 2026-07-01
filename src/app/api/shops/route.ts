import { randomUUID } from "crypto";

import { AuthError } from "@/lib/api/errors";
import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { getCurrentSession } from "@/lib/auth/require-shop-access";
import { listShopsByIds, toShopView } from "@/lib/services/shop.service";

const ROUTE = "/api/shops";

/**
 * Lists the shops the current user is a member of. Requires authentication.
 * @returns Shop summaries for the current user
 */
export async function GET(): Promise<Response> {
  return withErrorHandling({ requestId: randomUUID(), route: ROUTE }, async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw new AuthError("Authentication required");
    }
    const shopIds = session.memberships.map((m) => m.shopId);
    const shops = await listShopsByIds(shopIds);
    return jsonSuccess(shops.map(toShopView));
  });
}
