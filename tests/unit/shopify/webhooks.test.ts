import { createHmac } from "crypto";

import { describe, expect, it } from "vitest";

import { verifyShopifyHmac } from "@/lib/shopify/webhooks";

const SECRET = "test-api-secret";

/**
 * Computes a valid Shopify HMAC header for a raw body.
 */
function sign(rawBody: string): string {
  return createHmac("sha256", SECRET).update(rawBody, "utf8").digest("base64");
}

describe("verifyShopifyHmac", () => {
  it("accepts a correctly signed body", () => {
    const body = JSON.stringify({ id: 1, name: "#1001" });
    expect(verifyShopifyHmac(body, sign(body))).toBe(true);
  });

  it("rejects a tampered body", () => {
    const body = JSON.stringify({ id: 1 });
    const hmac = sign(body);
    expect(verifyShopifyHmac(body + "x", hmac)).toBe(false);
  });

  it("rejects an empty signature", () => {
    expect(verifyShopifyHmac("{}", "")).toBe(false);
  });

  it("rejects a signature of the wrong length", () => {
    expect(verifyShopifyHmac("{}", "shortsig")).toBe(false);
  });
});
