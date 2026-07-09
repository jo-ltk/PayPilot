import { describe, expect, it } from "vitest";

import "@/lib/gateways/index";
import { encryptCredentials, decryptCredentials, maskCredentialValue } from "@/lib/gateways/credentials";
import { paymentGatewayRegistry } from "@/lib/gateways/registry";
import { GatewayProvider } from "@prisma/client";

describe("gateway credentials", () => {
  it("round-trips encrypted credentials JSON", () => {
    const original = { keyId: "rzp_test", keySecret: "secret1234" };
    const encrypted = encryptCredentials(original);
    expect(decryptCredentials(encrypted)).toEqual(original);
  });

  it("masks credential values showing last four chars", () => {
    expect(maskCredentialValue("secret1234")).toBe("****1234");
  });
});

describe("paymentGatewayRegistry", () => {
  it("registers Easebuzz, Razorpay, and Cashfree adapters", () => {
    expect(paymentGatewayRegistry.has(GatewayProvider.EASEBUZZ)).toBe(true);
    expect(paymentGatewayRegistry.has(GatewayProvider.RAZORPAY)).toBe(true);
    expect(paymentGatewayRegistry.has(GatewayProvider.CASHFREE)).toBe(true);
  });

  it("returns the correct adapter for each provider", () => {
    expect(paymentGatewayRegistry.get(GatewayProvider.EASEBUZZ).provider).toBe(
      GatewayProvider.EASEBUZZ,
    );
  });
});
