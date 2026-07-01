import pino from "pino";

import { getEnv } from "@/lib/env";

/**
 * Builds the Pino logger transport for the current environment.
 * @returns Pino transport options, or undefined for default stdout
 */
function buildTransport(): pino.TransportSingleOptions | undefined {
  const env = getEnv();

  if (env.NODE_ENV === "production" && env.BETTERSTACK_SOURCE_TOKEN) {
    return {
      target: "@logtail/pino",
      options: { sourceToken: env.BETTERSTACK_SOURCE_TOKEN },
    };
  }

  if (env.NODE_ENV !== "production") {
    return { target: "pino-pretty", options: { colorize: true } };
  }

  return undefined;
}

const transport = buildTransport();

/**
 * Application-wide structured logger.
 */
export const logger = pino({
  level: getEnv().NODE_ENV === "production" ? "info" : "debug",
  ...(transport ? { transport } : {}),
});

export type LogContext = {
  requestId?: string;
  shopId?: string;
  route?: string;
  durationMs?: number;
  statusCode?: number;
  eventType?: string;
};

/**
 * Creates a child logger with request-scoped context.
 * @param context - Structured log fields
 * @returns Child logger instance
 */
export function createRequestLogger(context: LogContext) {
  return logger.child(context);
}
