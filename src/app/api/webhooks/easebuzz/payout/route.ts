import { createEasebuzzWebhookPost } from "@/lib/easebuzz/webhook-route";

/** Receives Easebuzz payout/settlement webhooks. */
export const POST = createEasebuzzWebhookPost("payout");
