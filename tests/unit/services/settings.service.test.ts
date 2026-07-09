import {
  ConnectionStatus,
  GatewayEnvironment,
  GatewayProvider,
  MatchingStrategy,
  WebhookHealth,
} from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const {
  gatewayFindUnique,
  gatewayFindMany,
  gatewayUpdate,
  gatewayCreate,
  matchingFindUnique,
  matchingUpsert,
  auditCreate,
} = vi.hoisted(() => ({
  gatewayFindUnique: vi.fn(),
  gatewayFindMany: vi.fn(),
  gatewayUpdate: vi.fn(),
  gatewayCreate: vi.fn(),
  matchingFindUnique: vi.fn(),
  matchingUpsert: vi.fn(),
  auditCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    paymentGateway: {
      findUnique: gatewayFindUnique,
      findMany: gatewayFindMany,
      update: gatewayUpdate,
      create: gatewayCreate,
    },
    matchingConfig: { findUnique: matchingFindUnique, upsert: matchingUpsert },
    integrationAuditLog: { create: auditCreate },
  },
}));

import { encryptCredentials } from "@/lib/gateways/credentials";
import "@/lib/gateways/index";
import {
  getGatewayCredentials,
  getGatewayIdForShop,
  getSettings,
  maskSecret,
  resolveGatewayByKey,
  updateSettings,
} from "@/lib/services/settings.service";

/** Builds a stored gateway record with encrypted credentials JSON. */
function storedGateway() {
  return {
    id: "g1",
    shopId: "s1",
    provider: GatewayProvider.EASEBUZZ,
    credentials: encryptCredentials({
      key: "merchant-key-abcd",
      salt: "merchant-salt-wxyz",
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
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("maskSecret", () => {
  it("reveals only the last four characters", () => {
    expect(maskSecret("merchant-key-abcd")).toBe("****abcd");
  });

  it("fully masks short values", () => {
    expect(maskSecret("ab")).toBe("****");
  });
});

describe("getSettings", () => {
  it("returns masked secrets, never plaintext", async () => {
    gatewayFindUnique.mockResolvedValue(storedGateway());
    matchingFindUnique.mockResolvedValue(null);

    const settings = await getSettings("s1");

    expect(settings.gateway?.credentialsMasked.key).toBe("****abcd");
    expect(settings.gateway?.credentialsMasked.salt).toBe("****wxyz");
    expect(JSON.stringify(settings)).not.toContain("merchant-key-abcd");
  });

  it("returns nulls when nothing is configured", async () => {
    gatewayFindUnique.mockResolvedValue(null);
    matchingFindUnique.mockResolvedValue(null);

    const settings = await getSettings("s1");
    expect(settings.gateway).toBeNull();
    expect(settings.matching).toBeNull();
  });
});

describe("updateSettings", () => {
  it("encrypts credentials JSON at rest when creating a gateway", async () => {
    gatewayFindUnique.mockResolvedValueOnce(null).mockResolvedValue(storedGateway());
    gatewayCreate.mockResolvedValue({ id: "g1" });
    matchingFindUnique.mockResolvedValue(null);
    auditCreate.mockResolvedValue(undefined);

    await updateSettings("s1", {
      gateway: {
        credentials: {
          key: "plain-key",
          salt: "plain-salt",
          merchantEmail: "merchant@example.com",
        },
        environment: GatewayEnvironment.SANDBOX,
      },
    });

    const data = gatewayCreate.mock.calls[0][0].data;
    expect(data.credentials).not.toContain("plain-key");
    expect(auditCreate).toHaveBeenCalled();
  });

  it("upserts matching config", async () => {
    gatewayFindUnique.mockResolvedValue(null);
    matchingFindUnique.mockResolvedValue(null);
    matchingUpsert.mockResolvedValue(undefined);

    await updateSettings("s1", {
      matching: {
        strategy: MatchingStrategy.COMPOSITE,
        priority: ["UDF_ORDER_ID"],
        fieldMapping: { udf1: "orderId" },
        amountTolerancePaise: 0,
        includeGatewayFees: false,
      },
    });

    expect(matchingUpsert).toHaveBeenCalledTimes(1);
  });
});

describe("getGatewayCredentials", () => {
  it("decrypts stored credentials", async () => {
    gatewayFindUnique.mockResolvedValue(storedGateway());
    const creds = await getGatewayCredentials("s1");
    expect(creds.key).toBe("merchant-key-abcd");
    expect(creds.salt).toBe("merchant-salt-wxyz");
  });

  it("throws when no gateway is configured", async () => {
    gatewayFindUnique.mockResolvedValue(null);
    await expect(getGatewayCredentials("s1")).rejects.toThrow();
  });
});

describe("resolveGatewayByKey", () => {
  it("matches an active gateway by its decrypted key", async () => {
    gatewayFindMany.mockResolvedValue([storedGateway()]);
    const resolved = await resolveGatewayByKey("merchant-key-abcd");
    expect(resolved).toEqual({
      id: "g1",
      shopId: "s1",
      provider: GatewayProvider.EASEBUZZ,
      verificationSecret: "merchant-salt-wxyz",
    });
  });

  it("returns null when no active gateway matches the key", async () => {
    gatewayFindMany.mockResolvedValue([storedGateway()]);
    expect(await resolveGatewayByKey("unknown-key")).toBeNull();
  });
});

describe("getGatewayIdForShop", () => {
  it("returns the gateway id when configured", async () => {
    gatewayFindUnique.mockResolvedValue(storedGateway());
    expect(await getGatewayIdForShop("s1")).toBe("g1");
  });

  it("returns null when not configured", async () => {
    gatewayFindUnique.mockResolvedValue(null);
    expect(await getGatewayIdForShop("s1")).toBeNull();
  });
});
