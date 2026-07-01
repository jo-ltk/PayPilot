import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { SettingsPage } from "@/components/settings/settings-page";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";

const toastSuccess = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/hooks/use-shop-api", () => ({
  useShopApi: () => ({
    getOptions: async () => ({ credentials: "include" as const }),
  }),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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
            userId: "user-1",
            userEmail: "admin@example.com",
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

describe("SettingsPage", () => {
  it("renders settings tabs and gateway form", async () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Gateway settings")).toBeInTheDocument();
    });

    expect(screen.getByRole("tab", { name: "Team" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Shop" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Security" })).toBeInTheDocument();
    expect(screen.getByLabelText("Merchant key")).toBeInTheDocument();
  });

  it("saves matching changes and shows success toast", async () => {
    const user = userEvent.setup();

    render(<SettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText("Matching strategy")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Matching strategy"));
    await user.click(screen.getByRole("option", { name: /Composite/i }));

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("Settings saved");
    });
  });
});
