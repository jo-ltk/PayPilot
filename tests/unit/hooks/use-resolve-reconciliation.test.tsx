import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReconciliationStatus, Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import { useResolveReconciliation } from "@/hooks/use-resolve-reconciliation";

vi.mock("@/hooks/use-shop-api", () => ({
  useShopApi: () => ({
    getOptions: async () => ({ credentials: "include" as const }),
  }),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return { client, Wrapper: createWrapperInner(client) };
}

function createWrapperInner(client: QueryClient) {
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

describe("useResolveReconciliation", () => {
  it("resolves a reconciliation record via PATCH", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useResolveReconciliation("shop-1"), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync({
      recordId: "rec-1",
      shopId: "shop-1",
      listParams: { page: 1, pageSize: 25 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe(ReconciliationStatus.RESOLVED);
  });
});
