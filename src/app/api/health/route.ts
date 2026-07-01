import { randomUUID } from "crypto";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { getHealthStatus, healthStatusCode } from "@/lib/health";

/**
 * Health check endpoint for liveness and readiness probes.
 *
 * Returns `503` when the database probe fails so load balancers can drain
 * unhealthy instances.
 * @returns Service status envelope with dependency checks
 */
export async function GET(): Promise<Response> {
  return withErrorHandling(
    { requestId: randomUUID(), route: "/api/health" },
    async () => {
      const health = await getHealthStatus();
      return jsonSuccess(health, { status: healthStatusCode(health) });
    },
  );
}
