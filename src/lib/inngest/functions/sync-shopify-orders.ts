import { inngest } from "@/lib/inngest/client";
import { reportInngestFailure } from "@/lib/inngest/on-failure";
import { syncShopifyOrders } from "@/lib/shopify/order-sync";

/**
 * Syncs a shop's Shopify orders. An initial sync omits `since`; an incremental
 * sync passes a timestamp to fetch only recently updated orders.
 */
export const syncShopifyOrdersFn = inngest.createFunction(
  { id: "sync-shopify-orders", retries: 3, onFailure: reportInngestFailure },
  { event: "shopify/sync.requested" },
  async ({ event }) => {
    const query = event.data.since
      ? `updated_at:>=${event.data.since}`
      : undefined;
    const count = await syncShopifyOrders(event.data.shopId, { query });
    return { shopId: event.data.shopId, count };
  },
);
