import { describe, expect, it } from "vitest";

import { buildOrderBy, parseListQuery } from "@/lib/api/query";

describe("parseListQuery", () => {
  it("applies defaults for pagination and sort", () => {
    const query = parseListQuery(new URL("http://localhost/api/test"));
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(25);
    expect(query.sortOrder).toBe("desc");
  });

  it("parses filters and date range", () => {
    const query = parseListQuery(
      new URL(
        "http://localhost/api/test?page=2&pageSize=10&status=success&search=abc&from=2026-01-01&to=2026-01-31&sortBy=amountPaise&sortOrder=asc",
      ),
    );
    expect(query.page).toBe(2);
    expect(query.pageSize).toBe(10);
    expect(query.status).toBe("success");
    expect(query.search).toBe("abc");
    expect(query.from?.toISOString()).toBe(new Date("2026-01-01").toISOString());
    expect(query.sortBy).toBe("amountPaise");
    expect(query.sortOrder).toBe("asc");
  });
});

describe("buildOrderBy", () => {
  it("uses fallback when sortBy is not allowed", () => {
    expect(buildOrderBy("bad", "asc", ["occurredAt"], "occurredAt")).toEqual({
      occurredAt: "asc",
    });
  });

  it("uses requested field when allowed", () => {
    expect(
      buildOrderBy("amountPaise", "desc", ["amountPaise", "occurredAt"], "occurredAt"),
    ).toEqual({ amountPaise: "desc" });
  });
});
