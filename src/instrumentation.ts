import { initSentry } from "@/lib/monitoring/sentry";

/**
 * Next.js instrumentation hook — runs once when the server starts.
 */
export async function register(): Promise<void> {
  initSentry();

  if (process.env.VERCEL_ENV === "production") {
    const { assertProductionRuntimeEnv } = await import("@/lib/env");
    assertProductionRuntimeEnv();
  }
}
