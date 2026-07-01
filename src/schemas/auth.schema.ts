import { Role } from "@prisma/client";
import { z } from "zod";

/**
 * Shopify session token (JWT) claims required for token exchange.
 * Extra claims are ignored; `jti`/`sid` are optional across token variants.
 */
export const sessionTokenClaimsSchema = z.object({
  iss: z.string().url(),
  dest: z.string().url(),
  aud: z.string().min(1),
  sub: z.string().min(1),
  exp: z.number(),
  nbf: z.number(),
  iat: z.number(),
  jti: z.string().optional(),
  sid: z.string().optional(),
});

export type SessionTokenClaims = z.infer<typeof sessionTokenClaimsSchema>;

/** Successful token-exchange response body returned by Shopify. */
export const tokenExchangeResponseSchema = z.object({
  access_token: z.string().min(1),
  scope: z.string(),
});

export type TokenExchangeResponse = z.infer<typeof tokenExchangeResponseSchema>;

/** Auth route success payload returned to the embedded app. */
export const shopifyAuthResultSchema = z.object({
  shopId: z.string(),
  shopDomain: z.string(),
});

export type ShopifyAuthResult = z.infer<typeof shopifyAuthResultSchema>;

// ---------------------------------------------------------------------------
// Standalone (finance portal) authentication
// ---------------------------------------------------------------------------

/** A single shop membership carried inside the session. */
export const sessionMembershipSchema = z.object({
  shopId: z.string(),
  role: z.nativeEnum(Role),
});

export type SessionMembership = z.infer<typeof sessionMembershipSchema>;

/** Standalone session payload stored in the signed cookie. */
export const sessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  memberships: z.array(sessionMembershipSchema),
});

export type Session = z.infer<typeof sessionSchema>;

/** Standalone login request body. */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Accept-invite request body. */
export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(8),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

/** Create-invite request body (OWNER role is not invitable). */
export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "VIEWER"]),
});

export type InviteInput = z.infer<typeof inviteSchema>;
