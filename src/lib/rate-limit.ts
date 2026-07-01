import type { NextRequest } from "next/server";

import { RateLimitError } from "@/lib/api/errors";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

/** Default auth route limit: 10 requests per minute per client. */
export const AUTH_RATE_LIMIT = { limit: 10, windowMs: 60_000 };

/**
 * Resolves the client IP from proxy headers.
 * @param request - Incoming request
 * @returns Client IP or `unknown`
 */
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Checks whether a key is within the rate limit window.
 * @param key - Unique limiter key (e.g. route + IP)
 * @param limit - Max requests per window
 * @param windowMs - Window duration in milliseconds
 * @returns Whether the request is allowed
 */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count += 1;
  return false;
}

/**
 * Enforces rate limiting for an auth route; throws when exceeded.
 * @param request - Incoming request
 * @param route - Route label used in the limiter key
 * @throws {RateLimitError} When the client exceeds the limit (429)
 */
export function enforceAuthRateLimit(
  request: NextRequest,
  route: string,
): void {
  const key = `${route}:${clientIp(request)}`;
  if (isRateLimited(key, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs)) {
    throw new RateLimitError("Too many requests. Try again later.");
  }
}
