import { createHash } from "crypto";

import { describe, expect, it } from "vitest";

import { sha512Hex, transactionDateHash } from "@/lib/easebuzz/hash";

describe("sha512Hex", () => {
  it("joins parts with a pipe and hashes with SHA-512", () => {
    const expected = createHash("sha512").update("a|b|c").digest("hex");
    expect(sha512Hex(["a", "b", "c"])).toBe(expected);
  });

  it("is deterministic for identical inputs", () => {
    expect(sha512Hex(["x", "y"])).toBe(sha512Hex(["x", "y"]));
  });

  it("changes when ordering changes", () => {
    expect(sha512Hex(["a", "b"])).not.toBe(sha512Hex(["b", "a"]));
  });
});

describe("transactionDateHash", () => {
  it("uses sequence key|merchant_email|transaction_date|salt", () => {
    const expected = sha512Hex(["k", "m@x.io", "01-01-2026", "s"]);
    expect(transactionDateHash("k", "m@x.io", "01-01-2026", "s")).toBe(expected);
  });
});
