import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("s3cret-password");
    expect(hash).not.toBe("s3cret-password");
    expect(await verifyPassword("s3cret-password", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("s3cret-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("returns false for an empty (pending) hash", async () => {
    expect(await verifyPassword("anything", "")).toBe(false);
  });
});
