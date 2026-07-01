import { PostHog } from "posthog-node";

import { getEnv } from "@/lib/env";

let client: PostHog | null = null;

/**
 * Returns the shared PostHog server client, or null when not configured.
 * @returns PostHog client instance
 */
function getClient(): PostHog | null {
  if (client) {
    return client;
  }
  const { POSTHOG_API_KEY, POSTHOG_HOST, NODE_ENV } = getEnv();
  if (!POSTHOG_API_KEY || NODE_ENV !== "production") {
    return null;
  }
  client = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST ?? "https://us.i.posthog.com",
  });
  return client;
}

/**
 * Captures a product analytics event (no-op when PostHog is not configured).
 * @param distinctId - User or shop identifier
 * @param event - Event name
 * @param properties - Optional event properties
 */
export function captureProductEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  const posthog = getClient();
  if (!posthog) {
    return;
  }
  posthog.capture({ distinctId, event, properties });
}

/**
 * Flushes buffered PostHog events (call before serverless function exit).
 * @returns Promise that resolves when the flush completes
 */
export async function flushProductEvents(): Promise<void> {
  await client?.shutdown();
}
