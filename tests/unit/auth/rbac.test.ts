import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { ForbiddenError } from "@/lib/api/errors";
import { assertRole, hasRole } from "@/lib/auth/rbac";

describe("RBAC role matrix", () => {
  it("OWNER satisfies every required role", () => {
    expect(hasRole(Role.OWNER, Role.OWNER)).toBe(true);
    expect(hasRole(Role.OWNER, Role.ADMIN)).toBe(true);
    expect(hasRole(Role.OWNER, Role.VIEWER)).toBe(true);
  });

  it("ADMIN satisfies ADMIN and VIEWER but not OWNER", () => {
    expect(hasRole(Role.ADMIN, Role.OWNER)).toBe(false);
    expect(hasRole(Role.ADMIN, Role.ADMIN)).toBe(true);
    expect(hasRole(Role.ADMIN, Role.VIEWER)).toBe(true);
  });

  it("VIEWER satisfies only VIEWER", () => {
    expect(hasRole(Role.VIEWER, Role.OWNER)).toBe(false);
    expect(hasRole(Role.VIEWER, Role.ADMIN)).toBe(false);
    expect(hasRole(Role.VIEWER, Role.VIEWER)).toBe(true);
  });

  it("assertRole throws ForbiddenError when insufficient", () => {
    expect(() => assertRole(Role.VIEWER, Role.ADMIN)).toThrow(ForbiddenError);
    expect(() => assertRole(Role.ADMIN, Role.OWNER)).toThrow(ForbiddenError);
  });

  it("assertRole passes when sufficient", () => {
    expect(() => assertRole(Role.ADMIN, Role.VIEWER)).not.toThrow();
    expect(() => assertRole(Role.OWNER, Role.OWNER)).not.toThrow();
  });
});
