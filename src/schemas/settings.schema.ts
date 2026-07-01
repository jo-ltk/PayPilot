import { GatewayEnvironment, MatchingStrategy } from "@prisma/client";
import { z } from "zod";

/** Easebuzz environment selector. */
export const gatewayEnvironmentSchema = z.nativeEnum(GatewayEnvironment);

/** Matching strategy selector. */
export const matchingStrategySchema = z.nativeEnum(MatchingStrategy);

/** Gateway credential update payload (plaintext secrets, encrypted at rest). */
export const gatewayUpdateSchema = z.object({
  key: z.string().min(1),
  salt: z.string().min(1),
  merchantEmail: z.string().email(),
  environment: gatewayEnvironmentSchema,
  isActive: z.boolean().optional(),
});

export type GatewayUpdateInput = z.infer<typeof gatewayUpdateSchema>;

/** Reconciliation matching config update payload. */
export const matchingUpdateSchema = z.object({
  strategy: matchingStrategySchema,
  priority: z.array(z.string()),
  fieldMapping: z.record(z.string(), z.string()),
  amountTolerancePaise: z.number().int().min(0),
  includeGatewayFees: z.boolean(),
});

export type MatchingUpdateInput = z.infer<typeof matchingUpdateSchema>;

/** Settings PATCH body — at least one section must be present. */
export const settingsUpdateSchema = z
  .object({
    gateway: gatewayUpdateSchema.optional(),
    matching: matchingUpdateSchema.optional(),
  })
  .refine((value) => value.gateway !== undefined || value.matching !== undefined, {
    message: "Provide gateway and/or matching settings",
  });

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

/** Gateway view with secrets masked (never exposes raw key/salt). */
export const maskedGatewaySchema = z.object({
  id: z.string(),
  provider: z.string(),
  keyMasked: z.string(),
  saltMasked: z.string(),
  merchantEmail: z.string(),
  environment: gatewayEnvironmentSchema,
  isActive: z.boolean(),
});

export type MaskedGateway = z.infer<typeof maskedGatewaySchema>;

/** Matching config view returned in settings responses. */
export const matchingConfigViewSchema = z.object({
  strategy: matchingStrategySchema,
  priority: z.array(z.string()),
  fieldMapping: z.record(z.string(), z.string()),
  amountTolerancePaise: z.number().int(),
  includeGatewayFees: z.boolean(),
});

export type MatchingConfigView = z.infer<typeof matchingConfigViewSchema>;

/** Settings GET/PATCH response payload. */
export const settingsResponseSchema = z.object({
  gateway: maskedGatewaySchema.nullable(),
  matching: matchingConfigViewSchema.nullable(),
});

export type SettingsResponse = z.infer<typeof settingsResponseSchema>;

/** Credential validation response payload. */
export const validateResponseSchema = z.object({
  valid: z.boolean(),
  message: z.string().optional(),
  webhookUrls: z.object({
    transaction: z.string(),
    payout: z.string(),
    refund: z.string(),
  }),
});

export type ValidateResponse = z.infer<typeof validateResponseSchema>;
