import { inngest } from "@/lib/inngest/client";
import { reportInngestFailure } from "@/lib/inngest/on-failure";
import { processShopifyWebhook } from "@/lib/services/webhook.service";

/**
 * Processes a persisted Shopify webhook asynchronously with retries.
 */
export const processShopifyWebhookFn = inngest.createFunction(
  { id: "process-shopify-webhook", retries: 3, onFailure: reportInngestFailure },
  { event: "shopify/webhook.received" },
  async ({ event }) => {
    await processShopifyWebhook(event.data.webhookEventId);
    return { webhookEventId: event.data.webhookEventId };
  },
);
