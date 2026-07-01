import { MatchingStrategy } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  resolveStrategies,
  shopifyPaymentIdStrategy,
  txnidOrderNameStrategy,
  udfOrderIdStrategy,
  udfOrderNameStrategy,
} from "@/lib/reconciliation/strategies";

describe("single strategies", () => {
  const order = {
    id: "o1",
    shopifyOrderId: "1001",
    orderName: "#1001",
    shopifyPaymentId: "pay_1",
  };
  const txn = {
    txnid: "#1001",
    udf1: "1001",
    udf2: "pay_1",
    udf3: null,
    udf4: null,
    udf5: null,
    udf6: null,
    udf7: null,
    udf8: null,
    udf9: null,
    udf10: null,
  };

  it("UDF_ORDER_ID matches udf1 to shopifyOrderId", () => {
    expect(udfOrderIdStrategy.transactionKey(txn, {})).toBe("1001");
    expect(udfOrderIdStrategy.orderKey(order)).toBe("1001");
  });

  it("UDF_ORDER_NAME matches udf1 to order name", () => {
    expect(udfOrderNameStrategy.transactionKey(txn, {})).toBe("1001");
    expect(udfOrderNameStrategy.orderKey(order)).toBe("#1001");
  });

  it("TXNID_ORDER_NAME matches txnid to order name", () => {
    expect(txnidOrderNameStrategy.transactionKey(txn, {})).toBe("#1001");
    expect(txnidOrderNameStrategy.orderKey(order)).toBe("#1001");
  });

  it("SHOPIFY_PAYMENT_ID uses mapped udf field", () => {
    expect(
      shopifyPaymentIdStrategy.transactionKey(txn, { paymentId: "udf2" }),
    ).toBe("pay_1");
    expect(shopifyPaymentIdStrategy.orderKey(order)).toBe("pay_1");
  });
});

describe("resolveStrategies", () => {
  it("returns a single strategy for non-composite config", () => {
    const strategies = resolveStrategies(MatchingStrategy.UDF_ORDER_ID, []);
    expect(strategies).toHaveLength(1);
    expect(strategies[0].name).toBe("UDF_ORDER_ID");
  });

  it("returns ordered strategies for COMPOSITE", () => {
    const strategies = resolveStrategies(MatchingStrategy.COMPOSITE, [
      MatchingStrategy.TXNID_ORDER_NAME,
      MatchingStrategy.UDF_ORDER_ID,
    ]);
    expect(strategies.map((s) => s.name)).toEqual([
      "TXNID_ORDER_NAME",
      "UDF_ORDER_ID",
    ]);
  });
});
