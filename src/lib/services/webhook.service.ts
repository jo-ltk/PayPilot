import { Prisma } from "@prisma/client";

import { WebhookVerificationError } from "@/lib/api/errors";
import { paymentGatewayRegistry } from "@/lib/gateways/index";
import { findShopGateway } from "@/lib/gateways/gateway-persistence";
import { prisma } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import {
  recordWebhookFailure,
  recordWebhookSuccess,
} from "@/lib/services/gateway-sync.service";
import { deactivateShop } from "@/lib/services/shop.service";
import { mapWebhookOrder, upsertOrder } from "@/lib/services/order.service";

export type ShopifyWebhookInput = {
  topic: string;
  shopDomain: string;
  webhookId: string;
  rawBody: string;
};

export type ProviderWebhookInput = {
  provider: "EASEBUZZ" | "RAZORPAY" | "CASHFREE";
  eventType: string;
  rawBody: string;
  headers: Headers;
};

/** @deprecated Use ProviderWebhookInput — kept for Easebuzz route compatibility. */
export type EasebuzzWebhookInput = {
  kind: "transaction" | "payout" | "refund";
  rawBody: string;
};

/**
 * Detects a Prisma unique-constraint violation (P2002).
 * @param error - Caught error value
 * @returns Whether the error is a unique-constraint violation
 */
function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/**
 * Persists a webhook event idempotently using its unique idempotency key.
 * @param data - WebhookEvent creation data
 * @returns The event id and whether it was a duplicate delivery
 */
async function recordWebhookEvent(
  data: Prisma.WebhookEventUncheckedCreateInput,
): Promise<{ id: string; duplicate: boolean }> {
  try {
    const event = await prisma.webhookEvent.create({ data });
    return { id: event.id, duplicate: false };
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }
    const existing = await prisma.webhookEvent.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
      select: { id: true },
    });
    return { id: existing?.id ?? "", duplicate: true };
  }
}

/**
 * Persists an incoming Shopify webhook and enqueues async processing.
 * @param input - Verified webhook headers plus raw body
 * @returns Whether the delivery was a duplicate
 */
export async function handleShopifyWebhook(
  input: ShopifyWebhookInput,
): Promise<{ duplicate: boolean }> {
  const payload: unknown = JSON.parse(input.rawBody);
  const shop = await prisma.shop.findUnique({
    where: { shopDomain: input.shopDomain },
    select: { id: true },
  });

  const { id, duplicate } = await recordWebhookEvent({
    source: "SHOPIFY",
    eventType: input.topic,
    idempotencyKey: `shopify:${input.webhookId}`,
    shopId: shop?.id ?? null,
    payload: payload as Prisma.InputJsonValue,
  });

  if (!duplicate) {
    await inngest.send({
      name: "shopify/webhook.received",
      data: { webhookEventId: id },
    });
  }

  return { duplicate };
}

/**
 * Routes a persisted Shopify webhook payload to its domain handler.
 * @param shopId - Resolved shop id (null when the shop is unknown)
 * @param topic - Shopify webhook topic
 * @param payload - Stored webhook payload
 */
async function routeShopifyTopic(
  shopId: string | null,
  topic: string,
  payload: unknown,
): Promise<void> {
  if (!shopId) {
    return;
  }
  switch (topic) {
    case "orders/paid":
    case "orders/updated":
      await upsertOrder(shopId, mapWebhookOrder(payload));
      return;
    case "app/uninstalled":
      await deactivateShop(shopId);
      return;
    default:
      return;
  }
}

/**
 * Processes a persisted webhook event, updating its status lifecycle.
 * @param eventId - WebhookEvent id to process
 */
export async function processShopifyWebhook(eventId: string): Promise<void> {
  const event = await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { status: "PROCESSING" },
  });

  try {
    await routeShopifyTopic(event.shopId, event.eventType, event.payload);
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
    if (event.shopId && event.eventType.startsWith("orders/")) {
      await inngest.send({
        name: "reconciliation/run",
        data: { shopId: event.shopId },
      });
    }
  } catch (error) {
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "FAILED", error: String(error) },
    });
    throw error;
  }
}

/**
 * Verifies and persists an incoming provider webhook via the adapter registry.
 * @param input - Provider, event type, raw body, and headers
 * @returns Whether the delivery was a duplicate
 */
export async function handleProviderWebhook(
  input: ProviderWebhookInput,
): Promise<{ duplicate: boolean }> {
  const adapter = paymentGatewayRegistry.get(input.provider);
  const resolved = await adapter.resolveWebhookTarget(
    input.rawBody,
    input.headers,
    input.eventType,
  );
  if (!resolved) {
    throw new WebhookVerificationError();
  }
  if (
    !adapter.verifyWebhook(
      input.rawBody,
      input.headers,
      resolved.verificationSecret,
      input.eventType,
    )
  ) {
    throw new WebhookVerificationError();
  }

  const payload = adapter.parseWebhookPayload(input.rawBody);
  const { id, duplicate } = await recordWebhookEvent({
    source: input.provider,
    eventType: input.eventType,
    idempotencyKey: adapter.buildIdempotencyKey(input.eventType, payload),
    shopId: resolved.shopId,
    payload: payload as Prisma.InputJsonValue,
  });

  if (!duplicate) {
    await inngest.send({
      name: "easebuzz/webhook.received",
      data: { webhookEventId: id },
    });
  }

  return { duplicate };
}

/**
 * Verifies and persists an incoming Easebuzz webhook.
 * @param input - Webhook channel plus raw form-urlencoded body
 * @returns Whether the delivery was a duplicate
 */
export async function handleEasebuzzWebhook(
  input: EasebuzzWebhookInput,
): Promise<{ duplicate: boolean }> {
  return handleProviderWebhook({
    provider: "EASEBUZZ",
    eventType: input.kind,
    rawBody: input.rawBody,
    headers: new Headers(),
  });
}

/**
 * Processes a persisted Easebuzz webhook event via the adapter registry.
 * @param eventId - WebhookEvent id to process
 */
export async function processEasebuzzWebhook(eventId: string): Promise<void> {
  const event = await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { status: "PROCESSING" },
  });

  const gateway =
    event.shopId && event.source === "EASEBUZZ"
      ? await findShopGateway(event.shopId, "EASEBUZZ")
      : null;

  try {
    if (event.shopId && event.source !== "SHOPIFY") {
      const adapter = paymentGatewayRegistry.get(event.source);
      await adapter.processWebhook({
        shopId: event.shopId,
        gatewayId: gateway?.id ?? "",
        eventType: event.eventType,
        payload: event.payload,
      });
    }
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
    if (gateway) {
      await recordWebhookSuccess(gateway.id, event.eventType);
    }
    if (event.shopId) {
      await inngest.send({
        name: "reconciliation/run",
        data: { shopId: event.shopId },
      });
    }
  } catch (error) {
    if (gateway) {
      await recordWebhookFailure(gateway.id);
    }
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "FAILED", error: String(error) },
    });
    throw error;
  }
}
