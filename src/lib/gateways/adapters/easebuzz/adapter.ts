import { GatewayProvider } from "@prisma/client";

import { getEnv } from "@/lib/env";
import { validateCredentials } from "@/lib/easebuzz/client";
import {
  easebuzzIdempotencyKey,
  parseFormBody,
  verifyEasebuzzHash,
  type EasebuzzWebhookKind,
  type EasebuzzWebhookPayload,
} from "@/lib/easebuzz/webhooks";
import { mapRefundPayload, upsertRefund } from "@/lib/services/refund.service";
import {
  mapSettlementPayload,
  upsertSettlement,
} from "@/lib/services/settlement.service";
import {
  mapTransactionPayload,
  upsertTransaction,
} from "@/lib/services/transaction.service";

import { maskCredentialRecord } from "../../credentials";
import {
  getGatewayId,
  listActiveGateways,
  readGatewayCredentials,
} from "../../gateway-persistence";
import { paymentGatewayRegistry } from "../../registry";
import type {
  PaymentGatewayAdapter,
  WebhookProcessContext,
  WebhookResolveResult,
  WebhookUrlSet,
} from "../../types";
import { easebuzzCredentialsSchema } from "./credentials.schema";

/**
 * Resolves an Easebuzz gateway by matching the merchant key in the webhook payload.
 * @param key - Plaintext merchant key from the webhook
 * @returns Gateway id, shop id, and salt for hash verification
 */
async function resolveByMerchantKey(
  key: string,
): Promise<WebhookResolveResult | null> {
  const gateways = await listActiveGateways(GatewayProvider.EASEBUZZ);
  for (const gateway of gateways) {
    const credentials = readGatewayCredentials(gateway);
    if (credentials.key === key) {
      return {
        gatewayId: gateway.id,
        shopId: gateway.shopId,
        verificationSecret: credentials.salt,
      };
    }
  }
  return null;
}

/**
 * Routes a verified Easebuzz webhook to domain handlers.
 * @param context - Verified webhook processing context
 */
async function routeEasebuzzEvent(context: WebhookProcessContext): Promise<void> {
  const kind = context.eventType as EasebuzzWebhookKind;
  const payload = context.payload as EasebuzzWebhookPayload;

  if (kind === "refund") {
    await upsertRefund(context.shopId, mapRefundPayload(payload));
    return;
  }

  const gatewayId = await getGatewayId(context.shopId, GatewayProvider.EASEBUZZ);
  if (!gatewayId) {
    return;
  }

  if (kind === "transaction") {
    await upsertTransaction(
      context.shopId,
      gatewayId,
      mapTransactionPayload(payload),
    );
    return;
  }

  await upsertSettlement(
    context.shopId,
    gatewayId,
    mapSettlementPayload(payload),
  );
}

/** Easebuzz payment gateway adapter. */
export const easebuzzAdapter: PaymentGatewayAdapter = {
  provider: GatewayProvider.EASEBUZZ,

  getCredentialSchema() {
    return easebuzzCredentialsSchema;
  },

  maskCredentials(credentials) {
    const masked = maskCredentialRecord(credentials);
    return {
      ...masked,
      merchantEmail: credentials.merchantEmail,
    };
  },

  async testConnection(credentials, environment) {
    const parsed = easebuzzCredentialsSchema.parse(credentials);
    return validateCredentials({
      key: parsed.key,
      salt: parsed.salt,
      merchantEmail: parsed.merchantEmail,
      environment,
    });
  },

  getWebhookUrls(): WebhookUrlSet {
    const base = `${getEnv().HOST ?? ""}/api/webhooks/easebuzz`;
    return {
      transaction: `${base}/transaction`,
      payout: `${base}/payout`,
      refund: `${base}/refund`,
    };
  },

  async resolveWebhookTarget(rawBody, _headers, _eventType) {
    const payload = parseFormBody(rawBody);
    return resolveByMerchantKey(payload.key ?? "");
  },

  verifyWebhook(rawBody, _headers, verificationSecret, eventType) {
    const payload = parseFormBody(rawBody);
    return verifyEasebuzzHash(
      eventType as EasebuzzWebhookKind,
      payload,
      verificationSecret,
    );
  },

  buildIdempotencyKey(eventType, payload) {
    return easebuzzIdempotencyKey(
      eventType as EasebuzzWebhookKind,
      payload as EasebuzzWebhookPayload,
    );
  },

  parseWebhookPayload(rawBody) {
    return parseFormBody(rawBody);
  },

  async processWebhook(context) {
    await routeEasebuzzEvent(context);
  },
};

paymentGatewayRegistry.register(easebuzzAdapter);
