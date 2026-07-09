import { GatewayProvider } from "@prisma/client";
import { z } from "zod";

import { ValidationError } from "@/lib/api/errors";
import { getEnv } from "@/lib/env";

import { maskCredentialRecord } from "../../credentials";
import { paymentGatewayRegistry } from "../../registry";
import type { PaymentGatewayAdapter } from "../../types";

const cashfreeCredentialsSchema = z.object({
  appId: z.string().min(1),
  secretKey: z.string().min(1),
});

/** Cashfree payment gateway adapter (connection + webhook foundation). */
export const cashfreeAdapter: PaymentGatewayAdapter = {
  provider: GatewayProvider.CASHFREE,

  getCredentialSchema() {
    return cashfreeCredentialsSchema;
  },

  maskCredentials(credentials) {
    return maskCredentialRecord(credentials);
  },

  async testConnection(credentials) {
    cashfreeCredentialsSchema.parse(credentials);
    throw new ValidationError(
      "Cashfree connection test is not yet implemented",
    );
  },

  getWebhookUrls() {
    const base = `${getEnv().HOST ?? ""}/api/webhooks/cashfree`;
    return { default: base };
  },

  async resolveWebhookTarget() {
    return null;
  },

  verifyWebhook() {
    return false;
  },

  buildIdempotencyKey(_eventType, payload) {
    const body = payload as Record<string, string>;
    return `cashfree:${body.type ?? "unknown"}:${body.orderId ?? body.cf_payment_id ?? "0"}`;
  },

  parseWebhookPayload(rawBody) {
    return JSON.parse(rawBody) as unknown;
  },

  async processWebhook() {
    throw new ValidationError("Cashfree webhook processing is not yet implemented");
  },
};

paymentGatewayRegistry.register(cashfreeAdapter);
