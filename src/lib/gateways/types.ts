import type {
  ConnectionStatus,
  GatewayEnvironment,
  GatewayProvider,
  WebhookHealth,
} from "@prisma/client";
import type { z } from "zod";

/** Outcome of validating provider API credentials. */
export type ConnectionTestResult = {
  valid: boolean;
  message?: string;
};

/** Webhook URLs keyed by event channel (provider-specific keys). */
export type WebhookUrlSet = Record<string, string>;

/** Resolved gateway target for an incoming webhook. */
export type WebhookResolveResult = {
  gatewayId: string;
  shopId: string;
  verificationSecret: string;
};

/** Context passed to webhook processing after verification. */
export type WebhookProcessContext = {
  shopId: string;
  gatewayId: string;
  eventType: string;
  payload: unknown;
};

/**
 * Provider-agnostic contract for payment gateway integrations.
 * Business logic must interact with gateways only via PaymentGatewayRegistry.
 */
export interface PaymentGatewayAdapter {
  readonly provider: GatewayProvider;

  /** Zod schema validating the credentials JSON shape for this provider. */
  getCredentialSchema(): z.ZodType<Record<string, string>>;

  /** Masks credential values for API responses (last four chars visible). */
  maskCredentials(credentials: Record<string, string>): Record<string, string>;

  /** Validates API credentials against the provider (no persistence). */
  testConnection(
    credentials: Record<string, string>,
    environment: GatewayEnvironment,
  ): Promise<ConnectionTestResult>;

  /** Returns webhook URLs the merchant copies into their provider dashboard. */
  getWebhookUrls(shopId: string): WebhookUrlSet;

  /**
   * Resolves shop/gateway and verification secret from an incoming webhook.
   * @returns Match details or null when the webhook cannot be attributed
   */
  resolveWebhookTarget(
    rawBody: string,
    headers: Headers,
    eventType: string,
  ): Promise<WebhookResolveResult | null>;

  /** Verifies webhook signature/hash before processing. */
  verifyWebhook(
    rawBody: string,
    headers: Headers,
    verificationSecret: string,
    eventType: string,
  ): boolean;

  /** Builds a stable idempotency key for deduplication. */
  buildIdempotencyKey(eventType: string, payload: unknown): string;

  /** Parses raw webhook body into a processable payload. */
  parseWebhookPayload(rawBody: string): unknown;

  /** Upserts domain records from a verified webhook payload. */
  processWebhook(context: WebhookProcessContext): Promise<void>;
}

/** Masked gateway view fields shared across API responses. */
export type GatewayStatusFields = {
  connectionStatus: ConnectionStatus;
  webhookHealth: WebhookHealth;
  environment: GatewayEnvironment;
  connectedAt: Date | null;
  lastWebhookAt: Date | null;
  lastSuccessfulWebhookAt: Date | null;
  lastFailedWebhookAt: Date | null;
  lastSyncAt: Date | null;
  lastSettlementImportAt: Date | null;
  lastRefundImportAt: Date | null;
  lastFailedEventAt: Date | null;
};
