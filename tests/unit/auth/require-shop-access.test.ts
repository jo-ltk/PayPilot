import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { AuthError, ForbiddenError } from "@/lib/api/errors";
import { resolveShopAccess } from "@/lib/auth/require-shop-access";
import type { Session } from "@/schemas/auth.schema";

const session: Session = {
  userId: "u1",
  email: "user@example.com",
  memberships: [
    { shopId: "shop_admin", role: Role.ADMIN },
    { shopId: "shop_viewer", role: Role.VIEWER },
  ],
};

describe("resolveShopAccess", () => {
  it("throws AuthError when unauthenticated", () => {
    expect(() => resolveShopAccess(null, "shop_admin", Role.VIEWER)).toThrow(
      AuthError,
    );
  });

  it("throws ForbiddenError when the user has no membership for the shop", () => {
    expect(() => resolveShopAccess(session, "shop_other", Role.VIEWER)).toThrow(
      ForbiddenError,
    );
  });

  it("throws ForbiddenError when the role is insufficient", () => {
    expect(() => resolveShopAccess(session, "shop_viewer", Role.ADMIN)).toThrow(
      ForbiddenError,
    );
  });

  it("returns access when the role is sufficient", () => {
    const access = resolveShopAccess(session, "shop_admin", Role.ADMIN);
    expect(access).toEqual({
      userId: "u1",
      shopId: "shop_admin",
      role: Role.ADMIN,
    });
  });

  it("allows a higher role to satisfy a lower requirement", () => {
    const access = resolveShopAccess(session, "shop_admin", Role.VIEWER);
    expect(access.role).toBe(Role.ADMIN);
  });
});
