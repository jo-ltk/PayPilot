import { randomUUID } from "crypto";

import type { NextRequest } from "next/server";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import {
  authenticateUser,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/standalone";
import { captureProductEvent } from "@/lib/monitoring/posthog";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/schemas/auth.schema";

const ROUTE = "/api/auth/login";

/**
 * Authenticates a finance user and issues an httpOnly session cookie.
 * @param request - Incoming login request
 * @returns User identity and shop memberships
 */
export async function POST(request: NextRequest): Promise<Response> {
  return withErrorHandling({ requestId: randomUUID(), route: ROUTE }, async () => {
    enforceAuthRateLimit(request, ROUTE);
    const { email, password } = await parseJsonBody(request, loginSchema);
    const session = await authenticateUser(email, password);
    const token = await createSessionToken(session);

    captureProductEvent(session.userId, "finance_login_success", {
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
