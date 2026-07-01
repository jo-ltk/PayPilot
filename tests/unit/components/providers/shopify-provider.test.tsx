import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ShopifyProvider } from "@/components/providers/shopify-provider";
import { useShopContext } from "@/hooks/use-shop-context";

vi.mock("@/lib/shopify/app-bridge", () => ({
  getAppBridgeSessionToken: vi.fn().mockResolvedValue("session-jwt"),
}));

vi.mock("@/lib/auth-client", () => ({
  bootstrapShopifySession: vi.fn().mockResolvedValue({
    shopId: "shop-1",
    shopDomain: "demo.myshopify.com",
  }),
}));

function Probe() {
  const context = useShopContext();
  return (
    <div>
      <span data-testid="mode">{context.mode}</span>
      <span data-testid="shop-id">{context.shopId}</span>
      <span data-testid="shop-domain">{context.shopDomain}</span>
    </div>
  );
}

describe("ShopifyProvider", () => {
  it("bootstraps embedded auth and exposes shop context", async () => {
    render(
      <ShopifyProvider>
        <Probe />
      </ShopifyProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("shop-id")).toHaveTextContent("shop-1");
    });

    expect(screen.getByTestId("mode")).toHaveTextContent("embedded");
    expect(screen.getByTestId("shop-domain")).toHaveTextContent(
      "demo.myshopify.com",
    );
  });
});
