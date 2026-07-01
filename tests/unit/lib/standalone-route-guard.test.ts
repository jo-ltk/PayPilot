import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { getStandaloneShopRedirect } from "@/lib/standalone-route-guard";
import type { Session } from "@/schemas/auth.schema";

const session: Session = {
  userId: "user-1",
  email: "user@example.com",
  memberships: [
    { shopId: "shop-a", role: Role.ADMIN },
    { shopId: "shop-b", role: Role.VIEWER },
  ],
};

describe("getStandaloneShopRedirect", () => {
  it("returns null when the user can access the shop", () => {
    expect(getStandaloneShopRedirect(session, "shop-a")).toBeNull();
  });

  it("redirects to the first membership when access is denied", () => {
    expect(getStandaloneShopRedirect(session, "shop-unknown")).toBe(
      "/shops/shop-a",
    );
  });

  it("redirects to login when the session has no memberships", () => {
    expect(
      getStandaloneShopRedirect(
        { ...session, memberships: [] },
        "shop-a",
      ),
    ).toBe("/login");
  });
});
