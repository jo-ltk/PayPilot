import { GatewayProvider, type PaymentGateway } from "@prisma/client";

import { NotFoundError } from "@/lib/api/errors";
import { decrypt, encrypt } from "@/lib/crypto/encrypt";
import { prisma } from "@/lib/db";
import type { EasebuzzCredentials } from "@/lib/easebuzz/types";
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
  return {
    id: gateway.id,
    provider: gateway.provider,
    keyMasked: maskSecret(decrypt(gateway.key)),
    saltMasked: maskSecret(decrypt(gateway.salt)),
    merchantEmail: gateway.merchantEmail,
    environment: gateway.environment,
    isActive: gateway.isActive,
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

/**
 * Finds the Easebuzz gateway configured for a shop.
 * @param shopId - Target shop id
 * @returns The gateway record, or null when not configured
 */
async function findGateway(shopId: string): Promise<PaymentGateway | null> {
  return prisma.paymentGateway.findFirst({
    where: { shopId, provider: GatewayProvider.EASEBUZZ },
  });
}

/**
 * Reads a shop's settings with gateway secrets masked.
 * @param shopId - Target shop id
 * @returns Masked gateway plus matching config (nulls when unconfigured)
 */
export async function getSettings(shopId: string): Promise<SettingsResponse> {
  const [gateway, matching] = await Promise.all([
    findGateway(shopId),
    prisma.matchingConfig.findUnique({ where: { shopId } }),
  ]);

  return {
    gateway: gateway ? toMaskedGateway(gateway) : null,
    matching: matching ? toMatchingView(matching) : null,
  };
}

/**
 * Persists a gateway update, encrypting key/salt at rest.
 * @param shopId - Target shop id
 * @param input - Validated gateway payload
 */
async function saveGateway(
  shopId: string,
  input: NonNullable<SettingsUpdateInput["gateway"]>,
): Promise<void> {
  const data = {
    key: encrypt(input.key),
    salt: encrypt(input.salt),
    merchantEmail: input.merchantEmail,
    environment: input.environment,
    isActive: input.isActive ?? true,
  };
  const existing = await findGateway(shopId);

  if (existing) {
    await prisma.paymentGateway.update({ where: { id: existing.id }, data });
    return;
  }
  await prisma.paymentGateway.create({
    data: { shopId, provider: GatewayProvider.EASEBUZZ, ...data },
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

/** A gateway resolved from a webhook's merchant key, with decrypted salt. */
export type ResolvedGateway = { id: string; shopId: string; salt: string };

/**
 * Resolves the active Easebuzz gateway matching a webhook's merchant `key`.
 *
 * Stored keys are encrypted with a random IV, so they cannot be queried
 * directly; active gateways are scanned and their decrypted keys compared.
 * @param key - Plaintext merchant key from the webhook payload
 * @returns The matching gateway with decrypted salt, or null when none match
 */
export async function resolveGatewayByKey(
  key: string,
): Promise<ResolvedGateway | null> {
  const gateways = await prisma.paymentGateway.findMany({
    where: { provider: GatewayProvider.EASEBUZZ, isActive: true },
  });
  for (const gateway of gateways) {
    if (decrypt(gateway.key) === key) {
      return { id: gateway.id, shopId: gateway.shopId, salt: decrypt(gateway.salt) };
    }
  }
  return null;
}

/**
 * Returns the active Easebuzz gateway id for a shop, if configured.
 * @param shopId - Target shop id
 * @returns Gateway id, or null when not configured
 */
export async function getGatewayIdForShop(
  shopId: string,
): Promise<string | null> {
  const gateway = await findGateway(shopId);
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
  const gateway = await findGateway(shopId);
  if (!gateway) {
    throw new NotFoundError("Gateway not configured for this shop");
  }
  return {
    key: decrypt(gateway.key),
    salt: decrypt(gateway.salt),
    merchantEmail: gateway.merchantEmail,
    environment: gateway.environment,
  };
}
