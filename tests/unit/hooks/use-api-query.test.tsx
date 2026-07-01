import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useApiQuery } from "@/hooks/use-api-query";
import { apiGet } from "@/lib/api-client";

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("useApiQuery", () => {
  it("fetches data via provided fetcher", async () => {
    const { result } = renderHook(
      () =>
        useApiQuery(["health"], () => apiGet<{ status: string }>("/health")),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.status).toBe("ok");
  });
});
