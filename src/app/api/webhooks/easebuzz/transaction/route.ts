import { createEasebuzzWebhookPost } from "@/lib/easebuzz/webhook-route";

/** Receives Easebuzz transaction webhooks. */
export const POST = createEasebuzzWebhookPost("transaction");
