import {
  MatchingStrategy,
  ReconciliationStatus,
  SettlementStatus,
} from "@prisma/client";
import { describe, expect, it } from "vitest";

import { reconcile } from "@/lib/reconciliation/engine";
import type { EngineConfig, EngineOrder, EngineTransaction } from "@/lib/reconciliation/engine";

const baseConfig: EngineConfig = {
  strategy: MatchingStrategy.UDF_ORDER_ID,
  priority: [],
  fieldMapping: {},
  amountTolerancePaise: 0,
  includeGatewayFees: false,
};

/** Builds a minimal order for engine tests. */
function order(overrides: Partial<EngineOrder> = {}): EngineOrder {
  return {
    id: "o1",
    shopifyOrderId: "1001",
    orderName: "#1001",
    shopifyPaymentId: "pay_1",
    totalPricePaise: 10000,
    financialStatus: "paid",
    ...overrides,
  };
}

/** Builds a minimal transaction for engine tests. */
function txn(overrides: Partial<EngineTransaction> = {}): EngineTransaction {
  return {
    id: "t1",
    txnid: "#1001",
    amountPaise: 10000,
    netAmountPaise: 9700,
    settlementStatus: SettlementStatus.SETTLED,
    udf1: "1001",
    udf2: null,
    udf3: null,
    udf4: null,
    udf5: null,
    udf6: null,
    udf7: null,
    udf8: null,
    udf9: null,
    udf10: null,
    ...overrides,
  };
}

describe("reconcile — UDF_ORDER_ID", () => {
  it("matches when udf1 equals shopifyOrderId", () => {
    const results = reconcile({
      orders: [order()],
      transactions: [txn()],
      refunds: [],
      config: baseConfig,
    });
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe(ReconciliationStatus.MATCHED);
  });
});

describe("reconcile — UDF_ORDER_NAME", () => {
  it("matches when udf1 equals order name", () => {
    const results = reconcile({
      orders: [order()],
      transactions: [txn({ udf1: "#1001" })],
      refunds: [],
      config: { ...baseConfig, strategy: MatchingStrategy.UDF_ORDER_NAME },
    });
    expect(results[0].status).toBe(ReconciliationStatus.MATCHED);
  });
});

describe("reconcile — TXNID_ORDER_NAME", () => {
  it("matches when txnid equals order name", () => {
    const results = reconcile({
      orders: [order()],
      transactions: [txn({ txnid: "#1001", udf1: null })],
      refunds: [],
      config: { ...baseConfig, strategy: MatchingStrategy.TXNID_ORDER_NAME },
    });
    expect(results[0].status).toBe(ReconciliationStatus.MATCHED);
  });
});

describe("reconcile — SHOPIFY_PAYMENT_ID", () => {
  it("matches when mapped udf equals shopify payment id", () => {
    const results = reconcile({
      orders: [order({ shopifyPaymentId: "pay_abc" })],
      transactions: [txn({ udf1: null, udf2: "pay_abc" })],
      refunds: [],
      config: {
        ...baseConfig,
        strategy: MatchingStrategy.SHOPIFY_PAYMENT_ID,
        fieldMapping: { paymentId: "udf2" },
      },
    });
    expect(results[0].status).toBe(ReconciliationStatus.MATCHED);
  });
});

describe("reconcile — COMPOSITE", () => {
  it("tries priority list until a match is found", () => {
    const results = reconcile({
      orders: [order()],
      transactions: [txn({ udf1: null, txnid: "#1001" })],
      refunds: [],
      config: {
        ...baseConfig,
        strategy: MatchingStrategy.COMPOSITE,
        priority: [
          MatchingStrategy.UDF_ORDER_ID,
          MatchingStrategy.TXNID_ORDER_NAME,
        ],
      },
    });
    expect(results[0].status).toBe(ReconciliationStatus.MATCHED);
  });
});

describe("reconcile — amount and settlement rules", () => {
  it("flags AMOUNT_MISMATCH when delta exceeds tolerance", () => {
    const results = reconcile({
      orders: [order({ totalPricePaise: 10000 })],
      transactions: [txn({ amountPaise: 10500, netAmountPaise: 10500 })],
      refunds: [],
      config: { ...baseConfig, amountTolerancePaise: 100 },
    });
    expect(results[0].status).toBe(ReconciliationStatus.AMOUNT_MISMATCH);
  });

  it("treats amounts within tolerance as matched", () => {
    const results = reconcile({
      orders: [order({ totalPricePaise: 10000 })],
      transactions: [txn({ amountPaise: 10050, netAmountPaise: 10050 })],
      refunds: [],
      config: { ...baseConfig, amountTolerancePaise: 100 },
    });
    expect(results[0].status).toBe(ReconciliationStatus.MATCHED);
  });

  it("compares net amount when includeGatewayFees is enabled", () => {
    const results = reconcile({
      orders: [order({ totalPricePaise: 9700 })],
      transactions: [txn({ amountPaise: 10000, netAmountPaise: 9700 })],
      refunds: [],
      config: { ...baseConfig, includeGatewayFees: true },
    });
    expect(results[0].status).toBe(ReconciliationStatus.MATCHED);
  });

  it("flags PENDING_SETTLEMENT when matched but not settled", () => {
    const results = reconcile({
      orders: [order()],
      transactions: [txn({ settlementStatus: SettlementStatus.PENDING })],
      refunds: [],
      config: baseConfig,
    });
    expect(results[0].status).toBe(ReconciliationStatus.PENDING_SETTLEMENT);
  });
});

describe("reconcile — refund and orphan detection", () => {
  it("flags REFUND_MISMATCH when Shopify refunded but gateway did not", () => {
    const results = reconcile({
      orders: [order({ financialStatus: "refunded" })],
      transactions: [txn()],
      refunds: [],
      config: baseConfig,
    });
    expect(results[0].status).toBe(ReconciliationStatus.REFUND_MISMATCH);
  });

  it("flags MISSING_SHOPIFY for orphan gateway transactions", () => {
    const results = reconcile({
      orders: [],
      transactions: [txn({ udf1: "unknown" })],
      refunds: [],
      config: baseConfig,
    });
    expect(results[0].status).toBe(ReconciliationStatus.MISSING_SHOPIFY);
  });

  it("flags MISSING_GATEWAY for unmatched Shopify orders", () => {
    const results = reconcile({
      orders: [order()],
      transactions: [],
      refunds: [],
      config: baseConfig,
    });
    expect(results[0].status).toBe(ReconciliationStatus.MISSING_GATEWAY);
  });
});
