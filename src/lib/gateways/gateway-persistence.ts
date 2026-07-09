import { GatewayProvider, type PaymentGateway } from "@prisma/client";

import { prisma } from "@/lib/db";

import { decryptCredentials } from "./credentials";

/**
 * Finds an active gateway for a shop and provider.
 * @param shopId - Target shop id
 * @param provider - Gateway provider
 * @returns Gateway record or null
 */
export async function findShopGateway(
  shopId: string,
  provider: GatewayProvider,
): Promise<PaymentGateway | null> {
  return prisma.paymentGateway.findUnique({
    where: { shopId_provider: { shopId, provider } },
  });
}

/**
 * Lists all active gateways for a provider.
 * @param provider - Gateway provider
 * @returns Active gateway records
 */
export async function listActiveGateways(
  provider: GatewayProvider,
): Promise<PaymentGateway[]> {
  return prisma.paymentGateway.findMany({
    where: { provider, isActive: true },
  });
}

/**
 * Decrypts credentials for a stored gateway record.
 * @param gateway - Payment gateway row
 * @returns Plaintext credentials object
 */
export function readGatewayCredentials(
  gateway: PaymentGateway,
): Record<string, string> {
  return decryptCredentials(gateway.credentials);
}

/**
 * Returns the gateway id for a shop/provider when configured.
 * @param shopId - Target shop id
 * @param provider - Gateway provider
 * @returns Gateway id or null
 */
export async function getGatewayId(
  shopId: string,
  provider: GatewayProvider,
): Promise<string | null> {
  const gateway = await findShopGateway(shopId, provider);
  return gateway?.id ?? null;
}
