import { requireShopifyAuthEnv } from "@/lib/env";
import { adminGraphQL } from "@/lib/shopify/client";

/** Webhook topics the app subscribes to on install. */
const SUBSCRIPTION_TOPICS = [
  "ORDERS_PAID",
  "ORDERS_UPDATED",
  "REFUNDS_CREATE",
  "APP_UNINSTALLED",
] as const;

const REGISTER_MUTATION = `
  mutation webhookSubscriptionCreate(
    $topic: WebhookSubscriptionTopic!
    $sub: WebhookSubscriptionInput!
  ) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $sub) {
      userErrors { field message }
      webhookSubscription { id }
    }
  }
`;

type RegisterResult = {
  webhookSubscriptionCreate: {
    userErrors: Array<{ field: string[] | null; message: string }>;
    webhookSubscription: { id: string } | null;
  };
};

/**
 * Registers the app's required Shopify webhook subscriptions for a shop.
 *
 * Subscriptions point at the single `/api/webhooks/shopify` handler; failures
 * for an individual topic do not abort the remaining registrations.
 * @param shopDomain - Shop domain, e.g. `example.myshopify.com`
 * @param accessToken - Decrypted offline access token
 * @returns Count of successfully created subscriptions
 */
export async function registerShopifyWebhooks(
  shopDomain: string,
  accessToken: string,
): Promise<number> {
  const { host } = requireShopifyAuthEnv();
  const callbackUrl = `${host}/api/webhooks/shopify`;
  let registered = 0;

  for (const topic of SUBSCRIPTION_TOPICS) {
    const result = await adminGraphQL<RegisterResult>(
      shopDomain,
      accessToken,
      REGISTER_MUTATION,
      { topic, sub: { callbackUrl, format: "JSON" } },
    );
    if (result.webhookSubscriptionCreate.webhookSubscription) {
      registered += 1;
    }
  }

  return registered;
}
