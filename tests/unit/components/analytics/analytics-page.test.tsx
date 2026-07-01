import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";

vi.mock("next/dynamic", () => ({
  default: () => {
    return function MockDynamic() {
      return <div data-testid="mock-chart" />;
    };
  },
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

describe("AnalyticsPage", () => {
  it("renders analytics sections from API data", async () => {
    render(<AnalyticsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Revenue Analytics")).toBeInTheDocument();
    });

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Charts")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
    expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
    expect(screen.getByText("Match Rate Trend")).toBeInTheDocument();
  });
});
