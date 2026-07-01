import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useAnalyticsInsights } from "@/hooks/use-analytics-insights";
import { defaultAnalyticsRange } from "@/lib/analytics-range";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";

vi.mock("@/hooks/use-shop-api", () => ({
  useShopApi: () => ({
    getOptions: async () => ({ credentials: "include" as const }),
  }),
}));

const mockAnalytics = {
  from: "2026-05-01",
  to: "2026-06-01",
  kpis: {
    transactionCount: 120,
    grossVolumePaise: 12000000,
    feesPaise: 240000,
    netVolumePaise: 11760000,
    refundCount: 3,
    refundTotalPaise: 150000,
    settlementCount: 4,
    settlementTotalPaise: 10000000,
    pendingSettlementPaise: 1760000,
    reconciliation: { AMOUNT_MISMATCH: 2, MATCHED: 118 },
    matchRate: 0.983,
  },
  series: [{ date: "2026-05-01", grossPaise: 400000, count: 4 }],
};

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

describe("useAnalyticsInsights", () => {
  it("derives insights from list APIs", async () => {
    const { result } = renderHook(
      () =>
        useAnalyticsInsights("shop-1", defaultAnalyticsRange(), mockAnalytics),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.successRate).toBeGreaterThanOrEqual(0);
    expect(result.current.data?.gatewayPerformance.length).toBeGreaterThan(0);
    expect(result.current.data?.paymentHealthScore).toBeGreaterThan(0);
  });
});
