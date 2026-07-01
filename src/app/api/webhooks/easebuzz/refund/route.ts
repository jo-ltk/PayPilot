import { createEasebuzzWebhookPost } from "@/lib/easebuzz/webhook-route";

/** Receives Easebuzz refund webhooks. */
export const POST = createEasebuzzWebhookPost("refund");
