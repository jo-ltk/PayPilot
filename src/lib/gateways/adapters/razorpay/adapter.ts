import { GatewayProvider } from "@prisma/client";
import { z } from "zod";

import { ValidationError } from "@/lib/api/errors";
import { getEnv } from "@/lib/env";

import { maskCredentialRecord } from "../../credentials";
import { paymentGatewayRegistry } from "../../registry";
import type { PaymentGatewayAdapter } from "../../types";

const razorpayCredentialsSchema = z.object({
  keyId: z.string().min(1),
  keySecret: z.string().min(1),
});

/** Razorpay payment gateway adapter (connection + webhook foundation). */
export const razorpayAdapter: PaymentGatewayAdapter = {
  provider: GatewayProvider.RAZORPAY,

  getCredentialSchema() {
    return razorpayCredentialsSchema;
  },

  maskCredentials(credentials) {
    return maskCredentialRecord(credentials);
  },

  async testConnection(credentials) {
    razorpayCredentialsSchema.parse(credentials);
    throw new ValidationError(
      "Razorpay connection test is not yet implemented",
    );
  },

  getWebhookUrls() {
    const base = `${getEnv().HOST ?? ""}/api/webhooks/razorpay`;
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
    return `razorpay:${body.event ?? "unknown"}:${body.id ?? body.created_at ?? "0"}`;
  },

  parseWebhookPayload(rawBody) {
    return JSON.parse(rawBody) as unknown;
  },

  async processWebhook() {
    throw new ValidationError("Razorpay webhook processing is not yet implemented");
  },
};

paymentGatewayRegistry.register(razorpayAdapter);
