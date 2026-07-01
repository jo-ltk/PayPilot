import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import { useRefunds } from "@/hooks/use-refunds";

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

describe("useRefunds", () => {
  it("fetches paginated refunds for the active shop", async () => {
    const { result } = renderHook(
      () => useRefunds("shop-1", { page: 1, pageSize: 25 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0]?.refundId).toBe("REF-001");
  });
});
