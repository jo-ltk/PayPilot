import { describe, expect, it } from "vitest";

import { buildInviteUrl } from "@/lib/settings-labels";

describe("buildInviteUrl", () => {
  it("builds an invite URL with the provided token", () => {
    expect(buildInviteUrl("abc123")).toContain("/invite/abc123");
  });
});
