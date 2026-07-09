import type { GatewayProvider } from "@prisma/client";

import { prisma } from "@/lib/db";

/**
 * Records a successful webhook receipt on the gateway sync timeline.
 * @param gatewayId - Payment gateway id
 * @param eventType - Webhook event type
 */
export async function recordWebhookSuccess(
  gatewayId: string,
  eventType: string,
): Promise<void> {
  const now = new Date();
  await prisma.paymentGateway.update({
    where: { id: gatewayId },
    data: {
      lastWebhookAt: now,
      lastSuccessfulWebhookAt: now,
      lastSyncAt: now,
      webhookHealth: "HEALTHY",
      ...(eventType === "payout"
        ? { lastSettlementImportAt: now }
        : {}),
      ...(eventType === "refund" ? { lastRefundImportAt: now } : {}),
    },
  });
}

/**
 * Records a failed webhook on the gateway sync timeline.
 * @param gatewayId - Payment gateway id
 */
export async function recordWebhookFailure(gatewayId: string): Promise<void> {
  const now = new Date();
  await prisma.paymentGateway.update({
    where: { id: gatewayId },
    data: {
      lastWebhookAt: now,
      lastFailedWebhookAt: now,
      lastFailedEventAt: now,
      webhookHealth: "FAILED",
    },
  });
}

/**
 * Returns sync history fields for a shop/provider integration dashboard.
 * @param shopId - Target shop id
 * @param provider - Gateway provider
 * @returns Sync timeline or null when not configured
 */
export async function getGatewaySyncHistory(
  shopId: string,
  provider: GatewayProvider,
) {
  return prisma.paymentGateway.findUnique({
    where: { shopId_provider: { shopId, provider } },
    select: {
      id: true,
      provider: true,
      environment: true,
      connectionStatus: true,
      webhookHealth: true,
      connectedAt: true,
      disconnectedAt: true,
      lastSyncAt: true,
      lastWebhookAt: true,
      lastSuccessfulWebhookAt: true,
      lastFailedWebhookAt: true,
      lastSettlementImportAt: true,
      lastRefundImportAt: true,
      lastFailedEventAt: true,
    },
  });
}
