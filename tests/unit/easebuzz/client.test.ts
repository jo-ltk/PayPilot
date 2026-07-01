import { GatewayEnvironment } from "@prisma/client";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { ExternalAPIError } from "@/lib/api/errors";
import { validateCredentials } from "@/lib/easebuzz/client";
import type { EasebuzzCredentials } from "@/lib/easebuzz/types";

import { server } from "../../setup/msw-server";

const credentials: EasebuzzCredentials = {
  key: "test-key",
  salt: "test-salt",
  merchantEmail: "merchant@example.com",
  environment: GatewayEnvironment.SANDBOX,
};

describe("validateCredentials", () => {
  it("returns valid for a success status from the sandbox API", async () => {
    const result = await validateCredentials(credentials);
    expect(result.valid).toBe(true);
  });

  it("returns invalid with a message when the API rejects credentials", async () => {
    server.use(
      http.post("https://testpay.easebuzz.in/*", () =>
        HttpResponse.json({ status: 0, error_desc: "Invalid key" }),
      ),
    );
    const result = await validateCredentials(credentials);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Invalid key");
  });

  it("throws ExternalAPIError on a non-2xx response", async () => {
    server.use(
      http.post("https://testpay.easebuzz.in/*", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    await expect(validateCredentials(credentials)).rejects.toBeInstanceOf(
      ExternalAPIError,
    );
  });

  it("targets the production host when environment is PRODUCTION", async () => {
    let hit = false;
    server.use(
      http.post("https://pay.easebuzz.in/*", () => {
        hit = true;
        return HttpResponse.json({ status: 1 });
      }),
    );
    await validateCredentials({
      ...credentials,
      environment: GatewayEnvironment.PRODUCTION,
    });
    expect(hit).toBe(true);
  });
});
