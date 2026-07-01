import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { SettlementsPage } from "@/components/settlements/settlements-page";
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

describe("SettlementsPage", () => {
  it("renders settlement rows from the settlements API", async () => {
    render(<SettlementsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("PAYOUT-001")).toBeInTheDocument();
    });

    expect(screen.getByText("Settlements")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("opens the settlement detail drawer on row click", async () => {
    const user = userEvent.setup();
    render(<SettlementsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("PAYOUT-001")).toBeInTheDocument();
    });

    await user.click(screen.getByText("PAYOUT-001"));

    expect(
      screen.getByRole("heading", { name: "Settlement details" }),
    ).toBeInTheDocument();
    expect(screen.getByText("UTR123456")).toBeInTheDocument();
  });
});
