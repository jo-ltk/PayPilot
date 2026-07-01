import { afterEach, describe, expect, it, vi } from "vitest";

import { ExternalAPIError } from "@/lib/api/errors";
import { exchangeSessionToken } from "@/lib/shopify/token-exchange";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("exchangeSessionToken", () => {
  it("returns the offline access token and scope", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ access_token: "shpat_offline", scope: "read_orders" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await exchangeSessionToken("demo.myshopify.com", "sess-token");

    expect(result.access_token).toBe("shpat_offline");
    expect(result.scope).toBe("read_orders");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://demo.myshopify.com/admin/oauth/access_token");
    const body = JSON.parse(String((init as RequestInit).body));
    expect(body.grant_type).toBe(
      "urn:ietf:params:oauth:grant-type:token-exchange",
    );
    expect(body.requested_token_type).toBe(
      "urn:shopify:params:oauth:token-type:offline-access-token",
    );
    expect(body.subject_token).toBe("sess-token");
  });

  it("throws ExternalAPIError when Shopify rejects the exchange", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("invalid_subject_token", { status: 400 }),
    );

    await expect(
      exchangeSessionToken("demo.myshopify.com", "bad-token"),
    ).rejects.toBeInstanceOf(ExternalAPIError);
  });
});
