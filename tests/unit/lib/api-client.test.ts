import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiGet, apiGetList, ApiClientError } from "@/lib/api-client";

import { server } from "../../setup/msw-server";

describe("api-client", () => {
  it("apiGet fetches typed data from envelope", async () => {
    const result = await apiGet<{ status: string }>("/health");
    expect(result.status).toBe("ok");
  });

  it("apiGetList returns data and meta", async () => {
    const result = await apiGetList("/shops/shop-1/payments");
    expect(result.data).toHaveLength(1);
    expect(result.meta.page).toBe(1);
  });

  it("throws ApiClientError on failure envelope", async () => {
    server.use(
      http.get("/api/shops/shop-1/payments", () =>
        HttpResponse.json({
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        }),
      ),
    );

    await expect(apiGetList("/shops/shop-1/payments")).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });

  it("sends bearer token when provided", async () => {
    let auth = "";

    server.use(
      http.get("/api/shops/shop-1/analytics", ({ request }) => {
        auth = request.headers.get("authorization") ?? "";
        return HttpResponse.json({ success: true, data: {} });
      }),
    );

    await apiGet("/shops/shop-1/analytics", { bearerToken: "test-token" });
    expect(auth).toBe("Bearer test-token");
  });
});
