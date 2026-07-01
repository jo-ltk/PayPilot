import { afterEach, describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: { $queryRaw: queryRaw },
}));

import { getHealthStatus, healthStatusCode } from "@/lib/health";

afterEach(() => {
  vi.clearAllMocks();
});

describe("getHealthStatus", () => {
  it("returns ok when the database probe succeeds", async () => {
    queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    const health = await getHealthStatus();
    expect(health.status).toBe("ok");
    expect(health.checks.database).toBe("ok");
    expect(healthStatusCode(health)).toBe(200);
  });

  it("returns degraded when the database probe fails", async () => {
    queryRaw.mockRejectedValue(new Error("connection refused"));
    const health = await getHealthStatus();
    expect(health.status).toBe("degraded");
    expect(health.checks.database).toBe("error");
    expect(healthStatusCode(health)).toBe(503);
  });
});
