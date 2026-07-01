import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useAnalytics } from "@/hooks/use-analytics";
import { defaultDashboardRange } from "@/lib/dashboard";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import { Role } from "@prisma/client";

vi.mock("@/hooks/use-shop-api", () => ({
  useShopApi: () => ({
    getOptions: async () => ({ credentials: "include" as const }),
  }),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ShopContextProvider
          value={{
            mode: "standalone",
            shopId: "shop-1",
            shopDomain: null,
            role: Role.ADMIN,
            memberships: [{ shopId: "shop-1", role: Role.ADMIN }],
            isBootstrapping: false,
            error: null,
          }}
        >
          {children}
        </ShopContextProvider>
      </QueryClientProvider>
    );
  };
}

describe("useAnalytics", () => {
  it("fetches analytics for the active shop", async () => {
    const { result } = renderHook(
      () => useAnalytics("shop-1", defaultDashboardRange()),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.kpis.transactionCount).toBe(120);
    expect(result.current.data?.series).toHaveLength(2);
  });

  it("does not fetch when shop id is missing", () => {
    const { result } = renderHook(
      () => useAnalytics(null, defaultDashboardRange()),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
