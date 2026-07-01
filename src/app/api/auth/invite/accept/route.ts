import { randomUUID } from "crypto";

import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { acceptInvite } from "@/lib/auth/invite";
import { createSessionToken, setSessionCookie } from "@/lib/auth/standalone";
import { captureProductEvent } from "@/lib/monitoring/posthog";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { acceptInviteSchema } from "@/schemas/auth.schema";

const ROUTE = "/api/auth/invite/accept";

/**
 * Accepts a team invite, activates the user, and logs them in.
 * @param request - Incoming accept-invite request
 * @returns User identity and shop memberships
 */
export async function POST(request: NextRequest): Promise<Response> {
  return withErrorHandling({ requestId: randomUUID(), route: ROUTE }, async () => {
    enforceAuthRateLimit(request, ROUTE);
    const input = await parseJsonBody(request, acceptInviteSchema);
    const session = await acceptInvite(input);
    const token = await createSessionToken(session);

    captureProductEvent(session.userId, "invite_accepted", {
      shopCount: session.memberships.length,
    });

    const response = jsonSuccess({
      userId: session.userId,
      email: session.email,
      shops: session.memberships,
    });
    setSessionCookie(response, token);
    return response;
  });
}
