import { parseApiResponse } from "@/lib/api/envelope";
import type {
  AcceptInviteInput,
  LoginInput,
  SessionMembership,
  ShopifyAuthResult,
} from "@/schemas/auth.schema";

export type AuthSessionResult = {
  userId: string;
  email: string;
  shops: SessionMembership[];
};

/**
 * Authenticates a finance user via the standalone login endpoint.
 * @param input - Email and password credentials
 * @returns User identity and shop memberships
 */
export async function loginUser(input: LoginInput): Promise<AuthSessionResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseApiResponse<AuthSessionResult>(response);
}

/**
 * Accepts a team invite and establishes a standalone session.
 * @param input - Invite token, display name, and password
 * @returns User identity and shop memberships
 */
export async function acceptInvite(
  input: AcceptInviteInput,
): Promise<AuthSessionResult> {
  const response = await fetch("/api/auth/invite/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseApiResponse<AuthSessionResult>(response);
}

/**
 * Clears the standalone session cookie.
 */
export async function logoutUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  await parseApiResponse<{ success: boolean }>(response);
}

/**
 * Bootstraps an embedded Shopify session via token exchange.
 * @param sessionToken - App Bridge session token JWT
 * @returns Installed shop identifiers
 */
export async function bootstrapShopifySession(
  sessionToken: string,
): Promise<ShopifyAuthResult> {
  const response = await fetch("/api/auth/shopify", {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  return parseApiResponse<ShopifyAuthResult>(response);
}
