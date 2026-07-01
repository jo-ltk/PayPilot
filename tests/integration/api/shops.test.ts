import { Role } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
const { shopFindMany } = vi.hoisted(() => ({ shopFindMany: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/db", () => ({
  prisma: { shop: { findMany: shopFindMany } },
}));

import { GET } from "@/app/api/shops/route";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/standalone";
import type { Session } from "@/schemas/auth.schema";

/** Sets a session cookie for shop s1. */
async function setSession(): Promise<void> {
  const session: Session = {
    userId: "u1",
    email: "user@example.com",
    memberships: [{ shopId: "s1", role: Role.VIEWER }],
  };
  const token = await createSessionToken(session);
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name === SESSION_COOKIE ? { value: token } : undefined,
  });
}

beforeEach(() => {
  shopFindMany.mockResolvedValue([
    {
      id: "s1",
      shopDomain: "demo.myshopify.com",
      shopName: "Demo",
      currency: "INR",
      isActive: true,
      onboardingStep: "COMPLETE",
    },
  ]);
});

afterEach(() => {
  vi.clearAllMocks();
  cookiesMock.mockReset();
});

describe("GET /api/shops", () => {
  it("returns shops for the authenticated user", async () => {
    await setSession();
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].shopDomain).toBe("demo.myshopify.com");
  });

  it("rejects unauthenticated requests with 401", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    const response = await GET();
    expect(response.status).toBe(401);
  });
});
