import { describe, expect, it } from "vitest";

import { AUTH_RATE_LIMIT, isRateLimited } from "@/lib/rate-limit";

describe("isRateLimited", () => {
  it("allows requests under the limit", () => {
    const key = "test-key-1";
    expect(isRateLimited(key, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs)).toBe(
      false,
    );
    expect(isRateLimited(key, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs)).toBe(
      false,
    );
  });

  it("blocks requests over the limit within the window", () => {
    const key = "test-key-2";
    for (let i = 0; i < AUTH_RATE_LIMIT.limit; i += 1) {
      isRateLimited(key, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs);
    }
    expect(isRateLimited(key, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs)).toBe(
      true,
    );
  });
});
