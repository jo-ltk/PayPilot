import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import { TransactionsPage } from "@/components/transactions/transactions-page";

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

describe("TransactionsPage", () => {
  it("renders transaction rows from the payments API", async () => {
    render(<TransactionsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Every payment, tracked and searchable"),
    ).toBeInTheDocument();
    expect(screen.getByText("EZ-TXN-001")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("opens the detail drawer when a row is clicked", async () => {
    const user = userEvent.setup();
    render(<TransactionsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    });

    await user.click(screen.getByText("ORD-1001"));

    expect(
      screen.getByRole("heading", { name: "Transaction details" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("EZ-TXN-001").length).toBeGreaterThan(0);
  });
});
