import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";

vi.mock("next/dynamic", () => ({
  default: () => {
    return function MockChart() {
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
          <DashboardProvider>{children}</DashboardProvider>
        </ShopContextProvider>
      </QueryClientProvider>
    );
  };
}

describe("DashboardPage", () => {
  it("renders KPI cards from analytics API", async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Today's Sales")).toBeInTheDocument();
    });

    expect(screen.getByText("Settled Amount")).toBeInTheDocument();
    expect(screen.getByText("Pending Settlement")).toBeInTheDocument();
    expect(screen.getByText("Refunds")).toBeInTheDocument();
    expect(screen.getByText("Settlement Mismatches")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("renders recent activity items", async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Payment received")).toBeInTheDocument();
    });

    expect(screen.getByText("Settlement completed")).toBeInTheDocument();
  });
});
