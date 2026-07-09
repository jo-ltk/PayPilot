import {
  ConnectionStatus,
  GatewayProvider,
  type PaymentGateway,
} from "@prisma/client";

import { NotFoundError } from "@/lib/api/errors";
import { encrypt } from "@/lib/crypto/encrypt";
import {
  decryptCredentials,
  encryptCredentials,
  maskCredentialRecord,
} from "@/lib/gateways/credentials";
import { findShopGateway } from "@/lib/gateways/gateway-persistence";
import { paymentGatewayRegistry } from "@/lib/gateways/index";
import { prisma } from "@/lib/db";
import type { EasebuzzCredentials } from "@/lib/easebuzz/types";
import { logIntegrationAction } from "@/lib/services/integration-audit.service";
import {
  matchingConfigViewSchema,
  type MaskedGateway,
  type MatchingConfigView,
  type SettingsResponse,
  type SettingsUpdateInput,
} from "@/schemas/settings.schema";

/**
 * Masks a secret, revealing only its last four characters.
 * @param value - Plaintext secret
 * @returns Masked representation, e.g. `****abcd`
 */
export function maskSecret(value: string): string {
  if (value.length <= 4) {
    return "****";
  }
  return `****${value.slice(-4)}`;
}

/**
 * Projects a stored gateway into a masked, secret-free view.
 * @param gateway - PaymentGateway record
 * @returns Masked gateway view
 */
function toMaskedGateway(gateway: PaymentGateway): MaskedGateway {
  const adapter = paymentGatewayRegistry.get(gateway.provider);
  const credentials = decryptCredentials(gateway.credentials);

  return {
    id: gateway.id,
    provider: gateway.provider,
    credentialsMasked: adapter.maskCredentials(credentials),
    environment: gateway.environment,
    isActive: gateway.isActive,
    connectionStatus: gateway.connectionStatus,
    webhookHealth: gateway.webhookHealth,
    connectedAt: gateway.connectedAt?.toISOString() ?? null,
    lastWebhookAt: gateway.lastWebhookAt?.toISOString() ?? null,
  };
}

/**
 * Coerces a stored matching config into its typed view.
 * @param config - MatchingConfig record fields
 * @returns Matching config view
 */
function toMatchingView(config: {
  strategy: MatchingConfigView["strategy"];
  priority: unknown;
  fieldMapping: unknown;
  amountTolerancePaise: number;
  includeGatewayFees: boolean;
}): MatchingConfigView {
  return matchingConfigViewSchema.parse(config);
}

const DEFAULT_PROVIDER = GatewayProvider.EASEBUZZ;

/**
 * Reads a shop's settings with gateway secrets masked.
 * @param shopId - Target shop id
 * @returns Masked gateway plus matching config (nulls when unconfigured)
 */
export async function getSettings(shopId: string): Promise<SettingsResponse> {
  const [gateway, matching] = await Promise.all([
    findShopGateway(shopId, DEFAULT_PROVIDER),
    prisma.matchingConfig.findUnique({ where: { shopId } }),
  ]);

  return {
    gateway: gateway ? toMaskedGateway(gateway) : null,
    matching: matching ? toMatchingView(matching) : null,
  };
}

/**
 * Persists a gateway update with encrypted credentials JSON.
 * @param shopId - Target shop id
 * @param input - Validated gateway payload
 */
async function saveGateway(
  shopId: string,
  input: NonNullable<SettingsUpdateInput["gateway"]>,
): Promise<void> {
  const provider = input.provider ?? DEFAULT_PROVIDER;
  const adapter = paymentGatewayRegistry.get(provider);
  const credentials = adapter.getCredentialSchema().parse(input.credentials);

  const data = {
    credentials: encryptCredentials(credentials),
    environment: input.environment,
    isActive: input.isActive ?? true,
    connectionStatus: ConnectionStatus.CONNECTED,
    connectedAt: new Date(),
    disconnectedAt: null,
  };

  const existing = await findShopGateway(shopId, provider);

  if (existing) {
    await prisma.paymentGateway.update({ where: { id: existing.id }, data });
    await logIntegrationAction({
      shopId,
      gatewayId: existing.id,
      provider,
      action: "CONNECT",
      metadata: { environment: input.environment },
    });
    return;
  }

  const created = await prisma.paymentGateway.create({
    data: { shopId, provider, ...data },
  });

  await logIntegrationAction({
    shopId,
    gatewayId: created.id,
    provider,
    action: "CONNECT",
    metadata: { environment: input.environment },
  });
}

/**
 * Persists a matching config update.
 * @param shopId - Target shop id
 * @param input - Validated matching payload
 */
async function saveMatching(
  shopId: string,
  input: NonNullable<SettingsUpdateInput["matching"]>,
): Promise<void> {
  await prisma.matchingConfig.upsert({
    where: { shopId },
    update: input,
    create: { shopId, ...input },
  });
}

/**
 * Updates a shop's gateway and/or matching settings.
 * @param shopId - Target shop id
 * @param input - Validated settings payload (at least one section)
 * @returns Refreshed settings with secrets masked
 */
export async function updateSettings(
  shopId: string,
  input: SettingsUpdateInput,
): Promise<SettingsResponse> {
  if (input.gateway) {
    await saveGateway(shopId, input.gateway);
  }
  if (input.matching) {
    await saveMatching(shopId, input.matching);
  }
  return getSettings(shopId);
}

/** A gateway resolved from a webhook lookup, with verification secret. */
export type ResolvedGateway = {
  id: string;
  shopId: string;
  provider: GatewayProvider;
  verificationSecret: string;
};

/**
 * Resolves the active Easebuzz gateway matching a webhook's merchant `key`.
 * @param key - Plaintext merchant key from the webhook payload
 * @returns The matching gateway with decrypted salt, or null when none match
 */
export async function resolveGatewayByKey(
  key: string,
): Promise<ResolvedGateway | null> {
  const adapter = paymentGatewayRegistry.get(GatewayProvider.EASEBUZZ);
  const resolved = await adapter.resolveWebhookTarget(
    new URLSearchParams({ key }).toString(),
    new Headers(),
    "transaction",
  );
  if (!resolved) {
    return null;
  }
  return {
    id: resolved.gatewayId,
    shopId: resolved.shopId,
    provider: GatewayProvider.EASEBUZZ,
    verificationSecret: resolved.verificationSecret,
  };
}

/**
 * Returns the active Easebuzz gateway id for a shop, if configured.
 * @param shopId - Target shop id
 * @returns Gateway id, or null when not configured
 */
export async function getGatewayIdForShop(
  shopId: string,
): Promise<string | null> {
  const gateway = await findShopGateway(shopId, DEFAULT_PROVIDER);
  return gateway?.id ?? null;
}

/**
 * Loads decrypted Easebuzz credentials for a shop.
 * @param shopId - Target shop id
 * @returns Decrypted credentials
 * @throws {NotFoundError} When no gateway is configured
 */
export async function getGatewayCredentials(
  shopId: string,
): Promise<EasebuzzCredentials> {
  const gateway = await findShopGateway(shopId, DEFAULT_PROVIDER);
  if (!gateway) {
    throw new NotFoundError("Gateway not configured for this shop");
  }
  const credentials = decryptCredentials(gateway.credentials);
  return {
    key: credentials.key,
    salt: credentials.salt,
    merchantEmail: credentials.merchantEmail,
    environment: gateway.environment,
  };
}

/**
 * Encrypts a webhook secret for at-rest storage.
 * @param secret - Plaintext webhook secret
 * @returns Encrypted secret string
 */
export function encryptWebhookSecret(secret: string): string {
  return encrypt(secret);
}
