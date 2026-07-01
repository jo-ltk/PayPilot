import { randomBytes } from "crypto";

import { Role } from "@prisma/client";

import { NotFoundError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import type { Session } from "@/schemas/auth.schema";

export type CreateInviteInput = {
  shopId: string;
  email: string;
  role: Role;
};

export type AcceptInviteData = {
  token: string;
  name: string;
  password: string;
};

/**
 * Creates (or refreshes) a team invite for a shop.
 *
 * Ensures a pending User exists for the email and upserts a ShopMember with a
 * fresh invite token. The token is shared with the invitee out-of-band.
 * @param input - Shop, email, and role to grant
 * @returns The generated invite token
 */
export async function createInvite(
  input: CreateInviteInput,
): Promise<{ inviteToken: string }> {
  const inviteToken = randomBytes(24).toString("hex");

  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {},
    create: { email: input.email, name: input.email, passwordHash: "" },
  });

  await prisma.shopMember.upsert({
    where: { shopId_userId: { shopId: input.shopId, userId: user.id } },
    update: {
      role: input.role,
      inviteToken,
      invitedAt: new Date(),
      acceptedAt: null,
    },
    create: {
      shopId: input.shopId,
      userId: user.id,
      role: input.role,
      inviteToken,
      invitedAt: new Date(),
    },
  });

  return { inviteToken };
}

/**
 * Accepts a team invite, setting the user's name and password.
 * @param input - Invite token plus the user's chosen name and password
 * @returns A session for the now-active user
 * @throws {NotFoundError} When the invite token is invalid
 */
export async function acceptInvite(input: AcceptInviteData): Promise<Session> {
  const member = await prisma.shopMember.findUnique({
    where: { inviteToken: input.token },
    include: { user: true },
  });
  if (!member) {
    throw new NotFoundError("Invalid or expired invite token");
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.user.update({
    where: { id: member.userId },
    data: { name: input.name, passwordHash },
  });
  await prisma.shopMember.update({
    where: { id: member.id },
    data: { acceptedAt: new Date(), inviteToken: null },
  });

  const memberships = await prisma.shopMember.findMany({
    where: { userId: member.userId, acceptedAt: { not: null } },
    select: { shopId: true, role: true },
  });

  return { userId: member.userId, email: member.user.email, memberships };
}
