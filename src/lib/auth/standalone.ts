import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";

import { AuthError } from "@/lib/api/errors";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { sessionSchema, type Session } from "@/schemas/auth.schema";

/** Name of the standalone session cookie. */
export const SESSION_COOKIE = "sf_session";

const SESSION_TTL = "7d";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Returns the HMAC key used to sign session tokens.
 * @returns Encoded SESSION_SECRET
 * @throws {Error} When SESSION_SECRET is not configured
 */
function getSessionSecret(): Uint8Array {
  const { SESSION_SECRET } = getEnv();
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return new TextEncoder().encode(SESSION_SECRET);
}

/**
 * Creates a signed session JWT for a finance user.
 * @param session - Session payload (user + memberships)
 * @returns Signed session token
 */
export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({
    userId: session.userId,
    email: session.email,
    memberships: session.memberships,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSessionSecret());
}

/**
 * Verifies a session token and returns its payload.
 * @param token - Signed session token
 * @returns Verified session payload
 * @throws When the token is invalid or expired
 */
export async function verifySession(token: string): Promise<Session> {
  const { payload } = await jwtVerify(token, getSessionSecret(), {
    algorithms: ["HS256"],
  });
  return sessionSchema.parse(payload);
}

/**
 * Authenticates a finance user by email and password.
 * @param email - User email
 * @param password - Plaintext password
 * @returns Session payload with accepted memberships
 * @throws {AuthError} When credentials are invalid
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<Session> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { acceptedAt: { not: null } },
        select: { shopId: true, role: true },
      },
    },
  });
  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password");
  }

  return {
    userId: user.id,
    email: user.email,
    memberships: user.memberships,
  };
}

/**
 * Sets the httpOnly session cookie on a response.
 * @param response - Response to mutate
 * @param token - Signed session token
 */
export function setSessionCookie(
  response: NextResponse,
  token: string,
): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie on a response.
 * @param response - Response to mutate
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
