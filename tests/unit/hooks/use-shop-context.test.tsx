import { render, screen } from "@testing-library/react";
import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import { useShopContext } from "@/hooks/use-shop-context";

function Probe() {
  const context = useShopContext();
  return (
    <div>
      <span data-testid="mode">{context.mode}</span>
      <span data-testid="role">{context.role}</span>
    </div>
  );
}

describe("useShopContext", () => {
  it("returns provided standalone shop context", () => {
    render(
      <ShopContextProvider
        value={{
          mode: "standalone",
          shopId: "shop-1",
          shopDomain: null,
          role: Role.ADMIN,
          memberships: [{ shopId: "shop-1", role: Role.ADMIN }],
          isBootstrapping: false,
          error: null,
        }}
      >
        <Probe />
      </ShopContextProvider>,
    );

    expect(screen.getByTestId("mode")).toHaveTextContent("standalone");
    expect(screen.getByTestId("role")).toHaveTextContent("ADMIN");
  });
});
