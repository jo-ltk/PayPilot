import { GatewayEnvironment, GatewayProvider, Role } from "@prisma/client";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
const { gatewayFindFirst } = vi.hoisted(() => ({ gatewayFindFirst: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/db", () => ({
  prisma: { paymentGateway: { findFirst: gatewayFindFirst } },
}));

import { POST as validate } from "@/app/api/shops/[shopId]/settings/validate/route";
import { encrypt } from "@/lib/crypto/encrypt";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/standalone";
import type { Session } from "@/schemas/auth.schema";

import { server } from "../../setup/msw-server";

/** Sets a session cookie for the given role on shop s1. */
async function setSession(role: Role): Promise<void> {
  const session: Session = {
    userId: "u1",
    email: "user@example.com",
    memberships: [{ shopId: "s1", role }],
  };
  const token = await createSessionToken(session);
  cookiesMock.mockResolvedValue({
    get: (name: string) =>
      name === SESSION_COOKIE ? { value: token } : undefined,
  });
}

/** Builds a validate request for shop s1. */
function validateRequest(): Request {
  return new Request("http://localhost/api/shops/s1/settings/validate", {
    method: "POST",
  });
}

const ctx = { params: Promise.resolve({ shopId: "s1" }) };

beforeEach(() => {
  gatewayFindFirst.mockResolvedValue({
    id: "g1",
    shopId: "s1",
    provider: GatewayProvider.EASEBUZZ,
    key: encrypt("merchant-key"),
    salt: encrypt("merchant-salt"),
    merchantEmail: "merchant@example.com",
    environment: GatewayEnvironment.SANDBOX,
    isActive: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  cookiesMock.mockReset();
});

describe("POST /api/shops/[shopId]/settings/validate", () => {
  it("validates credentials and returns webhook URLs for an ADMIN", async () => {
    await setSession(Role.ADMIN);
    const response = await validate(validateRequest() as never, ctx);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.valid).toBe(true);
    expect(json.data.webhookUrls.transaction).toContain(
      "/api/webhooks/easebuzz/transaction",
    );
  });

  it("reports invalid credentials without throwing", async () => {
    server.use(
      http.post("https://testpay.easebuzz.in/*", () =>
        HttpResponse.json({ status: 0, error_desc: "Invalid key" }),
      ),
    );
    await setSession(Role.ADMIN);
    const response = await validate(validateRequest() as never, ctx);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.valid).toBe(false);
    expect(json.data.message).toBe("Invalid key");
  });

  it("forbids a VIEWER from validating", async () => {
    await setSession(Role.VIEWER);
    const response = await validate(validateRequest() as never, ctx);
    expect(response.status).toBe(403);
  });
});
