import { Role } from "@prisma/client";

import { hasRole } from "@/lib/auth/rbac";
import type { AppMode } from "@/hooks/use-shop-context";

/**
 * Whether the user can edit gateway and matching settings.
 * @param mode - Embedded or standalone shell
 * @param role - Standalone role (null in embedded Shopify Admin)
 * @returns True when edits are permitted
 */
export function canEditSettings(
  mode: AppMode,
  role: Role | null,
): boolean {
  if (mode === "embedded") {
    return true;
  }

  return role != null && hasRole(role, Role.ADMIN);
}

/**
 * Whether the user can invite or manage team members.
 * @param mode - Embedded or standalone shell
 * @param role - Standalone role (null in embedded Shopify Admin)
 * @returns True when team management is permitted
 */
export function canManageTeam(mode: AppMode, role: Role | null): boolean {
  return canEditSettings(mode, role);
}
