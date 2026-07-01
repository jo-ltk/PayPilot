import { inngest } from "@/lib/inngest/client";
import { reportInngestFailure } from "@/lib/inngest/on-failure";
import { processEasebuzzWebhook } from "@/lib/services/webhook.service";

/**
 * Processes a persisted Easebuzz webhook asynchronously with retries.
 */
export const processEasebuzzWebhookFn = inngest.createFunction(
  { id: "process-easebuzz-webhook", retries: 3, onFailure: reportInngestFailure },
  { event: "easebuzz/webhook.received" },
  async ({ event }) => {
    await processEasebuzzWebhook(event.data.webhookEventId);
    return { webhookEventId: event.data.webhookEventId };
  },
);
