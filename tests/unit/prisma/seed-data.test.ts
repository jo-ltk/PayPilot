import { describe, expect, it } from "vitest";

import { buildSeedData, SEED_IDS } from "../../../prisma/seed-data";

describe("buildSeedData integrity", () => {
  const data = buildSeedData();

  it("links core records to the demo shop", () => {
    expect(data.member.shopId).toBe(SEED_IDS.shop);
    expect(data.gateway.shopId).toBe(SEED_IDS.shop);
    expect(data.matchingConfig.shopId).toBe(SEED_IDS.shop);
  });

  it("generates hundreds of linked commerce records", () => {
    expect(data.transactions.length).toBeGreaterThanOrEqual(500);
    expect(data.orders.length).toBeGreaterThan(100);
    expect(data.settlements.length).toBeGreaterThan(5);
    expect(data.refunds.length).toBeGreaterThan(20);
    expect(data.reconciliations.length).toBeGreaterThan(100);
    expect(data.webhookEvents.length).toBeGreaterThan(data.transactions.length);
  });

  it("links every child record to the demo shop", () => {
    for (const order of data.orders) {
      expect(order.shopId).toBe(SEED_IDS.shop);
    }
    for (const txn of data.transactions) {
      expect(txn.shopId).toBe(SEED_IDS.shop);
      expect(txn.gatewayId).toBe(SEED_IDS.gateway);
    }
    for (const settlement of data.settlements) {
      expect(settlement.shopId).toBe(SEED_IDS.shop);
    }
    for (const refund of data.refunds) {
      expect(refund.shopId).toBe(SEED_IDS.shop);
    }
    for (const recon of data.reconciliations) {
      expect(recon.shopId).toBe(SEED_IDS.shop);
    }
    for (const event of data.webhookEvents) {
      expect(event.shopId).toBe(SEED_IDS.shop);
    }
  });

  it("keeps transaction money math consistent in paise", () => {
    for (const txn of data.transactions) {
      expect(txn.netAmountPaise).toBe(txn.amountPaise - txn.feesPaise);
      expect(Number.isInteger(txn.amountPaise)).toBe(true);
      expect(Number.isInteger(txn.feesPaise)).toBe(true);
    }
  });

  it("keeps settlement totals aligned with line items", () => {
    const netBySettlement = new Map<string, number>();
    for (const item of data.lineItems) {
      expect(item.netPaise).toBe(item.grossPaise - item.feesPaise);
      const current = netBySettlement.get(item.settlementId) ?? 0;
      netBySettlement.set(item.settlementId, current + item.netPaise);
    }

    for (const settlement of data.settlements) {
      expect(settlement.totalAmountPaise).toBe(
        netBySettlement.get(settlement.id) ?? 0,
      );
      expect(settlement.transactionCount).toBe(
        data.lineItems.filter((item) => item.settlementId === settlement.id).length,
      );
    }
  });

  it("limits refund amounts to their parent transaction", () => {
    const txnById = new Map(data.transactions.map((txn) => [txn.id, txn]));
    for (const refund of data.refunds) {
      const txn = txnById.get(refund.transactionId);
      expect(txn).toBeDefined();
      expect(refund.amountPaise).toBeLessThanOrEqual(txn!.amountPaise);
    }
  });

  it("includes varied payment and settlement scenarios", () => {
    const statuses = new Set(data.transactions.map((txn) => txn.status));
    expect(statuses.has("success")).toBe(true);
    expect(statuses.has("failure")).toBe(true);
    expect(statuses.has("pending")).toBe(true);
    expect(statuses.has("userCancelled")).toBe(true);
    expect(statuses.has("chargeback")).toBe(true);

    const settlementStatuses = new Set(data.settlements.map((s) => s.status));
    expect(settlementStatuses.has("completed")).toBe(true);
    expect(settlementStatuses.has("pending")).toBe(true);

    const refundStatuses = new Set(data.refunds.map((r) => r.status));
    expect(refundStatuses.has("processed")).toBe(true);
    expect(refundStatuses.has("pending")).toBe(true);
  });

  it("includes reconciliation edge cases", () => {
    const statuses = new Set(data.reconciliations.map((r) => r.status));
    expect(statuses.has("MATCHED")).toBe(true);
    expect(statuses.has("AMOUNT_MISMATCH")).toBe(true);
    expect(statuses.has("PENDING_SETTLEMENT")).toBe(true);
    expect(statuses.has("MISSING_GATEWAY")).toBe(true);
    expect(statuses.has("MISSING_SHOPIFY")).toBe(true);
  });

  it("anchors transaction dates inside the last 90 days", () => {
    const ref = new Date("2026-07-03T12:00:00.000Z").getTime();
    const min = ref - 90 * 86400000;
    for (const txn of data.transactions) {
      const at = txn.occurredAt.getTime();
      expect(at).toBeGreaterThanOrEqual(min);
      expect(at).toBeLessThanOrEqual(ref);
    }
  });

  it("omits gateway secrets from buildSeedData (encrypted at seed time)", () => {
    expect(data.gateway).not.toHaveProperty("key");
    expect(data.gateway).not.toHaveProperty("salt");
  });

  it("produces deterministic output for the same seed", () => {
    const second = buildSeedData();
    expect(second.meta).toEqual(data.meta);
    expect(second.transactions[0]?.easebuzzTxnId).toBe(
      data.transactions[0]?.easebuzzTxnId,
    );
  });
});
