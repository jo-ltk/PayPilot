import { ExternalAPIError } from "@/lib/api/errors";
import { requireShopifyAuthEnv } from "@/lib/env";
import {
  tokenExchangeResponseSchema,
  type TokenExchangeResponse,
} from "@/schemas/auth.schema";

const TOKEN_EXCHANGE_GRANT =
  "urn:ietf:params:oauth:grant-type:token-exchange";
const ID_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:id_token";
const OFFLINE_TOKEN_TYPE =
  "urn:shopify:params:oauth:token-type:offline-access-token";

/**
 * Exchanges a verified session token for a Shopify offline access token.
 * @param shopDomain - Shop domain, e.g. `example.myshopify.com`
 * @param sessionToken - The merchant's session token (subject token)
 * @returns Offline access token and the granted scope
 * @throws {ExternalAPIError} When Shopify rejects the exchange
 */
export async function exchangeSessionToken(
  shopDomain: string,
  sessionToken: string,
): Promise<TokenExchangeResponse> {
  const { apiKey, apiSecret } = requireShopifyAuthEnv();

  const response = await fetch(
    `https://${shopDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        grant_type: TOKEN_EXCHANGE_GRANT,
        subject_token: sessionToken,
        subject_token_type: ID_TOKEN_TYPE,
        requested_token_type: OFFLINE_TOKEN_TYPE,
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new ExternalAPIError("Shopify", "Token exchange failed", detail);
  }

  const body: unknown = await response.json();
  return tokenExchangeResponseSchema.parse(body);
}
