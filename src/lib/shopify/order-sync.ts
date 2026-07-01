import { NotFoundError } from "@/lib/api/errors";
import { decrypt } from "@/lib/crypto/encrypt";
import { prisma } from "@/lib/db";
import { mapGraphQLOrder, upsertOrder } from "@/lib/services/order.service";
import { adminGraphQL } from "@/lib/shopify/client";
import { ORDERS_QUERY, type OrdersQueryResult } from "@/lib/shopify/queries/orders";

export type OrderSyncOptions = {
  /** Optional Shopify search query, e.g. `updated_at:>=2026-01-01`. */
  query?: string;
};

/**
 * Syncs a shop's orders from the Shopify Admin GraphQL API.
 *
 * Pages through all matching orders and upserts each into `ShopifyOrder`.
 * An empty query performs an initial (full) sync; a date-filtered query
 * performs an incremental sync.
 * @param shopId - Shop to sync
 * @param options - Optional incremental query filter
 * @returns Number of orders upserted
 * @throws {NotFoundError} When the shop or its session is missing
 */
export async function syncShopifyOrders(
  shopId: string,
  options: OrderSyncOptions = {},
): Promise<number> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: { session: true },
  });
  if (!shop || !shop.session) {
    throw new NotFoundError("Shop session not found for sync");
  }

  const accessToken = decrypt(shop.session.accessToken);
  let cursor: string | null = null;
  let count = 0;

  do {
    const data: OrdersQueryResult = await adminGraphQL<OrdersQueryResult>(
      shop.shopDomain,
      accessToken,
      ORDERS_QUERY,
      { cursor, query: options.query },
    );

    for (const node of data.orders.nodes) {
      await upsertOrder(shopId, mapGraphQLOrder(node));
      count += 1;
    }

    cursor = data.orders.pageInfo.hasNextPage
      ? data.orders.pageInfo.endCursor
      : null;
  } while (cursor);

  return count;
}
