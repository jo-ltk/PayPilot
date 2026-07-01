import { describe, expect, it } from "vitest";

import {
  bucketByDate,
  computeSeriesTrend,
  countSettlementMismatches,
} from "@/lib/dashboard";

describe("dashboard utils", () => {
  it("counts settlement mismatches excluding matched and resolved", () => {
    expect(
      countSettlementMismatches({
        MATCHED: 10,
        RESOLVED: 2,
        AMOUNT_MISMATCH: 3,
        MISSING_SETTLEMENT: 1,
      }),
    ).toBe(4);
  });

  it("buckets dated amounts into sorted trend points", () => {
    const result = bucketByDate([
      { date: "2026-06-02", amountPaise: 100 },
      { date: "2026-06-01", amountPaise: 200 },
      { date: "2026-06-02", amountPaise: 50 },
    ]);

    expect(result).toEqual([
      { date: "2026-06-01", amountPaise: 200, count: 1 },
      { date: "2026-06-02", amountPaise: 150, count: 2 },
    ]);
  });

  it("computes series trend from daily points", () => {
    const trend = computeSeriesTrend([
      { date: "2026-06-01", grossPaise: 100, count: 1 },
      { date: "2026-06-02", grossPaise: 100, count: 1 },
      { date: "2026-06-03", grossPaise: 200, count: 1 },
      { date: "2026-06-04", grossPaise: 200, count: 1 },
    ]);

    expect(trend.direction).toBe("up");
    expect(trend.value).toContain("% vs prior period");
  });
});
