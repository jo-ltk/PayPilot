import {
  ConnectionStatus,
  GatewayEnvironment,
  GatewayProvider,
  Role,
  WebhookHealth,
} from "@prisma/client";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
const { gatewayFindUnique } = vi.hoisted(() => ({ gatewayFindUnique: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/db", () => ({
  prisma: { paymentGateway: { findUnique: gatewayFindUnique } },
}));

import { POST as validate } from "@/app/api/shops/[shopId]/settings/validate/route";
import { encryptCredentials } from "@/lib/gateways/credentials";
import "@/lib/gateways/index";
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
  gatewayFindUnique.mockResolvedValue({
    id: "g1",
    shopId: "s1",
    provider: GatewayProvider.EASEBUZZ,
    credentials: encryptCredentials({
      key: "merchant-key",
      salt: "merchant-salt",
      merchantEmail: "merchant@example.com",
    }),
    webhookSecret: null,
    webhookVersion: null,
    environment: GatewayEnvironment.SANDBOX,
    connectionStatus: ConnectionStatus.CONNECTED,
    webhookHealth: WebhookHealth.HEALTHY,
    isActive: true,
    connectedAt: new Date(),
    disconnectedAt: null,
    lastWebhookAt: null,
    lastSuccessfulWebhookAt: null,
    lastFailedWebhookAt: null,
    lastSyncAt: null,
    lastSettlementImportAt: null,
    lastRefundImportAt: null,
    lastFailedEventAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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
