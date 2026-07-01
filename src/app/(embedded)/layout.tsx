import { AppShell } from "@/components/layout/app-shell";
import { AppBridgeScript } from "@/components/providers/app-bridge-script";
import { ShopifyProvider } from "@/components/providers/shopify-provider";
import { embeddedNavItems } from "@/lib/navigation";

interface EmbeddedLayoutProps {
  children: React.ReactNode;
}

const shopifyApiKey = process.env.SHOPIFY_API_KEY ?? "";

/** Embedded Shopify Admin shell with App Bridge bootstrap and navigation. */
export default function EmbeddedLayout({ children }: EmbeddedLayoutProps) {
  return (
    <>
      <AppBridgeScript apiKey={shopifyApiKey} />
      <ShopifyProvider>
        <AppShell navItems={embeddedNavItems}>{children}</AppShell>
      </ShopifyProvider>
    </>
  );
}
