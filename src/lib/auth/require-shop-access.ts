import { Role } from "@prisma/client";
import { cookies } from "next/headers";

import { AuthError, ForbiddenError } from "@/lib/api/errors";
import { assertRole } from "@/lib/auth/rbac";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/standalone";
import type { Session } from "@/schemas/auth.schema";

export type ShopAccess = {
  userId: string;
  shopId: string;
  role: Role;
};

/**
 * Reads and verifies the current session from the request cookies.
 * @returns The session, or null when absent or invalid
 */
export async function getCurrentSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Resolves shop access for a session against a required role.
 * @param session - Current session (or null)
 * @param shopId - Target shop id
 * @param required - Minimum role required
 * @returns Resolved access context
 * @throws {AuthError} When unauthenticated
 * @throws {ForbiddenError} When the user lacks access or sufficient role
 */
export function resolveShopAccess(
  session: Session | null,
  shopId: string,
  required: Role,
): ShopAccess {
  if (!session) {
    throw new AuthError("Authentication required");
  }
  const membership = session.memberships.find((m) => m.shopId === shopId);
  if (!membership) {
    throw new ForbiddenError("No access to this shop");
  }
  assertRole(membership.role, required);
  return { userId: session.userId, shopId, role: membership.role };
}

/**
 * Enforces that the current user can access a shop at a minimum role.
 * @param shopId - Target shop id
 * @param required - Minimum role required (default VIEWER)
 * @returns Resolved access context
 * @throws {AuthError | ForbiddenError} When access is denied
 */
export async function requireShopAccess(
  shopId: string,
  required: Role = Role.VIEWER,
): Promise<ShopAccess> {
  const session = await getCurrentSession();
  return resolveShopAccess(session, shopId, required);
}
