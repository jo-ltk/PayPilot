import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url().optional(),
  SHOPIFY_API_KEY: z.string().optional(),
  SHOPIFY_API_SECRET: z.string().optional(),
  SCOPES: z.string().optional(),
  HOST: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  SENTRY_DSN: z.string().url().optional(),
  BETTERSTACK_SOURCE_TOKEN: z.string().min(1).optional(),
  POSTHOG_API_KEY: z.string().min(1).optional(),
  POSTHOG_HOST: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates and returns environment variables.
 * @returns Parsed environment configuration
 * @throws {z.ZodError} When required variables are invalid
 */
export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}

export type ShopifyAuthEnv = {
  apiKey: string;
  apiSecret: string;
  scopes: string;
  host: string;
};

/**
 * Returns Shopify auth configuration, asserting required values are present.
 * @returns Non-optional Shopify API credentials and host
 * @throws {Error} When any required Shopify variable is missing
 */
export function requireShopifyAuthEnv(): ShopifyAuthEnv {
  const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, HOST } = getEnv();
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SCOPES || !HOST) {
    throw new Error(
      "Missing Shopify env vars (SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, HOST)",
    );
  }
  return {
    apiKey: SHOPIFY_API_KEY,
    apiSecret: SHOPIFY_API_SECRET,
    scopes: SCOPES,
    host: HOST,
  };
}

/**
 * Validates environment for production runtime.
 * @throws {Error} When required production variables are missing
 */
export function requireProductionEnv(): Env {
  const productionSchema = envSchema.extend({
    DATABASE_URL: z.string().url(),
    SHOPIFY_API_KEY: z.string().min(1),
    SHOPIFY_API_SECRET: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(32),
    SESSION_SECRET: z.string().min(32),
  });

  return productionSchema.parse(process.env);
}

/**
 * Asserts required production env vars at runtime (Vercel production only).
 * @throws {z.ZodError} When required variables are missing or invalid
 */
export function assertProductionRuntimeEnv(): void {
  requireProductionEnv();
}
