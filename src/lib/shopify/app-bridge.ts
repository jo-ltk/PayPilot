/** Minimal Shopify App Bridge global injected by the CDN script. */
export type ShopifyGlobal = {
  ready: Promise<void>;
  idToken: () => Promise<string>;
  config?: {
    apiKey?: string;
    host?: string;
    shop?: string;
  };
};

type ShopifyWindow = Window & {
  shopify?: ShopifyGlobal;
};

const APP_BRIDGE_POLL_MS = 50;
const APP_BRIDGE_TIMEOUT_MS = 10_000;

/**
 * Waits until the App Bridge global is available in the browser.
 * @param timeoutMs - Maximum wait time before rejecting
 * @returns Resolved Shopify global
 */
export async function waitForShopifyGlobal(
  timeoutMs = APP_BRIDGE_TIMEOUT_MS,
): Promise<ShopifyGlobal> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const shopify = (window as ShopifyWindow).shopify;
    if (shopify) {
      await shopify.ready;
      return shopify;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, APP_BRIDGE_POLL_MS);
    });
  }

  throw new Error("Shopify App Bridge failed to initialize");
}

/**
 * Retrieves the current App Bridge session token for backend auth.
 * @returns Session token JWT
 */
export async function getAppBridgeSessionToken(): Promise<string> {
  const shopify = await waitForShopifyGlobal();
  return shopify.idToken();
}

/**
 * Returns true when App Bridge is available (browser-only).
 */
export function isAppBridgeEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as ShopifyWindow).shopify);
}
