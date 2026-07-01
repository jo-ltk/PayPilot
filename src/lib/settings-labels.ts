import { GatewayEnvironment, MatchingStrategy, Role } from "@prisma/client";

/** Human-readable labels for gateway environments. */
export const GATEWAY_ENVIRONMENT_LABELS: Record<GatewayEnvironment, string> = {
  [GatewayEnvironment.SANDBOX]: "Sandbox",
  [GatewayEnvironment.PRODUCTION]: "Production",
};

/** Human-readable labels for matching strategies. */
export const MATCHING_STRATEGY_LABELS: Record<MatchingStrategy, string> = {
  [MatchingStrategy.UDF_ORDER_ID]: "UDF order ID",
  [MatchingStrategy.UDF_ORDER_NAME]: "UDF order name",
  [MatchingStrategy.TXNID_ORDER_NAME]: "Transaction ID → order name",
  [MatchingStrategy.SHOPIFY_PAYMENT_ID]: "Shopify payment ID",
  [MatchingStrategy.COMPOSITE]: "Composite (priority order)",
};

/** Human-readable labels for team roles. */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.OWNER]: "Owner",
  [Role.ADMIN]: "Admin",
  [Role.VIEWER]: "Viewer",
};

/**
 * Builds an invite acceptance URL for the standalone portal.
 * @param token - Invite token from the API
 * @returns Absolute invite URL
 */
export function buildInviteUrl(token: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

  return `${base}/invite/${token}`;
}
