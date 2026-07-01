import {
  GatewayEnvironment,
  GatewayProvider,
  MatchingStrategy,
  Role,
} from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
const { gatewayFindFirst, gatewayUpdate, matchingFindUnique, matchingUpsert } =
  vi.hoisted(() => ({
    gatewayFindFirst: vi.fn(),
    gatewayUpdate: vi.fn(),
    matchingFindUnique: vi.fn(),
    matchingUpsert: vi.fn(),
  }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/db", () => ({
  prisma: {
    paymentGateway: { findFirst: gatewayFindFirst, update: gatewayUpdate },
    matchingConfig: { findUnique: matchingFindUnique, upsert: matchingUpsert },
  },
}));

import { GET, PATCH } from "@/app/api/shops/[shopId]/settings/route";
import { encrypt } from "@/lib/crypto/encrypt";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/standalone";
import type { Session } from "@/schemas/auth.schema";

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

/** Builds a settings request for shop s1. */
function settingsRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/shops/s1/settings", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const ctx = { params: Promise.resolve({ shopId: "s1" }) };

const gatewayRecord = {
  id: "g1",
  shopId: "s1",
  provider: GatewayProvider.EASEBUZZ,
  key: encrypt("merchant-key-1234"),
  salt: encrypt("merchant-salt-5678"),
  merchantEmail: "merchant@example.com",
  environment: GatewayEnvironment.SANDBOX,
  isActive: true,
};

const validGateway = {
  key: "plain-key",
  salt: "plain-salt",
  merchantEmail: "merchant@example.com",
  environment: GatewayEnvironment.SANDBOX,
};

beforeEach(() => {
  gatewayFindFirst.mockResolvedValue(gatewayRecord);
  gatewayUpdate.mockResolvedValue(undefined);
  matchingFindUnique.mockResolvedValue(null);
  matchingUpsert.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
  cookiesMock.mockReset();
});

describe("GET /api/shops/[shopId]/settings", () => {
  it("returns masked secrets for a VIEWER", async () => {
    await setSession(Role.VIEWER);
    const response = await GET(settingsRequest("GET") as never, ctx);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.gateway.keyMasked).toBe("****1234");
    expect(JSON.stringify(json)).not.toContain("merchant-key-1234");
  });

  it("rejects an unauthenticated request with 401", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    const response = await GET(settingsRequest("GET") as never, ctx);
    expect(response.status).toBe(401);
  });
});

describe("PATCH /api/shops/[shopId]/settings", () => {
  it("allows an ADMIN to update the gateway", async () => {
    await setSession(Role.ADMIN);
    const response = await PATCH(
      settingsRequest("PATCH", { gateway: validGateway }) as never,
      ctx,
    );
    expect(response.status).toBe(200);
    expect(gatewayUpdate).toHaveBeenCalledTimes(1);
  });

  it("forbids a VIEWER from updating settings", async () => {
    await setSession(Role.VIEWER);
    const response = await PATCH(
      settingsRequest("PATCH", { gateway: validGateway }) as never,
      ctx,
    );
    expect(response.status).toBe(403);
    expect(gatewayUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 for an empty update body", async () => {
    await setSession(Role.ADMIN);
    const response = await PATCH(settingsRequest("PATCH", {}) as never, ctx);
    expect(response.status).toBe(400);
  });

  it("allows updating matching config", async () => {
    await setSession(Role.ADMIN);
    const response = await PATCH(
      settingsRequest("PATCH", {
        matching: {
          strategy: MatchingStrategy.UDF_ORDER_ID,
          priority: [],
          fieldMapping: {},
          amountTolerancePaise: 100,
          includeGatewayFees: true,
        },
      }) as never,
      ctx,
    );
    expect(response.status).toBe(200);
    expect(matchingUpsert).toHaveBeenCalledTimes(1);
  });
});
