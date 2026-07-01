import { beforeEach, describe, expect, it, vi } from "vitest";

import { decrypt } from "@/lib/crypto/encrypt";

const { upsert } = vi.hoisted(() => ({ upsert: vi.fn() }));

vi.mock("@/lib/db", () => ({ prisma: { shop: { upsert } } }));

import { upsertShopWithSession } from "@/lib/services/shop.service";

type UpsertArg = {
  create: {
    onboardingStep: string;
    session: { create: { accessToken: string; scope: string } };
  };
  update: {
    session: { upsert: { create: { accessToken: string } } };
  };
};

describe("upsertShopWithSession", () => {
  beforeEach(() => {
    upsert.mockReset();
    upsert.mockResolvedValue({ id: "shop_1" });
  });

  it("encrypts the access token at rest", async () => {
    await upsertShopWithSession({
      shopDomain: "demo.myshopify.com",
      accessToken: "shpat_plain_secret",
      scope: "read_orders",
    });

    const arg = upsert.mock.calls[0][0] as UpsertArg;
    const stored = arg.create.session.create.accessToken;
    expect(stored).not.toBe("shpat_plain_secret");
    expect(decrypt(stored)).toBe("shpat_plain_secret");
  });

  it("advances onboarding to CONNECT_GATEWAY on create", async () => {
    await upsertShopWithSession({
      shopDomain: "demo.myshopify.com",
      accessToken: "shpat_plain_secret",
      scope: "read_orders",
    });

    const arg = upsert.mock.calls[0][0] as UpsertArg;
    expect(arg.create.onboardingStep).toBe("CONNECT_GATEWAY");
  });

  it("returns the upserted shop", async () => {
    const shop = await upsertShopWithSession({
      shopDomain: "demo.myshopify.com",
      accessToken: "shpat_plain_secret",
      scope: "read_orders",
    });
    expect(shop).toEqual({ id: "shop_1" });
  });
});
