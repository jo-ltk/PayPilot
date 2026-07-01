import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  acceptInvite,
  bootstrapShopifySession,
  loginUser,
  logoutUser,
} from "@/lib/auth-client";

import { server } from "../../setup/msw-server";

describe("auth-client", () => {
  it("loginUser posts credentials and returns session data", async () => {
    server.use(
      http.post("/api/auth/login", async ({ request }) => {
        const body = (await request.json()) as { email: string };
        return HttpResponse.json({
          success: true,
          data: {
            userId: "u1",
            email: body.email,
            shops: [{ shopId: "s1", role: "ADMIN" }],
          },
        });
      }),
    );

    const result = await loginUser({
      email: "user@example.com",
      password: "secret",
    });

    expect(result.userId).toBe("u1");
    expect(result.shops).toHaveLength(1);
  });

  it("acceptInvite posts invite payload and returns session data", async () => {
    server.use(
      http.post("/api/auth/invite/accept", () =>
        HttpResponse.json({
          success: true,
          data: {
            userId: "u2",
            email: "new@example.com",
            shops: [{ shopId: "s1", role: "VIEWER" }],
          },
        }),
      ),
    );

    const result = await acceptInvite({
      token: "invite-token",
      name: "New User",
      password: "password123",
    });

    expect(result.email).toBe("new@example.com");
  });

  it("bootstrapShopifySession sends bearer token", async () => {
    let authHeader = "";

    server.use(
      http.post("/api/auth/shopify", ({ request }) => {
        authHeader = request.headers.get("authorization") ?? "";
        return HttpResponse.json({
          success: true,
          data: {
            shopId: "shop-1",
            shopDomain: "demo.myshopify.com",
          },
        });
      }),
    );

    const result = await bootstrapShopifySession("session-jwt");

    expect(authHeader).toBe("Bearer session-jwt");
    expect(result.shopDomain).toBe("demo.myshopify.com");
  });

  it("throws readable errors from API envelope", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({
          success: false,
          error: { code: "AUTH_ERROR", message: "Invalid email or password" },
        }),
      ),
    );

    await expect(
      loginUser({ email: "user@example.com", password: "wrong" }),
    ).rejects.toThrow("Invalid email or password");
  });

  it("logoutUser clears session via API", async () => {
    server.use(
      http.post("/api/auth/logout", () =>
        HttpResponse.json({ success: true, data: { success: true } }),
      ),
    );

    await expect(logoutUser()).resolves.toBeUndefined();
  });
});
