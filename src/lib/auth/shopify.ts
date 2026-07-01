import { jwtVerify } from "jose";

import { AuthError } from "@/lib/api/errors";
import { requireShopifyAuthEnv } from "@/lib/env";
import {
  sessionTokenClaimsSchema,
  type SessionTokenClaims,
} from "@/schemas/auth.schema";

const SHOPIFY_DOMAIN_PATTERN =
  /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com\/?$/;

/**
 * Verifies a Shopify session token (JWT) and returns its claims.
 *
 * Validates the HMAC-SHA256 signature against the app secret, the audience
 * against the app's API key, expiry/not-before windows, and that the
 * destination is a `*.myshopify.com` domain.
 * @param token - Raw session token from the Authorization header
 * @returns Verified session token claims
 * @throws {AuthError} When the token is missing, malformed, or invalid
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionTokenClaims> {
  if (!token) {
    throw new AuthError("Missing session token");
  }

  const { apiKey, apiSecret } = requireShopifyAuthEnv();
  const secret = new TextEncoder().encode(apiSecret);

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      audience: apiKey,
    });
    const claims = sessionTokenClaimsSchema.parse(payload);
    if (!SHOPIFY_DOMAIN_PATTERN.test(claims.dest)) {
      throw new AuthError("Invalid session token destination");
    }
    return claims;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Invalid session token");
  }
}

/**
 * Extracts the shop domain from a verified session token's destination claim.
 * @param claims - Verified session token claims
 * @returns Shop domain, e.g. `example.myshopify.com`
 */
export function getShopDomain(claims: SessionTokenClaims): string {
  return new URL(claims.dest).host;
}
