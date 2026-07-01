import { createHmac, timingSafeEqual } from "crypto";

import { requireShopifyAuthEnv } from "@/lib/env";

/**
 * Verifies a Shopify webhook HMAC signature against the raw request body.
 *
 * Uses a constant-time comparison of the base64 HMAC-SHA256 digest computed
 * with the app secret. The raw (unparsed) body must be used.
 * @param rawBody - Exact raw request body as received
 * @param hmacHeader - Value of the `X-Shopify-Hmac-Sha256` header
 * @returns Whether the signature is valid
 */
export function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string,
): boolean {
  if (!hmacHeader) {
    return false;
  }
  const { apiSecret } = requireShopifyAuthEnv();
  const digest = createHmac("sha256", apiSecret)
    .update(rawBody, "utf8")
    .digest();
  const provided = Buffer.from(hmacHeader, "base64");
  if (provided.length !== digest.length) {
    return false;
  }
  return timingSafeEqual(digest, provided);
}
