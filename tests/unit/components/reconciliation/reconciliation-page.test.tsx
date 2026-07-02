import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ReconciliationPage } from "@/components/reconciliation/reconciliation-page";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";

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

describe("ReconciliationPage", () => {
  it("renders reconciliation rows from the API", async () => {
    render(<ReconciliationPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Mismatch")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Every mismatch, tracked and resolved"),
    ).toBeInTheDocument();
  });

  it("opens the detail drawer on row click", async () => {
    const user = userEvent.setup();
    render(<ReconciliationPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("order-1")).toBeInTheDocument();
    });

    await user.click(screen.getByText("order-1"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Reconciliation details" }),
      ).toBeInTheDocument();
    });
  });
});
