import {
  GatewayEnvironment,
  GatewayProvider,
  MatchingStrategy,
  OnboardingStep,
  ReconciliationStatus,
  Role,
  SettlementStatus,
  WebhookSource,
  WebhookStatus,
} from "@prisma/client";

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
  order: "seed_order_1001",
  transaction: "seed_txn_1001",
  settlement: "seed_settlement_1",
  lineItem: "seed_lineitem_1",
  refund: "seed_refund_1",
  reconciliation: "seed_recon_1",
  webhookEvent: "seed_webhook_1",
} as const;

const GROSS_PAISE = 150000;
const FEES_PAISE = 3000;
const NET_PAISE = GROSS_PAISE - FEES_PAISE;

export type SeedData = ReturnType<typeof buildSeedData>;

/**
 * Builds the complete demo dataset for seeding.
 *
 * Pure function with no I/O so it can be unit tested for referential and
 * money-balance integrity before being written to the database.
 * @returns Structured seed records keyed by model
 */
export function buildSeedData() {
  const now = new Date("2026-01-15T10:00:00.000Z");

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
        "$2b$12$8Q9b3w8m1xqg0rT0Y2W1auQk4y6E3s7n0qkJ7r9oQ8wZ1m2N3oQy",
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
      // Encrypted-at-rest in real flow; placeholder ciphertext for seed.
      key: "enc:demo-key",
      salt: "enc:demo-salt",
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
    order: {
      id: SEED_IDS.order,
      shopId: SEED_IDS.shop,
      shopifyOrderId: "6543210001",
      orderName: "#1001",
      orderNumber: 1001,
      totalPricePaise: GROSS_PAISE,
      currency: "INR",
      financialStatus: "paid",
      paymentGatewayNames: ["Easebuzz"],
      shopifyPaymentId: "gid://shopify/PaymentTransaction/1001",
      processedAt: now,
      rawPayload: { id: "6543210001", name: "#1001" },
    },
    transaction: {
      id: SEED_IDS.transaction,
      shopId: SEED_IDS.shop,
      gatewayId: SEED_IDS.gateway,
      easebuzzTxnId: "EZTXN1001",
      easebuzzPaymentId: "EZPAY1001",
      amountPaise: GROSS_PAISE,
      feesPaise: FEES_PAISE,
      netAmountPaise: NET_PAISE,
      currency: "INR",
      status: "success",
      mode: "UPI",
      email: "buyer@settleflow-demo.test",
      phone: "9000000000",
      txnid: "#1001",
      udf1: "6543210001",
      matchedOrderId: SEED_IDS.order,
      settlementStatus: SettlementStatus.SETTLED,
      occurredAt: now,
      rawPayload: { txnid: "EZTXN1001", status: "success" },
    },
    settlement: {
      id: SEED_IDS.settlement,
      shopId: SEED_IDS.shop,
      gatewayId: SEED_IDS.gateway,
      payoutId: "PAYOUT2026011501",
      payoutDate: now,
      totalAmountPaise: NET_PAISE,
      transactionCount: 1,
      status: "settled",
      utrNumber: "UTR0001ABC",
      bankAccountLast4: "4321",
      rawPayload: { payout_id: "PAYOUT2026011501" },
    },
    lineItem: {
      id: SEED_IDS.lineItem,
      settlementId: SEED_IDS.settlement,
      transactionId: SEED_IDS.transaction,
      grossPaise: GROSS_PAISE,
      feesPaise: FEES_PAISE,
      netPaise: NET_PAISE,
    },
    refund: {
      id: SEED_IDS.refund,
      shopId: SEED_IDS.shop,
      transactionId: SEED_IDS.transaction,
      refundId: "EZREFUND1001",
      amountPaise: 50000,
      status: "processed",
      shopifyRefundId: "gid://shopify/Refund/1001",
      processedAt: now,
      rawPayload: { refund_id: "EZREFUND1001" },
    },
    reconciliation: {
      id: SEED_IDS.reconciliation,
      shopId: SEED_IDS.shop,
      shopifyOrderId: SEED_IDS.order,
      transactionId: SEED_IDS.transaction,
      status: ReconciliationStatus.MATCHED,
      expectedAmountPaise: GROSS_PAISE,
      actualAmountPaise: GROSS_PAISE,
      deltaPaise: 0,
      reason: "Matched on udf1 = shopifyOrderId",
    },
    webhookEvent: {
      id: SEED_IDS.webhookEvent,
      source: WebhookSource.EASEBUZZ,
      eventType: "transaction",
      idempotencyKey: "easebuzz:txn:EZTXN1001:success",
      shopId: SEED_IDS.shop,
      payload: { txnid: "EZTXN1001", status: "success" },
      status: WebhookStatus.PROCESSED,
      processedAt: now,
    },
  };
}
