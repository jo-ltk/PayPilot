import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "@/lib/format";

describe("format", () => {
  it("formatCurrency converts paise to INR", () => {
    expect(formatCurrency(150000)).toMatch(/1,?500/);
  });

  it("formatDate formats ISO strings", () => {
    expect(formatDate("2026-06-01T10:00:00.000Z")).toBe("01 Jun 2026");
  });

  it("formatRelativeTime returns relative label", () => {
    const recent = new Date(Date.now() - 60_000).toISOString();
    expect(formatRelativeTime(recent)).toMatch(/minute/);
  });

  it("formatNumber groups digits", () => {
    expect(formatNumber(1200000)).toBe("12,00,000");
  });

  it("formatPercent formats decimals", () => {
    expect(formatPercent(98.34)).toBe("98.3%");
  });

  it("returns em dash for invalid dates", () => {
    expect(formatDate("invalid")).toBe("—");
  });
});
