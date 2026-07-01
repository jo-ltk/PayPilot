"use client";

import { useEffect, useState, type ReactNode } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import type { ShopContextValue } from "@/hooks/use-shop-context";
import { bootstrapShopifySession } from "@/lib/auth-client";
import { getAppBridgeSessionToken } from "@/lib/shopify/app-bridge";

interface ShopifyProviderProps {
  children: ReactNode;
}

type BootstrapState = Pick<
  ShopContextValue,
  "shopId" | "shopDomain" | "isBootstrapping" | "error"
>;

const initialState: BootstrapState = {
  shopId: null,
  shopDomain: null,
  isBootstrapping: true,
  error: null,
};

/**
 * Bootstraps embedded Shopify auth via App Bridge session tokens.
 * Wraps children with shop context after POST /api/auth/shopify succeeds.
 */
export function ShopifyProvider({ children }: ShopifyProviderProps) {
  const [state, setState] = useState<BootstrapState>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap(): Promise<void> {
      try {
        const token = await getAppBridgeSessionToken();
        const result = await bootstrapShopifySession(token);

        if (!cancelled) {
          setState({
            shopId: result.shopId,
            shopDomain: result.shopDomain,
            isBootstrapping: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            shopId: null,
            shopDomain: null,
            isBootstrapping: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to authenticate with Shopify",
          });
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const contextValue: ShopContextValue = {
    mode: "embedded",
    shopId: state.shopId,
    shopDomain: state.shopDomain,
    role: null,
    userId: null,
    userEmail: null,
    memberships: [],
    isBootstrapping: state.isBootstrapping,
    error: state.error,
  };

  if (state.isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <LoadingSkeleton className="h-32 w-full max-w-md" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState
          title="Shopify authentication failed"
          message={state.error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <ShopContextProvider value={contextValue}>{children}</ShopContextProvider>
  );
}
