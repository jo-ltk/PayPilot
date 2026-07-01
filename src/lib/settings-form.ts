import {
  GatewayEnvironment,
  GatewayProvider,
  MatchingStrategy,
} from "@prisma/client";

import type {
  MatchingConfigView,
  MaskedGateway,
  SettingsResponse,
  SettingsUpdateInput,
} from "@/schemas/settings.schema";

/** Editable gateway fields shown in the settings form. */
export type GatewayFormValues = {
  provider: string;
  merchantKey: string;
  merchantSalt: string;
  merchantEmail: string;
  environment: GatewayEnvironment;
};

/** Editable matching fields shown in the settings form. */
export type MatchingFormValues = {
  strategy: MatchingStrategy;
  amountTolerancePaise: number;
  includeGatewayFees: boolean;
};

/** Combined settings form state. */
export type SettingsFormValues = GatewayFormValues & MatchingFormValues;

const DEFAULT_MATCHING: MatchingFormValues = {
  strategy: MatchingStrategy.UDF_ORDER_ID,
  amountTolerancePaise: 0,
  includeGatewayFees: false,
};

/**
 * Builds default form values from a settings API response.
 * @param settings - Masked settings payload
 * @returns Initial form values with secrets left blank
 */
export function settingsToFormValues(
  settings: SettingsResponse | undefined,
): SettingsFormValues {
  const gateway = settings?.gateway;
  const matching = settings?.matching;

  return {
    provider: gateway?.provider ?? GatewayProvider.EASEBUZZ,
    merchantKey: "",
    merchantSalt: "",
    merchantEmail: gateway?.merchantEmail ?? "",
    environment: gateway?.environment ?? GatewayEnvironment.SANDBOX,
    strategy: matching?.strategy ?? DEFAULT_MATCHING.strategy,
    amountTolerancePaise:
      matching?.amountTolerancePaise ?? DEFAULT_MATCHING.amountTolerancePaise,
    includeGatewayFees:
      matching?.includeGatewayFees ?? DEFAULT_MATCHING.includeGatewayFees,
  };
}

/**
 * Returns masked secret hints for display beside credential fields.
 * @param gateway - Masked gateway from the API
 * @returns Masked key/salt hints
 */
export function maskedSecretHints(gateway: MaskedGateway | null | undefined): {
  keyHint: string;
  saltHint: string;
} {
  return {
    keyHint: gateway?.keyMasked ?? "Not configured",
    saltHint: gateway?.saltMasked ?? "Not configured",
  };
}

/**
 * Builds a PATCH body from dirty form values.
 * @param values - Current form values
 * @param baseline - Baseline matching config from the API
 * @param includeGateway - Whether gateway credentials were entered
 * @returns Settings update payload
 */
export function buildSettingsPatch(
  values: SettingsFormValues,
  baseline: MatchingConfigView | null | undefined,
  includeGateway: boolean,
): SettingsUpdateInput {
  const matchingChanged =
    values.strategy !== (baseline?.strategy ?? MatchingStrategy.UDF_ORDER_ID) ||
    values.amountTolerancePaise !== (baseline?.amountTolerancePaise ?? 0) ||
    values.includeGatewayFees !== (baseline?.includeGatewayFees ?? false);

  const patch: SettingsUpdateInput = {};

  if (includeGateway) {
    patch.gateway = {
      key: values.merchantKey,
      salt: values.merchantSalt,
      merchantEmail: values.merchantEmail,
      environment: values.environment,
    };
  }

  if (matchingChanged || includeGateway) {
    patch.matching = {
      strategy: values.strategy,
      priority: baseline?.priority ?? [],
      fieldMapping: baseline?.fieldMapping ?? {},
      amountTolerancePaise: values.amountTolerancePaise,
      includeGatewayFees: values.includeGatewayFees,
    };
  }

  return patch;
}

/**
 * Detects whether form values differ from the loaded settings baseline.
 * @param values - Current form values
 * @param baseline - Loaded settings from the API
 * @returns True when there are unsaved edits
 */
export function hasUnsavedSettings(
  values: SettingsFormValues,
  baseline: SettingsResponse | undefined,
): boolean {
  const initial = settingsToFormValues(baseline);

  const gatewayDirty =
    values.merchantKey.length > 0 ||
    values.merchantSalt.length > 0 ||
    values.merchantEmail !== initial.merchantEmail ||
    values.environment !== initial.environment;

  const matchingDirty =
    values.strategy !== initial.strategy ||
    values.amountTolerancePaise !== initial.amountTolerancePaise ||
    values.includeGatewayFees !== initial.includeGatewayFees;

  return gatewayDirty || matchingDirty;
}

/**
 * Validates gateway credential fields before save.
 * @param values - Current form values
 * @param includeGateway - Whether gateway section is being updated
 * @returns Error message or null
 */
export function validateGatewaySave(
  values: SettingsFormValues,
  includeGateway: boolean,
): string | null {
  if (!includeGateway) {
    return null;
  }

  if (!values.merchantKey || !values.merchantSalt) {
    return "Enter merchant key and salt to update gateway credentials";
  }

  if (!values.merchantEmail) {
    return "Merchant email is required";
  }

  return null;
}
