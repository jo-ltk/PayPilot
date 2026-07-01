import { afterEach, describe, expect, it, vi } from "vitest";

import type { ShopifyGlobal } from "@/lib/shopify/app-bridge";
import {
  getAppBridgeSessionToken,
  isAppBridgeEnvironment,
  waitForShopifyGlobal,
} from "@/lib/shopify/app-bridge";

type ShopifyWindow = Window & { shopify?: ShopifyGlobal };

describe("app-bridge utilities", () => {
  afterEach(() => {
    const win = window as ShopifyWindow;
    Reflect.deleteProperty(win, "shopify");
    vi.useRealTimers();
  });

  it("waits for the Shopify global and resolves idToken", async () => {
    const idToken = vi.fn().mockResolvedValue("jwt-token");
    const win = window as ShopifyWindow;

    win.shopify = {
      ready: Promise.resolve(),
      idToken,
    };

    const shopify = await waitForShopifyGlobal();
    const token = await getAppBridgeSessionToken();

    expect(shopify).toBe(win.shopify);
    expect(token).toBe("jwt-token");
    expect(idToken).toHaveBeenCalledOnce();
  });

  it("detects App Bridge environment", () => {
    const win = window as ShopifyWindow;

    expect(isAppBridgeEnvironment()).toBe(false);

    win.shopify = {
      ready: Promise.resolve(),
      idToken: vi.fn(),
    };

    expect(isAppBridgeEnvironment()).toBe(true);
  });

  it("rejects when App Bridge does not initialize in time", async () => {
    vi.useFakeTimers();

    const promise = waitForShopifyGlobal(200);
    const assertion = expect(promise).rejects.toThrow(
      "Shopify App Bridge failed to initialize",
    );

    await vi.advanceTimersByTimeAsync(250);
    await assertion;
  });
});
