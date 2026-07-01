import { afterEach, describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: { $queryRaw: queryRaw },
}));

import { GET } from "@/app/api/health/route";

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health", () => {
  it("returns ok status with database check", async () => {
    queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: { status: "ok", checks: { database: "ok" } },
    });
    expect(body.data.timestamp).toBeDefined();
    expect(body.data.version).toBeDefined();
  });

  it("returns 503 when the database probe fails", async () => {
    queryRaw.mockRejectedValue(new Error("down"));
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.data.status).toBe("degraded");
    expect(body.data.checks.database).toBe("error");
  });
});
