import { endOfDay, startOfDay, subDays } from "date-fns";
import { describe, expect, it } from "vitest";

import {
  defaultAnalyticsRange,
  detectAnalyticsPreset,
  resolveAnalyticsPreset,
} from "@/lib/analytics-range";

describe("analytics-range", () => {
  const reference = new Date("2026-06-15T12:00:00.000Z");

  it("resolves today preset", () => {
    const range = resolveAnalyticsPreset("today", reference);
    expect(range.from).toEqual(startOfDay(reference));
    expect(range.to).toEqual(endOfDay(reference));
  });

  it("resolves last 7 days preset", () => {
    const range = resolveAnalyticsPreset("7d", reference);
    expect(range.from).toEqual(startOfDay(subDays(reference, 6)));
    expect(range.to).toEqual(endOfDay(reference));
  });

  it("defaults to last 30 days", () => {
    const range = defaultAnalyticsRange();
    expect(range.from).toBeDefined();
    expect(range.to).toBeDefined();
  });

  it("detects matching preset", () => {
    const range = resolveAnalyticsPreset("30d");
    expect(detectAnalyticsPreset(range)).toBe("30d");
  });
});
