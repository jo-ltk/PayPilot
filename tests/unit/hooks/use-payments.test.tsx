import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import { usePayments } from "@/hooks/use-payments";

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

describe("usePayments", () => {
  it("fetches paginated payments for the active shop", async () => {
    const { result } = renderHook(
      () => usePayments("shop-1", { page: 1, pageSize: 25 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0]?.easebuzzTxnId).toBe("EZ-TXN-001");
    expect(result.current.data?.meta.total).toBe(1);
  });

  it("does not fetch when shop id is missing", () => {
    const { result } = renderHook(
      () => usePayments(null, { page: 1, pageSize: 25 }),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe("idle");
  });
});
