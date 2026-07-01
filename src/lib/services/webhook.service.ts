import { Prisma } from "@prisma/client";

import { WebhookVerificationError } from "@/lib/api/errors";
import { prisma } from "@/lib/db";
import {
  easebuzzIdempotencyKey,
  parseFormBody,
  verifyEasebuzzHash,
  type EasebuzzWebhookKind,
  type EasebuzzWebhookPayload,
} from "@/lib/easebuzz/webhooks";
import { inngest } from "@/lib/inngest/client";
import { deactivateShop } from "@/lib/services/shop.service";
import { mapWebhookOrder, upsertOrder } from "@/lib/services/order.service";
import { mapRefundPayload, upsertRefund } from "@/lib/services/refund.service";
import {
  mapSettlementPayload,
  upsertSettlement,
} from "@/lib/services/settlement.service";
import {
  getGatewayIdForShop,
  resolveGatewayByKey,
} from "@/lib/services/settings.service";
import {
  mapTransactionPayload,
  upsertTransaction,
} from "@/lib/services/transaction.service";

export type ShopifyWebhookInput = {
  topic: string;
  shopDomain: string;
  webhookId: string;
  rawBody: string;
};

export type EasebuzzWebhookInput = {
  kind: EasebuzzWebhookKind;
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
 *
 * Verification must happen before calling this. New deliveries enqueue an
 * Inngest job; duplicates are skipped (idempotent).
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
 * @throws {Error} Re-throws processing failures after marking the event FAILED
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
 * Verifies and persists an incoming Easebuzz webhook, then enqueues processing.
 *
 * Resolves the shop from the merchant key, verifies the hash (both before any
 * write), records the event idempotently, and enqueues async processing for
 * new deliveries.
 * @param input - Webhook channel plus raw form-urlencoded body
 * @returns Whether the delivery was a duplicate
 * @throws {WebhookVerificationError} When the key is unknown or the hash fails
 */
export async function handleEasebuzzWebhook(
  input: EasebuzzWebhookInput,
): Promise<{ duplicate: boolean }> {
  const payload = parseFormBody(input.rawBody);
  const gateway = await resolveGatewayByKey(payload.key ?? "");
  if (!gateway) {
    throw new WebhookVerificationError();
  }
  if (!verifyEasebuzzHash(input.kind, payload, gateway.salt)) {
    throw new WebhookVerificationError();
  }

  const { id, duplicate } = await recordWebhookEvent({
    source: "EASEBUZZ",
    eventType: input.kind,
    idempotencyKey: easebuzzIdempotencyKey(input.kind, payload),
    shopId: gateway.shopId,
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
 * Routes a persisted Easebuzz webhook payload to its domain handler.
 * @param shopId - Resolved shop id
 * @param kind - Webhook channel
 * @param payload - Stored webhook payload
 */
async function routeEasebuzzEvent(
  shopId: string,
  kind: EasebuzzWebhookKind,
  payload: EasebuzzWebhookPayload,
): Promise<void> {
  if (kind === "refund") {
    await upsertRefund(shopId, mapRefundPayload(payload));
    return;
  }
  const gatewayId = await getGatewayIdForShop(shopId);
  if (!gatewayId) {
    return;
  }
  if (kind === "transaction") {
    await upsertTransaction(shopId, gatewayId, mapTransactionPayload(payload));
    return;
  }
  await upsertSettlement(shopId, gatewayId, mapSettlementPayload(payload));
}

/**
 * Processes a persisted Easebuzz webhook event, updating its status lifecycle.
 * @param eventId - WebhookEvent id to process
 * @throws {Error} Re-throws processing failures after marking the event FAILED
 */
export async function processEasebuzzWebhook(eventId: string): Promise<void> {
  const event = await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { status: "PROCESSING" },
  });

  try {
    if (event.shopId) {
      await routeEasebuzzEvent(
        event.shopId,
        event.eventType as EasebuzzWebhookKind,
        event.payload as EasebuzzWebhookPayload,
      );
    }
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
    if (event.shopId) {
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
