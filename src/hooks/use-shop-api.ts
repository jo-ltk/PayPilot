"use client";

import { useCallback } from "react";

import { useShopContext } from "@/hooks/use-shop-context";
import type { ApiClientOptions } from "@/lib/api-client";
import { getAppBridgeSessionToken } from "@/lib/shopify/app-bridge";

/**
 * Returns async fetch options for shop-scoped API calls.
 * Embedded mode attaches App Bridge bearer tokens; standalone uses cookies.
 * @returns API client options resolver
 */
export function useShopApi() {
  const { mode } = useShopContext();

  const getOptions = useCallback(async (): Promise<ApiClientOptions> => {
    if (mode === "embedded") {
      const bearerToken = await getAppBridgeSessionToken();
      return { bearerToken };
    }

    return { credentials: "include" };
  }, [mode]);

  return { getOptions };
}
