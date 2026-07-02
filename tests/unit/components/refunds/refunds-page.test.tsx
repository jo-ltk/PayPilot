import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RefundsPage } from "@/components/refunds/refunds-page";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";

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

describe("RefundsPage", () => {
  it("renders refund rows from the refunds API", async () => {
    render(<RefundsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("REF-001")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Every refund, tracked and clear"),
    ).toBeInTheDocument();
  });

  it("opens the refund detail drawer on row click", async () => {
    const user = userEvent.setup();
    render(<RefundsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("REF-001")).toBeInTheDocument();
    });

    await user.click(screen.getByText("REF-001"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Refund details" }),
      ).toBeInTheDocument();
    });
  });
});
