import {
  GatewayEnvironment,
  GatewayProvider,
  MatchingStrategy,
} from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const {
  gatewayFindFirst,
  gatewayFindMany,
  gatewayUpdate,
  gatewayCreate,
  matchingFindUnique,
  matchingUpsert,
} = vi.hoisted(() => ({
  gatewayFindFirst: vi.fn(),
  gatewayFindMany: vi.fn(),
  gatewayUpdate: vi.fn(),
  gatewayCreate: vi.fn(),
  matchingFindUnique: vi.fn(),
  matchingUpsert: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    paymentGateway: {
      findFirst: gatewayFindFirst,
      findMany: gatewayFindMany,
      update: gatewayUpdate,
      create: gatewayCreate,
    },
    matchingConfig: { findUnique: matchingFindUnique, upsert: matchingUpsert },
  },
}));

import { encrypt } from "@/lib/crypto/encrypt";
import {
  getGatewayCredentials,
  getGatewayIdForShop,
  getSettings,
  maskSecret,
  resolveGatewayByKey,
  updateSettings,
} from "@/lib/services/settings.service";

/** Builds a stored gateway record with encrypted secrets. */
function storedGateway() {
  return {
    id: "g1",
    shopId: "s1",
    provider: GatewayProvider.EASEBUZZ,
    key: encrypt("merchant-key-abcd"),
    salt: encrypt("merchant-salt-wxyz"),
    merchantEmail: "merchant@example.com",
    environment: GatewayEnvironment.SANDBOX,
    isActive: true,
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
    gatewayFindFirst.mockResolvedValue(storedGateway());
    matchingFindUnique.mockResolvedValue(null);

    const settings = await getSettings("s1");

    expect(settings.gateway?.keyMasked).toBe("****abcd");
    expect(settings.gateway?.saltMasked).toBe("****wxyz");
    expect(JSON.stringify(settings)).not.toContain("merchant-key-abcd");
  });

  it("returns nulls when nothing is configured", async () => {
    gatewayFindFirst.mockResolvedValue(null);
    matchingFindUnique.mockResolvedValue(null);

    const settings = await getSettings("s1");
    expect(settings.gateway).toBeNull();
    expect(settings.matching).toBeNull();
  });
});

describe("updateSettings", () => {
  it("encrypts key and salt at rest when creating a gateway", async () => {
    gatewayFindFirst.mockResolvedValueOnce(null).mockResolvedValue(storedGateway());
    gatewayCreate.mockResolvedValue(undefined);
    matchingFindUnique.mockResolvedValue(null);

    await updateSettings("s1", {
      gateway: {
        key: "plain-key",
        salt: "plain-salt",
        merchantEmail: "merchant@example.com",
        environment: GatewayEnvironment.SANDBOX,
      },
    });

    const data = gatewayCreate.mock.calls[0][0].data;
    expect(data.key).not.toBe("plain-key");
    expect(data.salt).not.toBe("plain-salt");
  });

  it("upserts matching config", async () => {
    gatewayFindFirst.mockResolvedValue(null);
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
    gatewayFindFirst.mockResolvedValue(storedGateway());
    const creds = await getGatewayCredentials("s1");
    expect(creds.key).toBe("merchant-key-abcd");
    expect(creds.salt).toBe("merchant-salt-wxyz");
  });

  it("throws when no gateway is configured", async () => {
    gatewayFindFirst.mockResolvedValue(null);
    await expect(getGatewayCredentials("s1")).rejects.toThrow();
  });
});

describe("resolveGatewayByKey", () => {
  it("matches an active gateway by its decrypted key and returns the salt", async () => {
    gatewayFindMany.mockResolvedValue([storedGateway()]);
    const resolved = await resolveGatewayByKey("merchant-key-abcd");
    expect(resolved).toEqual({
      id: "g1",
      shopId: "s1",
      salt: "merchant-salt-wxyz",
    });
  });

  it("returns null when no active gateway matches the key", async () => {
    gatewayFindMany.mockResolvedValue([storedGateway()]);
    expect(await resolveGatewayByKey("unknown-key")).toBeNull();
  });
});

describe("getGatewayIdForShop", () => {
  it("returns the gateway id when configured", async () => {
    gatewayFindFirst.mockResolvedValue(storedGateway());
    expect(await getGatewayIdForShop("s1")).toBe("g1");
  });

  it("returns null when not configured", async () => {
    gatewayFindFirst.mockResolvedValue(null);
    expect(await getGatewayIdForShop("s1")).toBeNull();
  });
});
