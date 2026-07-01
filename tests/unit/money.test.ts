import { describe, expect, it } from "vitest";

import { toPaise } from "@/lib/money";

describe("toPaise", () => {
  it("converts a decimal rupee string to integer paise", () => {
    expect(toPaise("1500.00")).toBe(150000);
    expect(toPaise("1500.50")).toBe(150050);
  });

  it("converts a numeric amount to paise", () => {
    expect(toPaise(99.99)).toBe(9999);
  });

  it("rounds to the nearest paise", () => {
    expect(toPaise("10.005")).toBe(1001);
  });

  it("handles zero", () => {
    expect(toPaise("0")).toBe(0);
  });

  it("throws on a non-numeric amount", () => {
    expect(() => toPaise("abc")).toThrow();
  });
});
