import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ShopSwitcher } from "@/components/layout/shop-switcher";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/shops/shop-a/transactions",
}));

function createWrapper(
  value: React.ComponentProps<typeof ShopContextProvider>["value"],
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ShopContextProvider value={value}>{children}</ShopContextProvider>
      </QueryClientProvider>
    );
  };
}

function renderSwitcher(
  memberships: { shopId: string; role: Role }[],
  shopId = "shop-a",
) {
  return render(<ShopSwitcher />, {
    wrapper: createWrapper({
      mode: "standalone",
      shopId,
      shopDomain: null,
      role: Role.ADMIN,
      memberships,
      isBootstrapping: false,
      error: null,
    }),
  });
}

describe("ShopSwitcher", () => {
  it("renders nothing for embedded mode or single-shop users", () => {
    const { container: embedded } = render(<ShopSwitcher />, {
      wrapper: createWrapper({
        mode: "embedded",
        shopId: "shop-a",
        shopDomain: "demo.myshopify.com",
        role: null,
        memberships: [],
        isBootstrapping: false,
        error: null,
      }),
    });

    expect(embedded).toBeEmptyDOMElement();

    const { container: singleShop } = renderSwitcher([
      { shopId: "shop-a", role: Role.ADMIN },
    ]);

    expect(singleShop).toBeEmptyDOMElement();
  });

  it("renders a switcher when multiple shops are available", () => {
    renderSwitcher([
      { shopId: "shop-a", role: Role.ADMIN },
      { shopId: "shop-b", role: Role.VIEWER },
    ]);

    expect(
      screen.getByRole("button", { name: /switch shop/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("shop-a")).toBeInTheDocument();
  });
});
