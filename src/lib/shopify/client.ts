import { ExternalAPIError } from "@/lib/api/errors";

export const SHOPIFY_API_VERSION = "2025-07";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

/**
 * Executes an Admin GraphQL operation against a shop.
 * @param shopDomain - Shop domain, e.g. `example.myshopify.com`
 * @param accessToken - Decrypted offline access token
 * @param query - GraphQL document
 * @param variables - Optional GraphQL variables
 * @returns The parsed `data` payload
 * @throws {ExternalAPIError} On transport failures or GraphQL errors
 */
export async function adminGraphQL<T>(
  shopDomain: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!response.ok) {
    throw new ExternalAPIError("Shopify", `Admin API ${response.status}`);
  }

  const result = (await response.json()) as GraphQLResponse<T>;
  if (result.errors && result.errors.length > 0) {
    throw new ExternalAPIError("Shopify", result.errors[0].message, result.errors);
  }
  if (!result.data) {
    throw new ExternalAPIError("Shopify", "Empty GraphQL response");
  }
  return result.data;
}
