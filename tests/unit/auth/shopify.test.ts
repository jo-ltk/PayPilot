import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";

import { AuthError } from "@/lib/api/errors";
import { getShopDomain, verifySessionToken } from "@/lib/auth/shopify";

const SECRET = new TextEncoder().encode("test-api-secret");
const AUDIENCE = "test-api-key";
const SHOP = "https://settleflow-demo.myshopify.com";

type Overrides = {
  dest?: string;
  iss?: string;
  audience?: string;
  exp?: number;
  nbf?: number;
  secret?: Uint8Array;
};

/**
 * Builds a signed Shopify-style session token for testing.
 */
async function makeToken(overrides: Overrides = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const dest = overrides.dest ?? SHOP;
  return new SignJWT({
    iss: overrides.iss ?? `${dest}/admin`,
    dest,
    sub: "12345",
    sid: "session-1",
    jti: "jwt-1",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(overrides.audience ?? AUDIENCE)
    .setIssuedAt(now)
    .setNotBefore(overrides.nbf ?? now - 5)
    .setExpirationTime(overrides.exp ?? now + 60)
    .sign(overrides.secret ?? SECRET);
}

describe("verifySessionToken", () => {
  it("verifies a valid token and resolves the shop domain", async () => {
    const claims = await verifySessionToken(await makeToken());
    expect(claims.dest).toBe(SHOP);
    expect(getShopDomain(claims)).toBe("settleflow-demo.myshopify.com");
  });

  it("rejects an empty token", async () => {
    await expect(verifySessionToken("")).rejects.toBeInstanceOf(AuthError);
  });

  it("rejects a token with the wrong audience", async () => {
    const token = await makeToken({ audience: "someone-else" });
    await expect(verifySessionToken(token)).rejects.toBeInstanceOf(AuthError);
  });

  it("rejects a token signed with the wrong secret", async () => {
    const token = await makeToken({
      secret: new TextEncoder().encode("wrong-secret-wrong-secret-wrong!"),
    });
    await expect(verifySessionToken(token)).rejects.toBeInstanceOf(AuthError);
  });

  it("rejects an expired token", async () => {
    const past = Math.floor(Date.now() / 1000) - 120;
    const token = await makeToken({ exp: past, nbf: past - 10 });
    await expect(verifySessionToken(token)).rejects.toBeInstanceOf(AuthError);
  });

  it("rejects a non-myshopify destination", async () => {
    const token = await makeToken({ dest: "https://evil.example.com" });
    await expect(verifySessionToken(token)).rejects.toBeInstanceOf(AuthError);
  });
});
