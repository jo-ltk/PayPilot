import { describe, expect, it } from "vitest";

import { queryKeys } from "@/lib/query-keys";

describe("queryKeys", () => {
  it("builds stable shop-scoped keys", () => {
    expect(queryKeys.payments("s1", { page: 1 })).toEqual([
      "shop",
      "s1",
      "payments",
      { page: 1 },
    ]);
  });

  it("builds analytics key with range", () => {
    expect(
      queryKeys.analytics("s1", { from: "2026-01-01", to: "2026-06-01" }),
    ).toEqual(["shop", "s1", "analytics", { from: "2026-01-01", to: "2026-06-01" }]);
  });
});
