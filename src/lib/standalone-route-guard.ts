import type { Session } from "@/schemas/auth.schema";

/**
 * Resolves a redirect when the user lacks access to the requested shop.
 * @param session - Active standalone session
 * @param shopId - Requested shop id from the route
 * @returns Redirect path, or null when access is allowed
 */
export function getStandaloneShopRedirect(
  session: Session,
  shopId: string,
): string | null {
  const hasAccess = session.memberships.some(
    (membership) => membership.shopId === shopId,
  );

  if (hasAccess) {
    return null;
  }

  const fallbackShopId = session.memberships[0]?.shopId;
  if (fallbackShopId) {
    return `/shops/${fallbackShopId}`;
  }

  return "/login";
}
