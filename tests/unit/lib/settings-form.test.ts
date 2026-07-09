import { GatewayEnvironment, MatchingStrategy } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  buildSettingsPatch,
  hasUnsavedSettings,
  settingsToFormValues,
  validateGatewaySave,
} from "@/lib/settings-form";
import type { SettingsResponse } from "@/schemas/settings.schema";

const baseline: SettingsResponse = {
  gateway: {
    id: "gw-1",
    provider: "EASEBUZZ",
    credentialsMasked: {
      key: "****1234",
      salt: "****5678",
      merchantEmail: "merchant@example.com",
    },
    environment: GatewayEnvironment.SANDBOX,
    isActive: true,
    connectionStatus: "CONNECTED",
    webhookHealth: "HEALTHY",
    connectedAt: null,
    lastWebhookAt: null,
  },
  matching: {
    strategy: MatchingStrategy.UDF_ORDER_ID,
    priority: [],
    fieldMapping: {},
    amountTolerancePaise: 0,
    includeGatewayFees: false,
  },
};

describe("settingsToFormValues", () => {
  it("maps masked settings without exposing secrets", () => {
    const values = settingsToFormValues(baseline);

    expect(values.merchantKey).toBe("");
    expect(values.merchantSalt).toBe("");
    expect(values.merchantEmail).toBe("merchant@example.com");
    expect(values.strategy).toBe(MatchingStrategy.UDF_ORDER_ID);
  });
});

describe("hasUnsavedSettings", () => {
  it("detects matching strategy edits", () => {
    const values = settingsToFormValues(baseline);
    values.strategy = MatchingStrategy.COMPOSITE;

    expect(hasUnsavedSettings(values, baseline)).toBe(true);
  });

  it("returns false when values match baseline", () => {
    const values = settingsToFormValues(baseline);
    expect(hasUnsavedSettings(values, baseline)).toBe(false);
  });
});

describe("buildSettingsPatch", () => {
  it("includes gateway when credentials are provided", () => {
    const values = settingsToFormValues(baseline);
    values.merchantKey = "new-key";
    values.merchantSalt = "new-salt";

    const patch = buildSettingsPatch(values, baseline.matching, true);

    expect(patch.gateway?.credentials.key).toBe("new-key");
    expect(patch.matching?.strategy).toBe(MatchingStrategy.UDF_ORDER_ID);
  });

  it("omits gateway when credentials are not provided", () => {
    const values = settingsToFormValues(baseline);
    values.strategy = MatchingStrategy.TXNID_ORDER_NAME;

    const patch = buildSettingsPatch(values, baseline.matching, false);

    expect(patch.gateway).toBeUndefined();
    expect(patch.matching?.strategy).toBe(MatchingStrategy.TXNID_ORDER_NAME);
  });
});

describe("validateGatewaySave", () => {
  it("requires credentials when updating gateway", () => {
    const values = settingsToFormValues(baseline);
    expect(validateGatewaySave(values, true)).toContain("merchant key");
  });
});
