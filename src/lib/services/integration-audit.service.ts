import type { GatewayProvider, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

/** Allowed integration audit actions. */
export type IntegrationAuditAction =
  | "CONNECT"
  | "DISCONNECT"
  | "TEST_CONNECTION"
  | "VERIFY_WEBHOOK"
  | "TEST_WEBHOOK"
  | "WEBHOOK_RECEIVED"
  | "WEBHOOK_PROCESSED"
  | "WEBHOOK_FAILED";

/**
 * Records an integration audit log entry with masked metadata only.
 * @param input - Audit log fields
 */
export async function logIntegrationAction(input: {
  shopId: string;
  gatewayId?: string;
  provider: GatewayProvider;
  action: IntegrationAuditAction;
  actorId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.integrationAuditLog.create({
    data: {
      shopId: input.shopId,
      gatewayId: input.gatewayId,
      provider: input.provider,
      action: input.action,
      actorId: input.actorId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
