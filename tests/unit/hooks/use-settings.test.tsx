import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { MatchingStrategy, Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

vi.mock("@/hooks/use-shop-api", () => ({
  useShopApi: () => ({
    getOptions: async () => ({ credentials: "include" as const }),
  }),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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
            userId: "user-1",
            userEmail: "admin@example.com",
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

describe("useSettings", () => {
  it("fetches masked settings for the active shop", async () => {
    const { result } = renderHook(() => useSettings("shop-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.gateway?.keyMasked).toBe("****1234");
    expect(JSON.stringify(result.current.data)).not.toContain("plain-key");
  });
});

describe("useUpdateSettings", () => {
  it("updates the settings cache after PATCH", async () => {
    const { result } = renderHook(
      () => ({
        settings: useSettings("shop-1"),
        update: useUpdateSettings("shop-1"),
      }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.settings.isSuccess).toBe(true));

    await result.current.update.mutateAsync({
      matching: {
        strategy: MatchingStrategy.COMPOSITE,
        priority: [],
        fieldMapping: {},
        amountTolerancePaise: 0,
        includeGatewayFees: false,
      },
    });

    await waitFor(() =>
      expect(result.current.settings.data?.matching?.strategy).toBe(
        MatchingStrategy.COMPOSITE,
      ),
    );
  });
});
