import { randomUUID } from "crypto";

import { jsonSuccess, withErrorHandling } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/standalone";

const ROUTE = "/api/auth/logout";

/**
 * Clears the standalone session cookie.
 * @returns Logout acknowledgement
 */
export async function POST(): Promise<Response> {
  return withErrorHandling({ requestId: randomUUID(), route: ROUTE }, async () => {
    const response = jsonSuccess({ success: true });
    clearSessionCookie(response);
    return response;
  });
}
