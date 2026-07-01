import { captureError } from "@/lib/monitoring/sentry";

type InngestFailureContext = {
  error: Error;
  event: { name: string; data?: unknown };
};

/**
 * Reports a failed Inngest function run to Sentry.
 * @param context - Failure context from Inngest
 */
export async function reportInngestFailure(
  context: InngestFailureContext,
): Promise<void> {
  captureError(context.error, {
    inngestEvent: context.event.name,
    inngestData: context.event.data,
  });
}
