import {
  GatewayEnvironment,
  GatewayProvider,
  MatchingStrategy,
  OnboardingStep,
  Role,
} from "@prisma/client";

import {
  generateCommerceData,
} from "./seed-transactions";
import {
  getSeedVolume,
  SEED_REFERENCE_DATE,
} from "./seed-types";
import { createRng } from "./seed-rng";

/**
 * Deterministic identifiers shared across seed records so relations link up
 * without depending on database-generated ids.
 */
export const SEED_IDS = {
  shop: "seed_shop_demo",
  user: "seed_user_owner",
  member: "seed_member_owner",
  gateway: "seed_gateway_easebuzz",
  matchingConfig: "seed_matching_demo",
} as const;

/** Plaintext demo Easebuzz credentials — encrypted by {@link prisma/seed.ts} before persist. */
export const DEMO_GATEWAY_SECRETS = {
  key: "demo-merchant-key-1234",
  salt: "demo-merchant-salt-5678",
} as const;

export type SeedData = ReturnType<typeof buildSeedData>;

/**
 * Builds the complete demo dataset for seeding.
 *
 * Pure function with no I/O so it can be unit tested for referential and
 * money-balance integrity before being written to the database.
 * @returns Structured seed records keyed by model
 */
export function buildSeedData() {
  const now = SEED_REFERENCE_DATE;
  const volume = getSeedVolume();
  const rng = createRng(42);
  const commerce = generateCommerceData(
    SEED_IDS.shop,
    SEED_IDS.gateway,
    SEED_IDS.user,
    volume,
    rng,
  );

  return {
    shop: {
      id: SEED_IDS.shop,
      shopDomain: "settleflow-demo.myshopify.com",
      shopName: "PayPilot Demo Store",
      currency: "INR",
      timezone: "Asia/Kolkata",
      isActive: true,
      onboardingStep: OnboardingStep.COMPLETE,
    },
    user: {
      id: SEED_IDS.user,
      email: "owner@settleflow-demo.test",
      // bcrypt hash of "password123" (cost 12) — demo only.
      passwordHash:
        "$2b$12$bqMyUW2oCOOzY9LWnP8TleGPnz7vRGFC5I0WzpWX3oCe5TKLI4n2.",
      name: "Demo Owner",
    },
    member: {
      id: SEED_IDS.member,
      shopId: SEED_IDS.shop,
      userId: SEED_IDS.user,
      role: Role.OWNER,
      acceptedAt: now,
    },
    gateway: {
      id: SEED_IDS.gateway,
      shopId: SEED_IDS.shop,
      provider: GatewayProvider.EASEBUZZ,
      merchantEmail: "merchant@settleflow-demo.test",
      environment: GatewayEnvironment.SANDBOX,
      isActive: true,
    },
    matchingConfig: {
      id: SEED_IDS.matchingConfig,
      shopId: SEED_IDS.shop,
      strategy: MatchingStrategy.COMPOSITE,
      priority: ["UDF_ORDER_ID", "TXNID_ORDER_NAME"],
      fieldMapping: { orderId: "udf1", orderName: "txnid" },
      amountTolerancePaise: 0,
      includeGatewayFees: false,
    },
    orders: commerce.orders,
    transactions: commerce.transactions,
    settlements: commerce.settlements,
    lineItems: commerce.lineItems,
    refunds: commerce.refunds,
    reconciliations: commerce.reconciliations,
    webhookEvents: commerce.webhookEvents,
    meta: {
      transactionCount: commerce.transactions.length,
      orderCount: commerce.orders.length,
      settlementCount: commerce.settlements.length,
      refundCount: commerce.refunds.length,
      reconciliationCount: commerce.reconciliations.length,
      webhookEventCount: commerce.webhookEvents.length,
      volume,
    },
  };
}
