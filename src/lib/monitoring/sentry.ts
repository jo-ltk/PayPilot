import * as Sentry from "@sentry/nextjs";

import { getEnv } from "@/lib/env";

let initialized = false;

/**
 * Initializes Sentry when a DSN is configured (production/staging).
 */
export function initSentry(): void {
  if (initialized) {
    return;
  }
  const { SENTRY_DSN, NODE_ENV } = getEnv();
  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    enabled: NODE_ENV === "production",
    tracesSampleRate: 0.1,
  });
  initialized = true;
}

/**
 * Reports an error to Sentry with optional structured context.
 * @param error - Caught error value
 * @param context - Extra fields attached to the event
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const { SENTRY_DSN, NODE_ENV } = getEnv();
  if (!SENTRY_DSN || NODE_ENV !== "production") {
    return;
  }
  if (!initialized) {
    initSentry();
  }
  Sentry.captureException(error, { extra: context });
}
