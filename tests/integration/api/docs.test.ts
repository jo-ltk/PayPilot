import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/docs/route";

describe("GET /api/docs", () => {
  it("serves interactive docs in non-production", async () => {
    const spec = readFileSync(join(process.cwd(), "openapi", "spec.json"), "utf8");
    if (!spec.includes("/api/shops/{shopId}/payments")) {
      throw new Error("Run pnpm openapi:generate before testing /api/docs");
    }

    const response = await GET();
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("PayPilot API Docs");
    expect(html).toContain("/api/shops/{shopId}/payments");
  });
});
