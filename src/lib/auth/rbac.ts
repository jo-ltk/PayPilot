import { Role } from "@prisma/client";

import { ForbiddenError } from "@/lib/api/errors";

/** Ordered privilege ranking; higher numbers subsume lower roles. */
export const ROLE_RANK: Record<Role, number> = {
  [Role.VIEWER]: 1,
  [Role.ADMIN]: 2,
  [Role.OWNER]: 3,
};

/**
 * Checks whether an actual role satisfies a required minimum role.
 * @param actual - The user's role
 * @param required - The minimum role required
 * @returns Whether access is permitted
 */
export function hasRole(actual: Role, required: Role): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

/**
 * Asserts that a role meets the required minimum, throwing otherwise.
 * @param actual - The user's role
 * @param required - The minimum role required
 * @throws {ForbiddenError} When the role is insufficient
 */
export function assertRole(actual: Role, required: Role): void {
  if (!hasRole(actual, required)) {
    throw new ForbiddenError(`Requires ${required} role`);
  }
}
