import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useValidateSettings } from "@/hooks/use-validate-settings";

vi.mock("@/hooks/use-shop-api", () => ({
  useShopApi: () => ({
    getOptions: async () => ({ credentials: "include" as const }),
  }),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("useValidateSettings", () => {
  it("returns validation result with webhook URLs", async () => {
    const { result } = renderHook(() => useValidateSettings("shop-1"), {
      wrapper: createWrapper(),
    });

    const response = await result.current.mutateAsync();

    expect(response.valid).toBe(true);
    expect(response.webhookUrls.transaction).toContain("/webhooks/easebuzz");
  });
});
