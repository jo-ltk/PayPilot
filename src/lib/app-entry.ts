import type { Session } from "@/schemas/auth.schema";

/** Browser entry route that forwards to the signed-in shop dashboard. */
export const APP_ENTRY_PATH = "/dashboard" as const;

/**
 * Builds the standalone finance portal dashboard path for a shop.
 * @param shopId - Active shop id
 */
export function buildShopDashboardPath(shopId: string): string {
  return `/shops/${shopId}`;
}

/**
 * Resolves the href for marketing CTAs based on session state.
 * @param session - Current standalone session, if any
 */
export function resolveDashboardHref(session: Session | null): string {
  const shopId = session?.memberships[0]?.shopId;

  if (shopId) {
    return buildShopDashboardPath(shopId);
  }

  return `/login?redirect=${encodeURIComponent(APP_ENTRY_PATH)}`;
}

/**
 * Resolves a post-login destination from an optional redirect param.
 * @param shops - Shop memberships returned by the login API
 * @param redirectTo - Optional redirect query param
 */
export function resolvePostLoginPath(
  shops: { shopId: string }[],
  redirectTo?: string,
): string {
  const firstShop = shops[0];
  if (!firstShop) {
    throw new Error("No shop memberships found for this account");
  }

  if (redirectTo?.startsWith("/shops/")) {
    return redirectTo;
  }

  if (redirectTo === APP_ENTRY_PATH || redirectTo === "/start") {
    return buildShopDashboardPath(firstShop.shopId);
  }

  return buildShopDashboardPath(firstShop.shopId);
}
