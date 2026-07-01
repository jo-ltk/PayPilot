import Script from "next/script";

interface AppBridgeScriptProps {
  apiKey: string;
}

/** Loads Shopify App Bridge v4 and exposes the API key meta configuration. */
export function AppBridgeScript({ apiKey }: AppBridgeScriptProps) {
  if (!apiKey) {
    return null;
  }

  return (
    <>
      <meta name="shopify-api-key" content={apiKey} />
      <Script
        id="shopify-app-bridge"
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        strategy="beforeInteractive"
      />
    </>
  );
}
