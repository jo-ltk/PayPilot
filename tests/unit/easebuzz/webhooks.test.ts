import { describe, expect, it } from "vitest";

import {
  computeEasebuzzHash,
  easebuzzIdempotencyKey,
  parseFormBody,
  verifyEasebuzzHash,
  type EasebuzzWebhookPayload,
} from "@/lib/easebuzz/webhooks";

const SALT = "merchant-salt";

/** Builds a signed transaction payload for the given salt. */
function signedTransaction(
  overrides: Partial<EasebuzzWebhookPayload> = {},
): EasebuzzWebhookPayload {
  const payload: EasebuzzWebhookPayload = {
    txnid: "txn_1",
    amount: "100.00",
    status: "success",
    email: "buyer@example.com",
    firstname: "Buyer",
    productinfo: "Order #1001",
    key: "merchant-key",
    udf1: "1001",
    ...overrides,
  };
  payload.hash = computeEasebuzzHash("transaction", payload, SALT);
  return payload;
}

describe("parseFormBody", () => {
  it("decodes form-urlencoded bodies into a flat map", () => {
    const result = parseFormBody("txnid=abc&amount=10.00&status=success");
    expect(result).toEqual({ txnid: "abc", amount: "10.00", status: "success" });
  });

  it("url-decodes encoded values", () => {
    const result = parseFormBody("email=buyer%40example.com&productinfo=Order%20%231");
    expect(result.email).toBe("buyer@example.com");
    expect(result.productinfo).toBe("Order #1");
  });
});

describe("verifyEasebuzzHash", () => {
  it("accepts a correctly signed transaction payload", () => {
    const payload = signedTransaction();
    expect(verifyEasebuzzHash("transaction", payload, SALT)).toBe(true);
  });

  it("rejects a tampered amount", () => {
    const payload = signedTransaction();
    payload.amount = "999.00";
    expect(verifyEasebuzzHash("transaction", payload, SALT)).toBe(false);
  });

  it("rejects the wrong salt", () => {
    const payload = signedTransaction();
    expect(verifyEasebuzzHash("transaction", payload, "other-salt")).toBe(false);
  });

  it("rejects a missing hash", () => {
    const payload = signedTransaction();
    delete payload.hash;
    expect(verifyEasebuzzHash("transaction", payload, SALT)).toBe(false);
  });

  it("verifies payout and refund channels independently", () => {
    const payout: EasebuzzWebhookPayload = {
      payout_id: "po_1",
      payout_amount: "500.00",
      status: "completed",
      key: "merchant-key",
    };
    payout.hash = computeEasebuzzHash("payout", payout, SALT);
    expect(verifyEasebuzzHash("payout", payout, SALT)).toBe(true);

    const refund: EasebuzzWebhookPayload = {
      refund_id: "rf_1",
      txnid: "txn_1",
      refund_amount: "50.00",
      refund_status: "refunded",
      key: "merchant-key",
    };
    refund.hash = computeEasebuzzHash("refund", refund, SALT);
    expect(verifyEasebuzzHash("refund", refund, SALT)).toBe(true);
  });
});

describe("easebuzzIdempotencyKey", () => {
  it("builds a transaction key from txnid and status", () => {
    expect(
      easebuzzIdempotencyKey("transaction", { txnid: "t1", status: "success" }),
    ).toBe("easebuzz:txn:t1:success");
  });

  it("builds a payout key from payout id", () => {
    expect(easebuzzIdempotencyKey("payout", { payout_id: "po9" })).toBe(
      "easebuzz:payout:po9",
    );
  });

  it("builds a refund key from refund id and status", () => {
    expect(
      easebuzzIdempotencyKey("refund", {
        refund_id: "r1",
        refund_status: "refunded",
      }),
    ).toBe("easebuzz:refund:r1:refunded");
  });
});
