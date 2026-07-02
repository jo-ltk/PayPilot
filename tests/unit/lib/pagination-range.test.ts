import { describe, expect, it } from "vitest";

import { getPaginationRange } from "@/lib/pagination-range";

describe("getPaginationRange", () => {
  it("returns an empty array when there are no pages", () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
  });

  it("returns all pages when the total is small", () => {
    expect(getPaginationRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("shows first, neighbors, and last page with ellipsis", () => {
    expect(getPaginationRange(4, 10)).toEqual([
      1,
      "ellipsis",
      3,
      4,
      5,
      "ellipsis",
      10,
    ]);
  });

  it("shows a trailing range near the end", () => {
    expect(getPaginationRange(9, 10)).toEqual([
      1,
      "ellipsis",
      6,
      7,
      8,
      9,
      10,
    ]);
  });

  it("shows a leading range near the start", () => {
    expect(getPaginationRange(2, 10)).toEqual([
      1,
      2,
      3,
      4,
      5,
      "ellipsis",
      10,
    ]);
  });
});
