import { describe, expect, it } from "vitest";

import { buildSeedData, SEED_IDS } from "../../../prisma/seed-data";

describe("buildSeedData integrity", () => {
  const data = buildSeedData();

  it("links every child record to the demo shop", () => {
    expect(data.member.shopId).toBe(SEED_IDS.shop);
    expect(data.gateway.shopId).toBe(SEED_IDS.shop);
    expect(data.matchingConfig.shopId).toBe(SEED_IDS.shop);
    expect(data.order.shopId).toBe(SEED_IDS.shop);
    expect(data.transaction.shopId).toBe(SEED_IDS.shop);
    expect(data.settlement.shopId).toBe(SEED_IDS.shop);
    expect(data.refund.shopId).toBe(SEED_IDS.shop);
    expect(data.reconciliation.shopId).toBe(SEED_IDS.shop);
    expect(data.webhookEvent.shopId).toBe(SEED_IDS.shop);
  });

  it("wires foreign keys to existing parent ids", () => {
    expect(data.member.userId).toBe(SEED_IDS.user);
    expect(data.transaction.gatewayId).toBe(SEED_IDS.gateway);
    expect(data.transaction.matchedOrderId).toBe(SEED_IDS.order);
    expect(data.lineItem.settlementId).toBe(SEED_IDS.settlement);
    expect(data.lineItem.transactionId).toBe(SEED_IDS.transaction);
    expect(data.refund.transactionId).toBe(SEED_IDS.transaction);
    expect(data.reconciliation.shopifyOrderId).toBe(SEED_IDS.order);
    expect(data.reconciliation.transactionId).toBe(SEED_IDS.transaction);
  });

  it("keeps money math consistent in paise", () => {
    expect(data.transaction.netAmountPaise).toBe(
      data.transaction.amountPaise - data.transaction.feesPaise,
    );
    expect(data.lineItem.netPaise).toBe(
      data.lineItem.grossPaise - data.lineItem.feesPaise,
    );
    expect(data.settlement.totalAmountPaise).toBe(data.lineItem.netPaise);
  });

  it("uses integer paise for all monetary fields", () => {
    const amounts = [
      data.order.totalPricePaise,
      data.transaction.amountPaise,
      data.transaction.feesPaise,
      data.settlement.totalAmountPaise,
      data.refund.amountPaise,
    ];
    for (const amount of amounts) {
      expect(Number.isInteger(amount)).toBe(true);
    }
  });

  it("marks a matched reconciliation with zero delta", () => {
    expect(data.reconciliation.status).toBe("MATCHED");
    expect(data.reconciliation.deltaPaise).toBe(0);
    expect(data.reconciliation.expectedAmountPaise).toBe(
      data.reconciliation.actualAmountPaise,
    );
  });

  it("uses a deterministic idempotency key for the webhook event", () => {
    expect(data.webhookEvent.idempotencyKey).toBe(
      "easebuzz:txn:EZTXN1001:success",
    );
  });

  it("omits gateway secrets from buildSeedData (encrypted at seed time)", () => {
    expect(data.gateway).not.toHaveProperty("key");
    expect(data.gateway).not.toHaveProperty("salt");
  });
});
